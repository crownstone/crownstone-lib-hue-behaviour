import {Light} from "../../../crownstone-lib-hue";
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
  private initialized: boolean = false;
  twilightPrioritizer = new TwilightPrioritizer();
  switchBehaviourPrioritizer = new SwitchBehaviourPrioritizer();
  unsubscribeDumbHouseModeEvent: EventUnsubscriber;
  dumbHouseModeActive: boolean = false;
  aggregatedBehaviour: SwitchBehaviour | Twilight = undefined;
  timestamp = 0;
  currentLightState: HueLightState;  // State of the light.
  override: string = NO_OVERRIDE;
  intervalId: Timeout;
  updateStateCallback: (state) => {};

  constructor(callback, state) {
    this.updateStateCallback = callback;
    this.currentLightState = GenericUtil.deepCopy(state);
    this.unsubscribeDumbHouseModeEvent = eventBus.subscribe(ON_DUMB_HOUSE_MODE_SWITCH, this.onDumbHouseModeSwitch.bind(this));
  }

  /** Starts the aggregator's loop.
   *
   */
  init(): void {
    if (this.initialized) { return; }
    this.initialized = true;
      this.intervalId = setInterval(async () => {
        await this._loop();
      }, AGGREGATOR_POLLING_RATE);
  }

  /** Cleans up the subscriptions from the eventbus for the aggregator and it's behaviours.
   *
   */
  cleanup(): void {
    clearInterval(this.intervalId);
    this.unsubscribeDumbHouseModeEvent();
    this.switchBehaviourPrioritizer.cleanup();
    this.twilightPrioritizer.cleanup();
  }

  async _loop():Promise<void> {
    this.timestamp = Date.now();
    this.switchBehaviourPrioritizer.tick(this.timestamp);
    this.twilightPrioritizer.tick(this.timestamp);
    await this._handleBehaviours();

    if (this.dumbHouseModeActive) {
      this._setOverrideOnLightStateChange(this.currentLightState);
    }
  }


  setBehaviour(behaviour: HueBehaviourWrapper, sphereLocation: SphereLocation): number {
    this._checkIfBehaviourIsActive(behaviour);
    if (behaviour.type === "BEHAVIOUR") {
      return this.switchBehaviourPrioritizer.setBehaviour(behaviour, sphereLocation);
    }
    else if (behaviour.type === "TWILIGHT") {
      return this.twilightPrioritizer.setBehaviour(behaviour, sphereLocation);
    }
  }

  removeBehaviour(cloudId: string): void {
    this.twilightPrioritizer.removeBehaviour(cloudId);
    this.switchBehaviourPrioritizer.removeBehaviour(cloudId);
  }


  onDumbHouseModeSwitch(data: boolean): void {
    this.dumbHouseModeActive = data;
  }

  _getAggregatedBehaviour():SwitchBehaviour|Twilight {
    if (this.twilightPrioritizer.prioritizedBehaviour === undefined && this.switchBehaviourPrioritizer.prioritizedBehaviour === undefined) {
      return undefined;
    }
    else if (this.twilightPrioritizer.prioritizedBehaviour === undefined && this.switchBehaviourPrioritizer.prioritizedBehaviour !== undefined) {
      return this.switchBehaviourPrioritizer.prioritizedBehaviour;
    }
    else if (this.twilightPrioritizer.prioritizedBehaviour !== undefined && this.switchBehaviourPrioritizer.prioritizedBehaviour === undefined) {
      return this.twilightPrioritizer.prioritizedBehaviour;
    }
    else {
      return BehaviourAggregatorUtil.compareByDimPercentage(this.twilightPrioritizer.prioritizedBehaviour, this.switchBehaviourPrioritizer.prioritizedBehaviour);
    }
  }

  async _handleBehaviours():Promise<void> {
    const oldBehaviour = this.aggregatedBehaviour;
    const newBehaviour = this._getAggregatedBehaviour();
    this.aggregatedBehaviour = newBehaviour;

    this._checkIfAllBehavioursAreInactive();
    this._checkIfStateMatchesWithNewBehaviour();
    if (newBehaviour !== undefined) {
      if (newBehaviour.behaviour.type === "TWILIGHT") {
        await this._twilightHandling(newBehaviour);
      }
      else if (newBehaviour.behaviour.type === "BEHAVIOUR" && this.override === NO_OVERRIDE
        && oldBehaviour !== undefined && oldBehaviour.behaviour.cloudId != newBehaviour.behaviour.cloudId) {
        await this._activateNewBehaviour();
      }
    }

    //Light is on, but dimmed, user leaves room/behaviour deactivates  >  light should still turn off.
    if (oldBehaviour !== undefined && newBehaviour === undefined) {
      await this._onBehaviourDeactivation();
    }

    if (oldBehaviour === undefined && newBehaviour !== undefined) {
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
  _checkIfAllBehavioursAreInactive():void {
    if (this.switchBehaviourPrioritizer.prioritizedBehaviour === undefined) {
      this.override = NO_OVERRIDE;
    }
  }

  /** Called when behaviour deactivates.
   *  Could be user leaving a room or just deactivation.
   * @param behaviour
   */
  async _onBehaviourDeactivation(): Promise<void> {
    if (this.override !== NO_OVERRIDE) {
      this.override = NO_OVERRIDE;
    }
    await this._activateNewBehaviour();

  }

  async _activateNewBehaviour():Promise<void> {
    if (!this.dumbHouseModeActive) {
      await this._setLightState();
    }
  }

  async _setLightState():Promise<void> {
    const state = this.getComposedState()
    this.currentLightState = GenericUtil.deepCopy(state);

    await this.updateStateCallback(state);
  }

  /** Returns the composed state of the active and prioritized behaviour.
   *
   */
  getComposedState(): HueLightState {
    return this.aggregatedBehaviour && this.aggregatedBehaviour.getComposedState() || {on: false};
  }


  async onStateChange(state: HueFullState):Promise<void> {
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
    if (composedState.on !== state.on && this.switchBehaviourPrioritizer.prioritizedBehaviour !== undefined) {
      this.override = SWITCH_STATE_OVERRIDE;

    }
    else if (composedState.on === state.on && composedState.bri !== state.bri && this.switchBehaviourPrioritizer.prioritizedBehaviour !== undefined) {
      this.override = DIM_STATE_OVERRIDE;
    }
    else {
      this.override = NO_OVERRIDE;
    }
  }

  /** If a light turns manually on while behaviour is active, behaviour's state will be used as light's state.
   *
   * @param state
   *
   * @returns True light state is changed
   */
  async _onSwitchOnWithActiveBehaviour(state: HueFullState): Promise<boolean> {
    //Light gets turned on, behaviour still active
    if (this.aggregatedBehaviour !== undefined && !this.currentLightState.on && state.on) {
      await this._setLightState();
      this.override = NO_OVERRIDE;
      return true;
    }
    return false;
  }

  _checkIfStateMatchesWithNewBehaviour():void {
    if (this.aggregatedBehaviour === undefined) {
      if (!this.currentLightState.on) {
        this.override = NO_OVERRIDE
      }
    }
    else {
      if (lightUtil.stateEqual(this.currentLightState, this.aggregatedBehaviour.getComposedState())) {
        this.override = NO_OVERRIDE
      }
    }
  }

  _checkIfBehaviourIsActive(newBehaviour:HueBehaviourWrapper):void {
    if (this.override === NO_OVERRIDE) {
      if (this.aggregatedBehaviour !== undefined && newBehaviour !== undefined
        && this.aggregatedBehaviour.behaviour.cloudId === newBehaviour.cloudId
        && this.aggregatedBehaviour.behaviour.data.action.data != newBehaviour.data.action.data) {
        this.aggregatedBehaviour = undefined; //Reset so it's getting changed in next loop iteration.
      }
    }
  }
}

