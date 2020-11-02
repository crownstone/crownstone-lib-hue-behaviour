import {Light} from "..";
import {eventBus} from "../util/EventBus";
import {SwitchBehaviour} from "./behaviour/SwitchBehaviour";
import {ON_DUMB_HOUSE_MODE_SWITCH} from "../constants/EventConstants";
import {
  BehaviourAggregatorUtil,
  DIM_STATE_OVERRIDE,
  NO_OVERRIDE,
  AGGREGATOR_POLLING_RATE,
  SWITCH_STATE_OVERRIDE
} from "./BehaviourAggregatorUtil";
import {TwilightPrioritizer} from "./TwilightPrioritizer";
import {SwitchBehaviourPrioritizer} from "./SwitchBehaviourPrioritizer";
import {Twilight} from "./behaviour/Twilight";
import Timeout = NodeJS.Timeout;
import {BehaviourUtil} from "./behaviour/BehaviourUtil";
import {lightUtil} from "../util/LightUtil";
import {GenericUtil} from "../util/GenericUtil";


export class BehaviourAggregator {
  private running: boolean = false;
  twilightPrioritizer = new TwilightPrioritizer();
  switchBehaviourPrioritizer = new SwitchBehaviourPrioritizer();
  unsubscribe: EventUnsubscriber;
  dumbHouseModeActive: boolean = false;
  aggregatedBehaviour: SwitchBehaviour | Twilight = undefined;
  timestamp = 0;
  currentLightState: HueLightState;  // State of the light.
  override: string = NO_OVERRIDE;
  intervalId: Timeout;
  updateCallBack;

  constructor(callback, state) {
    this.updateCallBack = callback;
    this.currentLightState = GenericUtil.deepCopy(state);

    this.unsubscribe = eventBus.subscribe(ON_DUMB_HOUSE_MODE_SWITCH, this._onDumbHouseModeSwitch.bind(this));
  }

  /** Starts the aggregator's loop.
   *
   */
  init(): void {
    this.running = true;
    this.intervalId = setInterval(async () => {
      await this._loop();
    }, AGGREGATOR_POLLING_RATE);
  }

  /** Cleans up the subscriptions from the eventbus for the aggregator and it's behaviours.
   *
   */
  cleanup(): void {
    this.running = false;
    clearInterval(this.intervalId);
    this.unsubscribe();
    this.switchBehaviourPrioritizer.cleanup();
  }

  async _loop() {
    this.timestamp = Date.now();
    this.switchBehaviourPrioritizer.tick(this.timestamp);
    this.twilightPrioritizer.tick(this.timestamp);
    console.log("PRIORITIZED!")
    await this._handleBehaviours();

    if (this.dumbHouseModeActive) {
      this._setOverrideOnLightStateChange(this.currentLightState);
    }

  }


  addBehaviour(behaviour: HueBehaviourWrapper, sphereLocation: SphereLocation): void {
    if (behaviour.type === "BEHAVIOUR") {
      this.switchBehaviourPrioritizer.addBehaviour(behaviour, sphereLocation);
    } else if (behaviour.type === "TWILIGHT") {
      this.twilightPrioritizer.addBehaviour(behaviour, sphereLocation);
    }
  }

  removeBehaviour(cloudId: string): void {
    this.twilightPrioritizer.removeBehaviour(cloudId);
    this.switchBehaviourPrioritizer.removeBehaviour(cloudId);
  }

  updateBehaviour(behaviour: HueBehaviourWrapper): void {
    if (behaviour.type === "BEHAVIOUR") {
      this.switchBehaviourPrioritizer.updateBehaviour(behaviour);
    } else if (behaviour.type === "TWILIGHT") {
      this.twilightPrioritizer.updateBehaviour(behaviour);
    }
  }

  _onDumbHouseModeSwitch(data: boolean): void {
    this.dumbHouseModeActive = data;
  }

  _getAggregatedBehaviour() {
    if (typeof (this.twilightPrioritizer.prioritizedBehaviour) === "undefined" && typeof (this.switchBehaviourPrioritizer.prioritizedBehaviour) === "undefined") {
      return undefined;
    } else if (typeof (this.twilightPrioritizer.prioritizedBehaviour) === "undefined" && typeof (this.switchBehaviourPrioritizer.prioritizedBehaviour) !== "undefined") {
      return this.switchBehaviourPrioritizer.prioritizedBehaviour;
    } else if (typeof (this.twilightPrioritizer.prioritizedBehaviour) !== "undefined" && typeof (this.switchBehaviourPrioritizer.prioritizedBehaviour) === "undefined") {
      return this.twilightPrioritizer.prioritizedBehaviour;
    } else {
      return BehaviourAggregatorUtil.compareByDimPercentage(this.twilightPrioritizer.prioritizedBehaviour, this.switchBehaviourPrioritizer.prioritizedBehaviour);
    }
  }

