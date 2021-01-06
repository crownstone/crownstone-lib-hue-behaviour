import {eventBus} from "../util/EventBus";
import {SwitchBehaviour} from "./behaviour/SwitchBehaviour";
import {ON_DUMB_HOUSE_MODE_SWITCH} from "../constants/EventConstants";
import {
  BehaviourAggregatorUtil,
  DIM_STATE_OVERRIDE,
  NO_OVERRIDE,
  AGGREGATOR_ITERATION_RATE,
  SWITCH_STATE_OVERRIDE,
  COLOR_TEMPERATURE_STATE_OVERRIDE,
  COLOR_STATE_OVERRIDE
} from "./BehaviourAggregatorUtil";
import {TwilightPrioritizer} from "./TwilightPrioritizer";
import {SwitchBehaviourPrioritizer} from "./SwitchBehaviourPrioritizer";
import {Twilight} from "./behaviour/Twilight";
import Timeout = NodeJS.Timeout;
import {DIMMING_OFF_COMMAND, SWITCH_OFF_COMMAND, SWITCH_ON_COMMAND} from "../constants/StateConstants";
import {CrownstoneHueError} from "..";


export class BehaviourAggregator {
  private initialized: boolean = false;
  twilightPrioritizer = new TwilightPrioritizer();
  switchBehaviourPrioritizer = new SwitchBehaviourPrioritizer();
  unsubscribeDumbHouseModeEvent: EventUnsubscriber;
  dumbHouseModeActive: boolean = false;
  aggregatedBehaviour: SwitchBehaviour | Twilight = undefined;
  timestamp = 0;
  currentDeviceState: DeviceState;  // State of the Device.
  deviceType: DeviceType;  // State of the Device.
  override: string = NO_OVERRIDE;
  intervalId: Timeout;
  updateStateCallback: (state) => {};

  constructor(callback, state) {
    this.updateStateCallback = callback;
    this.deviceType = state.type;
    BehaviourAggregatorUtil.convertExceedingMinMaxValues(state);
    this.currentDeviceState = state;
    this.unsubscribeDumbHouseModeEvent = eventBus.subscribe(ON_DUMB_HOUSE_MODE_SWITCH, this.onDumbHouseModeSwitch.bind(this));
  }


