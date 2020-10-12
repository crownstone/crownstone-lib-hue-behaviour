import {CrownstoneHue, Light} from "../index";
import {eventBus} from "../util/EventBus";
import {Behaviour} from "./behaviour/Behaviour";
import {ON_DUMB_HOUSE_MODE_SWITCH} from "../constants/EventConstants";
import {BehaviourSupport} from "./behaviour/BehaviourSupport";
import {EventUnsubscriber, PrioritizedList, SphereLocation} from "../declarations/declarations";
import {BehaviourAggregatorUtil} from "./BehaviourAggregatorUtil";

const POLLING_RATE = 500;

const delay = ms => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export class BehaviourAggregator {
  private running: boolean = false;
  behaviours: Behaviour[] = [];
  pollingRate: number;
  isInOverride: boolean = false;
  light: Light;
  unsubscribe: EventUnsubscriber;
  dumbHouseModeActive: boolean = false;
  prioritizedBehaviour: Behaviour = undefined;
  timestamp = 0;

  constructor(light) {
    this.light = light;
    this.unsubscribe = eventBus.subscribe(ON_DUMB_HOUSE_MODE_SWITCH, this._onDumbHouseModeSwitch.bind(this));
  }

  init() {
    this.running = true;
  }

  stop() {
    this.running = false;
  }

  cleanup() {
    this.unsubscribe();
    for (const behaviour of this.behaviours) {
      behaviour.cleanup();
    }
  }


  addBehaviour(behaviour: HueBehaviourWrapper, sphereLocation: SphereLocation) {
    this.behaviours.push(new Behaviour(behaviour, sphereLocation));
  }

  removeBehaviour(cloudId: string) {
    for (let i = 0; i < this.behaviours.length; i++) {
      if (this.behaviours[i].behaviour.cloudId === cloudId) {
        this.behaviours[i].cleanup();
        this.behaviours.splice(i, 1);
        break;
      }
    }
  }

  updateBehaviour(behaviour: HueBehaviourWrapper) {
    for (let i = 0; i < this.behaviours.length; i++) {
      if (this.behaviours[i].behaviour.cloudId === behaviour.cloudId) {
        this.behaviours[i].behaviour = behaviour;
        break;
      }
    }
  }

  _onDumbHouseModeSwitch(data) {
    this.dumbHouseModeActive = data;
  }

  async _loop() {
    try {
      if (!this.dumbHouseModeActive) {
        this.timestamp = Date.now();
        this._sendTickToBehaviours();
        await this._pollLight();
        this._checkBehaviours();
      };
      await delay(this.pollingRate);
      return (this.running) ? this._loop() : "STOPPED";
    } catch (err) {
      // eventBus.emit("error", err);
      return (this.running) ? this._loop() : "STOPPED";
    }
  }
  _sendTickToBehaviours(){
    for(const behaviour of this.behaviours){
      behaviour.tick(this.timestamp);
    }
  }

  _checkBehaviours() {
    if (this.behaviours === []) {
      this.prioritizedBehaviour = undefined;
      return;
    }

    let activeBehaviours = [];
    let activeTwilight = [];
    this.behaviours.forEach(behaviour => {
      if (behaviour.isActive) {
        if (behaviour.behaviour.type === "BEHAVIOUR") {
          activeBehaviours.push(behaviour);
        } else if (behaviour.behaviour.type === "TWILIGHT") {
          activeTwilight.push(behaviour);
        }
      }
    })
    const prioritizedBehaviour = this._getPrioritizedBehaviour(activeBehaviours);
    const prioritizedTwilight = this._getPrioritizedTwilight(activeTwilight);
    this.prioritizedBehaviour = BehaviourAggregatorUtil.getActiveBehaviour(prioritizedBehaviour,prioritizedTwilight)

  }


  /** Returns the prioritized behaviour
   *
   * @param behaviours - a list of active behaviours to be iterated through.
   * @Returns a Behaviour or undefined when given list was empty.
   */
  _getPrioritizedBehaviour(behaviours: Behaviour[]):Behaviour {
    if (behaviours === []) {
      return undefined;
    } else {
      const prioritizedList = BehaviourAggregatorUtil.prioritizeBehaviours(behaviours);
      return BehaviourAggregatorUtil.getBehaviourWithHighestPriority(prioritizedList);
    }
  }



  /** Returns the prioritized twilight
   * Uses filterByStartingTime to get the behaviour that started as last
   * @param behaviours - a list of active twilights to be iterated through.
   * @Returns a twilight or undefined when given list was empty.
   */
  _getPrioritizedTwilight(twilights: Behaviour[]) {
    if (twilights === []) {
      return undefined;
    } else {
      return BehaviourAggregatorUtil.filterByStartingTime(twilights);
    }
  }

  /** Returns the composed state of the active and prioritized behaviour.
   * 
   */
  getComposedState(){
    return (this.prioritizedBehaviour !== undefined)?this.prioritizedBehaviour.getComposedState():{};
  }




  async _pollLight() {
    const prevLightState = this.light.getState();
    await this.light.renewState();
    if (JSON.stringify(this.light.getState()) !== JSON.stringify(prevLightState)) {
      debugPrintStateDifference(prevLightState, this.light.getState());
      eventBus.emit("lightStateChanged", this.light);  //todo change else it will be called to all aggregators
    }
  }

  _errorHandling(error) {
    console.log(error);
  }

}


function debugPrintStateDifference(oldS, newS) {
  let printableState = {};

  Object.keys(oldS).forEach(key => {
    if (JSON.stringify(oldS[key]) !== JSON.stringify(newS[key])) {
      printableState[key] = {old: oldS[key], new: newS[key]};
    }
  });
  console.log(printableState);
}