  async _handleBehaviours() {
    const oldBehaviour = this.aggregatedBehaviour;
    const newBehaviour = this._getAggregatedBehaviour();
    this.aggregatedBehaviour = newBehaviour;

    this.checkIfAllBehavioursAreInactive();

    if (typeof (newBehaviour) !== "undefined") {
      if (newBehaviour.behaviour.type === "TWILIGHT") {
        await this._twilightHandling(newBehaviour);
      } else if (newBehaviour.behaviour.type === "BEHAVIOUR" && this.override === NO_OVERRIDE && typeof (oldBehaviour) !== "undefined" && oldBehaviour.behaviour.cloudId != newBehaviour.behaviour.cloudId) {
        await this._activateNewBehaviour();
      }
    }

    //Light is on, but dimmed, user leaves room/behaviour deactivates  >  light should still turn off.
    if (typeof (oldBehaviour) !== "undefined" && typeof (newBehaviour) === "undefined") {
      await this.onBehaviourDeactivation();
    }

    if (typeof (oldBehaviour) === "undefined" && typeof (newBehaviour) !== "undefined") {
      await this._activateNewBehaviour();
      this.override = NO_OVERRIDE; //oldBehaviour can't be undefined with an override set.

    }
  }

  /** Separate case for twilights.
   * Checks if Twilight dims or not
   * @param behaviour
   */
  async _twilightHandling(behaviour: Twilight): Promise<void> {
    if (this.currentLightState.on && this.currentLightState.bri > BehaviourUtil.mapBehaviourActionToHue(behaviour.behaviour.data.action.data)) {
      await this._activateNewBehaviour();
    }
  }

  /** Checks if all behaviours are inactive and then removes override.
   * prioritizedBehaviour will be undefined when all are inactive.
   */
  checkIfAllBehavioursAreInactive() {
    if (typeof (this.switchBehaviourPrioritizer.prioritizedBehaviour) === "undefined") {
      this.override = NO_OVERRIDE;
    }
  }

  /** Called when behaviour deactivates.
   *  Could be user leaving a room or just deactivation.
   * @param behaviour
   */
  async onBehaviourDeactivation(): Promise<void> {
    if (this.override === DIM_STATE_OVERRIDE) {
      await this._activateNewBehaviour();
      this.override = NO_OVERRIDE; //STATE MATCH
    } else if (this.override === SWITCH_STATE_OVERRIDE) {
      this.override = NO_OVERRIDE;
      await this._activateNewBehaviour();
    } else {
      await this._activateNewBehaviour();
    }
  }

  async _activateNewBehaviour() {
    if (!this.dumbHouseModeActive) {
      await this._setLightState();
    }
  }

  async _setLightState() {
    console.log("HELLO!")
    const state = this.getComposedState()
    this.currentLightState = GenericUtil.deepCopy(state);
    await this.updateCallBack(state);
  }

  /** Returns the composed state of the active and prioritized behaviour.
   *
   */
  getComposedState(): HueLightState {
    return (typeof (this.aggregatedBehaviour) !== "undefined") ? this.aggregatedBehaviour.getComposedState() : {on: false};
  }


  async lightStateChanged(state: HueFullState) {
    if (!this.dumbHouseModeActive) {
      if (await this._onSwitchOnWithActiveBehaviour(state)) {
        return;
      }
    }

    this._setOverrideOnLightStateChange(state)
    this.currentLightState = BehaviourUtil.mapStateObjectToTheOther(state, this.currentLightState);
  }

  /** Sets the override variable based on passed light state.
   *
   * @param state
   */
  _setOverrideOnLightStateChange(state): void {
    const composedState = this.getComposedState();
    console.log(composedState);
    if (composedState.on !== state.on && typeof (this.switchBehaviourPrioritizer.prioritizedBehaviour) !== "undefined") {
      this.override = SWITCH_STATE_OVERRIDE
      console.log("switch")

    } else if (composedState.on === state.on && composedState.bri !== state.bri && typeof (this.switchBehaviourPrioritizer.prioritizedBehaviour) !== "undefined") {
      this.override = DIM_STATE_OVERRIDE;
      console.log("DIM")
    } else {
      this.override = NO_OVERRIDE;
      console.log("NO")
    }
    console.log(this.override)
  }

  /** If a light turns manually on while behaviour is active, behaviour's state will be used as light's state.
   *
   * @param state
   *
   * @returns True light state is changed
   */
  async _onSwitchOnWithActiveBehaviour(state: HueFullState): Promise<boolean> {
    //Light gets turned on, behaviour still active
    if (typeof (this.aggregatedBehaviour) !== "undefined" && !this.currentLightState.on && state.on) {
      await this._setLightState();
      this.override = NO_OVERRIDE;
      return true;
    }
    return false;
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