  /** Starts the aggregator's loop.
   *
   */
  init(): void {
    if (this.initialized) {
      return;
    }
    this.initialized = true;
    this.intervalId = setInterval(async () => {
      await this._loop();
    }, AGGREGATOR_ITERATION_RATE);
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

  async _loop(): Promise<void> {
    this.timestamp = Date.now();
    this.switchBehaviourPrioritizer.tick(this.timestamp);
    this.twilightPrioritizer.tick(this.timestamp);
    await this._handleBehaviours();

    if (this.dumbHouseModeActive) {
      this._setOverrideOnDeviceStateChange(this.currentDeviceState);
    }
  }


  setBehaviour(behaviour: BehaviourWrapper, sphereLocation: SphereLocation): number {
    this._checkIfBehaviourIsActive(behaviour);
    this._checkIfSupportsBehaviour(behaviour);
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

  _checkIfSupportsBehaviour(behaviour: BehaviourWrapper) {
    if (this.deviceType === "SWITCHABLE") {
      if (behaviour.data.action.type !== "BE_ON") {
        throw new CrownstoneHueError(433, `{cloudId: ${behaviour.cloudId}`)
      }
    }
    if (this.deviceType === "DIMMABLE") {
      if (behaviour.data.action.type !== "DIM_WHEN_TURNED_ON" && behaviour.data.action.type !== "BE_ON") {
        throw new CrownstoneHueError(433, `{cloudId: ${behaviour.cloudId}`)
      }
    }
    if (this.deviceType === "COLORABLE") {
      if (behaviour.data.action.type !== "DIM_WHEN_TURNED_ON" && behaviour.data.action.type !== "BE_ON"
        && behaviour.data.action.type !== "SET_COLOR_WHEN_TURNED_ON" && behaviour.data.action.type !== "BE_COLOR") {
        throw new CrownstoneHueError(433, `{cloudId: ${behaviour.cloudId}`)
      }
    }
    if (this.deviceType === "COLORABLE_TEMPERATURE") {
      if ((behaviour.data.action.type !== "DIM_WHEN_TURNED_ON" && behaviour.data.action.type !== "BE_ON"
        && behaviour.data.action.type !== "SET_COLOR_WHEN_TURNED_ON" && behaviour.data.action.type !== "BE_COLOR")
        || (typeof (behaviour.data.action.data) === "object" && behaviour.data.action.data.type !== "COLOR_TEMPERATURE")) {
        throw new CrownstoneHueError(433, `{cloudId: ${behaviour.cloudId}`)
      }
    }
  }


  onDumbHouseModeSwitch(data: boolean): void {
    this.dumbHouseModeActive = data;
  }

  _getAggregatedBehaviour(): SwitchBehaviour | Twilight {
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

  async _handleBehaviours(): Promise<void> {
    const oldBehaviour = this.aggregatedBehaviour;
    const newBehaviour = this._getAggregatedBehaviour();
    this.aggregatedBehaviour = newBehaviour;

    this._checkIfAllBehavioursAreInactive();
    this._checkIfStateMatchesWithNewBehaviour();
    if (newBehaviour !== undefined) {
      if (newBehaviour.behaviour.type === "TWILIGHT") {
        await this._TwilightHandling(newBehaviour);
      }
      else if (newBehaviour.behaviour.type === "BEHAVIOUR" && this.override === NO_OVERRIDE
        && oldBehaviour !== undefined && oldBehaviour.behaviour.cloudId != newBehaviour.behaviour.cloudId) {
        await this._activateNewBehaviour();
      }
    }

    //Device is on, but dimmed, user leaves room/behaviour deactivates  >  Device should still turn off.
    if (oldBehaviour !== undefined && newBehaviour === undefined) {
      await this._onBehaviourDeactivation();
    }

    if (oldBehaviour === undefined && newBehaviour !== undefined) {
      await this._activateNewBehaviour();
      this.override = NO_OVERRIDE; //oldBehaviour can't be undefined with an override set.

    }

  }

  /** Separate case for Twilights.
   * Checks if Twilight dims or not
   * @param behaviour
   */
  async _TwilightHandling(behaviour: Twilight): Promise<void> {
    if (this.currentDeviceState.on && "brightness" in this.currentDeviceState && this.currentDeviceState.brightness > behaviour.behaviour.data.action.data) {
      await this._activateNewBehaviour();
    }
  }

  /** Checks if all behaviours are inactive and then removes override.
   * prioritizedBehaviour will be undefined when all are inactive.
   */
  _checkIfAllBehavioursAreInactive(): void {
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

  async _activateNewBehaviour(): Promise<void> {
    if (!this.dumbHouseModeActive) {
      await this._setDeviceState();
    }
  }

  async _setDeviceState(): Promise<void> {
    let state = this.getStateUpdate();
    this.currentDeviceState = BehaviourAggregatorUtil.addUpdateToState(this.currentDeviceState, state);
    await this.updateStateCallback(state);
  }

  /** Returns the composed state of the active and prioritized behaviour.
   *
   */
  getStateUpdate(): StateUpdate {
    return this._createStateUpdate();
  }

  _createStateUpdate(): StateUpdate {
    if (!this.aggregatedBehaviour) {
      if (this.deviceType === "SWITCHABLE") {
        return SWITCH_OFF_COMMAND;
      }
      if (this.deviceType === "DIMMABLE" || this.deviceType === "COLORABLE" || this.deviceType === "COLORABLE_TEMPERATURE") {
        return DIMMING_OFF_COMMAND
      }
    }
    if (this.deviceType === "SWITCHABLE") {
      return this._createSwitchCommand();
    }
    if (this.deviceType === "DIMMABLE") {
      return this._createDimmingCommand();
    }
    if (this.deviceType === "COLORABLE") {
      return this._createDimmingCommand() || this._createColorCommand() || this._createColorTemperatureCommand()
    }
    if (this.deviceType === "COLORABLE_TEMPERATURE") {
      return this._createDimmingCommand() || this._createColorTemperatureCommand()
    }
  }

  _createSwitchCommand(): StateUpdate {
    const composedState = this.aggregatedBehaviour.getComposedState()
    if (composedState.type === "RANGE" && composedState.value === 100) {
      return SWITCH_ON_COMMAND;
    }
    else if (composedState.type === "RANGE" && composedState.value < 100 && this.deviceType === "SWITCHABLE") {
      return SWITCH_OFF_COMMAND;
    }
  }

  _createDimmingCommand(): StateUpdate {
    const composedState = this.aggregatedBehaviour.getComposedState()
    if (composedState.type === "RANGE") {
      return {type: "DIMMING", value: composedState.value}
    }
  }

  _createColorCommand(): StateUpdate {
    const composedState = this.aggregatedBehaviour.getComposedState()
    if (composedState.type === "COLOR") {
      return {
        type: "COLOR",
        brightness: composedState.brightness,
        hue: composedState.hue,
        saturation: composedState.saturation
      }
    }
  }

  _createColorTemperatureCommand(): StateUpdate {
    const composedState = this.aggregatedBehaviour.getComposedState()
    if (composedState.type === "COLOR_TEMPERATURE") {
      return {
        type: "COLOR_TEMPERATURE",
        temperature: composedState.temperature,
        brightness: composedState.brightness,
      }
    }
  }

  async onStateChange(state: StateUpdate): Promise<void> {
    if (!state) {
      return;
    }
    BehaviourAggregatorUtil.convertExceedingMinMaxValues(state);
    if (!this.dumbHouseModeActive) {
      if (await this._onSwitchOnWithActiveBehaviour(state)) {
        return;
      }
    }
    this.currentDeviceState = BehaviourAggregatorUtil.addUpdateToState(this.currentDeviceState, state);
    this._setOverrideOnDeviceStateChange(this.currentDeviceState)
  }

  /** Sets the override variable based on passed Device state.
   *
   * @param state
   */
  _setOverrideOnDeviceStateChange(state: DeviceState): void {
    if (this.switchBehaviourPrioritizer.prioritizedBehaviour !== undefined) {
      const composedState = this.getStateUpdate();
      if (state.type === "SWITCHABLE") {
        if (composedState.type === "SWITCH" && composedState.value !== state.on) {
          this.override = SWITCH_STATE_OVERRIDE
        }
      }
      else {
        if ((composedState.type === "SWITCH" && composedState.value !== state.on) ||
          composedState.type === "DIMMING" && (composedState.value < 100 && !state.on || composedState.value === 0 && state.on)) {
          this.override = SWITCH_STATE_OVERRIDE
        }
        else if ((composedState.type === "COLOR" || composedState.type === "COLOR_TEMPERATURE")
          && (composedState.brightness < 100 && !state.on || composedState.brightness === 0 && state.on)) {
          this.override = SWITCH_STATE_OVERRIDE
        }
        else if ((composedState.type === "COLOR" && composedState.brightness !== state.brightness) ||
          (composedState.type === "COLOR_TEMPERATURE" && composedState.brightness !== state.brightness) ||
          (composedState.type === "DIMMING" && composedState.value !== state.brightness)) {
          this.override = DIM_STATE_OVERRIDE
        }

        else if (state.type === "COLORABLE") {
          if ((composedState.type === "COLOR" && composedState.hue !== state.hue) ||
            (composedState.type === "COLOR" && composedState.saturation !== state.saturation)) {
            this.override = COLOR_STATE_OVERRIDE
          }
        }
        else if (state.type === "COLORABLE_TEMPERATURE") {
          if (composedState.type === "COLOR_TEMPERATURE" && composedState.temperature !== state.temperature) {
            this.override = COLOR_TEMPERATURE_STATE_OVERRIDE
          }
        }
        else {
          this.override = NO_OVERRIDE
        }
      }
    }
    else {
      this.override = NO_OVERRIDE
    }
  }

  /** If a Device turns manually on while behaviour is active, behaviour's state will be used as Device's state.
   *
   * @param state
   *
   * @returns True Device state is changed
   */
  async _onSwitchOnWithActiveBehaviour(state: StateUpdate): Promise<boolean> {
    //Device gets turned on, behaviour still active
    if (state.type === "SWITCH") {
      if (this.aggregatedBehaviour !== undefined && !this.isDeviceOn() && state.value) {
        await this._setDeviceState();
        this.override = NO_OVERRIDE;
        return true;
      }
    }
    return false;
  }

  isDeviceOn(): boolean {
    return (this.currentDeviceState.on)
  }

  _checkIfStateMatchesWithNewBehaviour(): void {
    if (this.aggregatedBehaviour === undefined) {
      if (!this.isDeviceOn()) {
        this.override = NO_OVERRIDE
      }
    }
    else {
      if (BehaviourAggregatorUtil.stateEqual(this.currentDeviceState, this.getStateUpdate())) {
        this.override = NO_OVERRIDE
      }
    }
  }

  _checkIfBehaviourIsActive(newBehaviour: BehaviourWrapper): void {
    if (this.override === NO_OVERRIDE) {
      if (this.aggregatedBehaviour !== undefined && newBehaviour !== undefined
        && this.aggregatedBehaviour.behaviour.cloudId === newBehaviour.cloudId
        && !BehaviourAggregatorUtil.isBehaviourEqual(this.aggregatedBehaviour.behaviour, newBehaviour)) {
        this.aggregatedBehaviour = undefined; //Reset so it's getting changed in next loop iteration.
      }
    }
  }
}

