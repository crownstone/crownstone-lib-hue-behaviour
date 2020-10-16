import {CrownstoneHue, Light} from "../index";
import {eventBus} from "../util/EventBus";
import {SwitchBehaviour} from "./behaviour/SwitchBehaviour";
import {ON_DUMB_HOUSE_MODE_SWITCH} from "../constants/EventConstants";
import {BehaviourSupport} from "./behaviour/BehaviourSupport";
import {
  EventUnsubscriber, HueFullState,
  HueLightState,
  PrioritizedList,
  SphereLocation,
  StateUpdate
} from "../declarations/declarations";
import {BehaviourAggregatorUtil} from "./BehaviourAggregatorUtil";
import {HueBehaviourWrapper} from "../declarations/behaviourTypes";

const POLLING_RATE = 500;
const SWITCH_STATE_OVERRIDE = "SWITCH_STATE_OVERRIDE";
const DIM_STATE_OVERRIDE = "DIM_STATE_OVERRIDE";
const NO_OVERRIDE = "NO_OVERRIDE";
const delay = ms => {
  return new Promise(resolve => setTimeout(resolve, ms));
};


//TODO CHANGE
export class BehaviourAggregator {
  private running: boolean = false;
  behaviours: SwitchBehaviour[] = [];
  pollingRate: number;
  light: Light;
  unsubscribe: EventUnsubscriber;
  dumbHouseModeActive: boolean = false;
  prioritizedBehaviour: SwitchBehaviour = undefined;
  timestamp = 0;
  currentState: HueLightState;
  override: string = NO_OVERRIDE;

  constructor(light) {
    this.light = light;
    this.unsubscribe = eventBus.subscribe(ON_DUMB_HOUSE_MODE_SWITCH, this._onDumbHouseModeSwitch.bind(this));
  }

  init(): void {
    this.running = true;
  }

  stop(): void {
    this.running = false;
  }

  cleanup(): void {
    this.unsubscribe();
    for (const behaviour of this.behaviours) {
      behaviour.cleanup();
    }
  }


  addBehaviour(behaviour: HueBehaviourWrapper, sphereLocation: SphereLocation): void {
    this.behaviours.push(new SwitchBehaviour(behaviour, sphereLocation));
  }

  removeBehaviour(cloudId: string): void {
    for (let i = 0; i < this.behaviours.length; i++) {
      if (this.behaviours[i].behaviour.cloudId === cloudId) {
        this.behaviours[i].cleanup();
        this.behaviours.splice(i, 1);
        break;
      }
    }
  }

  updateBehaviour(behaviour: HueBehaviourWrapper): void {
    for (let i = 0; i < this.behaviours.length; i++) {
      if (this.behaviours[i].behaviour.cloudId === behaviour.cloudId) {
        this.behaviours[i].behaviour = behaviour;
        break;
      }
    }
  }

  _onDumbHouseModeSwitch(data): void {
    this.dumbHouseModeActive = data;
  }


  async _handleBehaviours() {
    const oldBehaviour = this.prioritizedBehaviour;
    const newBehaviour = this.prioritizedBehaviour;
    if (newBehaviour === undefined && oldBehaviour === undefined) {
      this.override = NO_OVERRIDE;
      return;
    }
    if (oldBehaviour !== undefined && newBehaviour !== undefined) {
      //Normal behaviour switch.
      if (newBehaviour.behaviour.cloudId !== oldBehaviour.behaviour.cloudId) {
        if (this.override === NO_OVERRIDE) {
          await this._setNewBehaviour(newBehaviour);
        } else if(this.override === SWITCH_STATE_OVERRIDE){

        }
      }
      return;
    }

    //Light is on, but dimmed, user leaves room/behaviour deactivates  >  light should still turn off.
    if (oldBehaviour !== undefined && newBehaviour === undefined) {
      if (this.override === DIM_STATE_OVERRIDE) {
        await this._setNewBehaviour(newBehaviour);
      } else if (this.override === SWITCH_STATE_OVERRIDE) {
        this.override = NO_OVERRIDE;
        return;
      }
    }

    if (oldBehaviour === undefined && newBehaviour !== undefined) {
      await this._setNewBehaviour(newBehaviour);
    }

  }

  async _setNewBehaviour(behaviour: SwitchBehaviour) {
    this.override = NO_OVERRIDE;
    this.prioritizedBehaviour = behaviour;
    await this.light.setState(this.getComposedState());
    this.currentState = this.getComposedState();
  }

  /** Returns the composed state of the active and prioritized behaviour.
   *
   */
  getComposedState(): HueLightState {
    return (this.prioritizedBehaviour !== undefined) ? this.prioritizedBehaviour.getComposedState() : {on: false}
  }


  lightStateChanged(state: HueFullState) {
    const composedState = this.getComposedState();

    //Light gets turned on, behaviour still active
    if (this.prioritizedBehaviour !== undefined && !this.currentState.on && state.on) {
      this.light.setState(this.prioritizedBehaviour.getComposedState());
      this.currentState = this.getComposedState();
      this.override = NO_OVERRIDE;
      return;
    } else if (composedState.on !== state.on) {
      this.override = SWITCH_STATE_OVERRIDE
    } else if (composedState.on === state.on && composedState.bri !== state.bri) {
      this.override = DIM_STATE_OVERRIDE;
    } else {
      this.override = NO_OVERRIDE;
    }
    this.currentState = {on: state.on, bri: state.bri};
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

