import {SwitchBehaviour} from "./behaviour/SwitchBehaviour";
import {BehaviourSupport} from "./behaviour/BehaviourSupport";
import {Twilight} from "./behaviour/Twilight";
import {MaxStateValue, MinStateValue} from "../constants/StateConstants";
import {hueStateVariables} from "../constants/HueConstants";


interface TimeCompareResult {
  result: "BOTH" | "SINGLE";
  behaviour?: SwitchBehaviour
}

export const SWITCH_STATE_OVERRIDE = "SWITCH_STATE_OVERRIDE";
export const DIM_STATE_OVERRIDE = "DIM_STATE_OVERRIDE";
export const NO_OVERRIDE = "NO_OVERRIDE";
export const AGGREGATOR_POLLING_RATE = 500;

export const BehaviourAggregatorUtil = {


  /** Loops through a list of active behaviours, comparing them with each other to find the one with the latest starting time.
   * If two or more have same starting time, check for the lowest dim percentage.
   *
   * @param behaviours - a list of behaviours or twilights to be iterated through.
   * @Returns a SwitchBehaviour or Twilight
   */
  filterBehaviours(behaviours: SwitchBehaviour[] | Twilight[]): SwitchBehaviour | Twilight {
    let filteredBehaviour = behaviours[0];
    for (let i = 1; i < behaviours.length; i++) {
      const result = this.compareStartingTime(filteredBehaviour, behaviours[i]);
      if (result.result === "BOTH") {
        filteredBehaviour = this.compareByDimPercentage(filteredBehaviour, behaviours[i]);
      }
      else {
        filteredBehaviour = result.behaviour;
      }
    }
    return filteredBehaviour
  },


  /** Compares A with B, finding the latest starting time.
   * If somehow the starting time is the same, behaviourA will be returned.
   * @param behaviourA - SwitchBehaviour to be compared with B
   * @param behaviourB - SwitchBehaviour to be compared with A
   *
   * @returns a SwitchBehaviour with latest starting time of the two.
   */
  compareStartingTime(behaviourA: SwitchBehaviour, behaviourB: SwitchBehaviour): TimeCompareResult {
    const behaviourSupportA = new BehaviourSupport(behaviourA.behaviour);
    const behaviourSupportB = new BehaviourSupport(behaviourB.behaviour);

    if (behaviourB === undefined) {
      return <TimeCompareResult>{result: "SINGLE", behaviour: behaviourA};
    }
    if (!behaviourSupportA.isActiveAllDay() && behaviourSupportB.isActiveAllDay()) {
      return <TimeCompareResult>{result: "SINGLE", behaviour: behaviourA};
    }
    if (behaviourSupportA.isActiveAllDay() && !behaviourSupportB.isActiveAllDay()) {
      return <TimeCompareResult>{result: "SINGLE", behaviour: behaviourB};
    }
    if (behaviourSupportA.isActiveAllDay() && behaviourSupportB.isActiveAllDay()) {
      return <TimeCompareResult>{result: "BOTH"}
    }
    const timeA = behaviourSupportA.getSwitchingTime("from", behaviourA.timestamp, behaviourA.sphereLocation);
    const timeB = behaviourSupportB.getSwitchingTime("from", behaviourB.timestamp, behaviourB.sphereLocation);
    if (timeA === timeB) {
      return {result: "BOTH"}
    }
    return (timeA > timeB) ? {result: "SINGLE", behaviour: behaviourA} : {result: "SINGLE", behaviour: behaviourB};
  },

  /** Compares given behaviours for their dim percentage.
   *
   * @param behaviourA
   * @param behaviourB
   *
   * @returns Behaviour with lowest percentage.
   */
  compareByDimPercentage(behaviourA: SwitchBehaviour | Twilight, behaviourB: SwitchBehaviour | Twilight): SwitchBehaviour | Twilight {
    return (behaviourA.behaviour.data.action.data <= behaviourB.behaviour.data.action.data) ? behaviourA : behaviourB;
  },

  /** Prioritizes Behaviours based on SwitchBehaviour overlapping rules.
   *
   * @param behaviours - To be prioritized
   *
   * @returns A prioritized behaviours object with 4 priority levels and a list of behaviours on each level.
   */
  prioritizeBehaviours(behaviours: SwitchBehaviour[]): PrioritizedList {
    let prioritizedList = <PrioritizedList>{1: [], 2: [], 3: [], 4: []};
    for (const behaviour of behaviours) {
      const behaviourSupport = new BehaviourSupport(behaviour.behaviour);
      if (behaviourSupport.isUsingSingleRoomPresence()) {
        prioritizedList[1].push(behaviour);
      }
      else if (behaviourSupport.isUsingMultiRoomPresence()) {
        prioritizedList[2].push(behaviour);
      }
      else if (behaviourSupport.isUsingSpherePresence()) {
        prioritizedList[3].push(behaviour);
      }
      else {
        prioritizedList[4].push(behaviour);
      }
    }
    return prioritizedList;
  },
  /** Iterates through given priority list, returning the behaviour with the highest priority.
   *
   * @param prioritizedList
   *
   * @Returns SwitchBehaviour
   */
  getBehaviourWithHighestPriority(prioritizedList: PrioritizedList): SwitchBehaviour {
    for (let i = 1; i <= 4; i++) {
      if (prioritizedList[i].length > 0) {
        if (prioritizedList[i].length === 1) {
          return prioritizedList[i][0];
        }
        else if (prioritizedList[i].length > 1) {
          return <SwitchBehaviour>this.filterBehaviours(prioritizedList[i]);
        }
      }
    }
  },


  /** Returns the prioritized behaviour
   *
   * @param behaviours - a list of active behaviours to be iterated through.
   * @Returns a SwitchBehaviour or undefined when given list was empty.
   */
  getPrioritizedBehaviour(behaviours: SwitchBehaviour[]): SwitchBehaviour {
    if (behaviours === []) {
      return undefined;
    }
    else {
      const prioritizedList = this.prioritizeBehaviours(behaviours);
      return this.getBehaviourWithHighestPriority(prioritizedList);
    }
  },

  /** Returns the prioritized twilight
   * Uses filterBehaviours to get the twilight that started as last and lowest dim percentage if needed.
   * @param twilights - a list of active twilights to be iterated through.
   * @Returns a twilight or undefined when given list was empty.
   */
  getPrioritizedTwilight(twilights: Twilight[]): Twilight {
    if (twilights === []) {
      return undefined;
    }
    else {
      return this.filterBehaviours(twilights);
    }
  },


  /** Maps the state update to the actual state.
   *
   * @param deviceState
   * @param updateState
   *
   * Returns deviceState with updateState values.
   */
  addUpdateToState(deviceState: DeviceStates, updateState: StateUpdate): DeviceStates {
    if (updateState.type === "SWITCH") {
      deviceState.on = updateState.value;
    }
    if (updateState.type === "DIMMING" && deviceState.type !== "SWITCHABLE") {
      deviceState.brightness = updateState.value;

      if (updateState.value > 0) {
        deviceState.on = true;
      }
      else {
        deviceState.on = false;
      }
    }
    if (updateState.type === "COLOR" && deviceState.type == "COLORABLE") {
      deviceState.hue = updateState.hue;
      deviceState.saturation = updateState.saturation;
    }

    return deviceState;
  },


  stateEqual(deviceState: DeviceStates, stateUpdate: StateUpdate): boolean {
    let returnType = false;
    if (deviceState.type === "SWITCHABLE") {
      if (stateUpdate.type === "SWITCH") {
        returnType = (stateUpdate.value === deviceState.on)
      }
      else {
        throw "Unsupported behaviour."
      }
    }
    if (deviceState.type === "DIMMABLE") {
      if (stateUpdate.type === "SWITCH") {
        returnType = (stateUpdate.value === deviceState.on)
      }
      else if (stateUpdate.type === "DIMMING") {
        returnType = (stateUpdate.value === deviceState.brightness && deviceState.on)
      }
      else {
        throw "Unsupported behaviour."
      }
    }
    if (deviceState.type === "COLORABLE") {
      if (stateUpdate.type === "SWITCH") {
        returnType = (stateUpdate.value === deviceState.on)
      }
      else if (stateUpdate.type === "DIMMING") {
        returnType = (stateUpdate.value === deviceState.brightness)
      }
      if (stateUpdate.type === "COLOR") {
        returnType = (stateUpdate.brightness === deviceState.brightness) && (stateUpdate.hue === deviceState.hue) && (stateUpdate.saturation === deviceState.saturation)
      }
      else {
        throw "Unsupported behaviour."
      }
    }
    return returnType;
  },


  convertExceedingMinMaxValues(state: DeviceStates | StateUpdate): void {
    if (state.type === "SWITCH") {
      return
    }
    ;
    if (state.type === "DIMMING") {
      state.value = Math.min(MaxStateValue["brightness"], Math.max(MinStateValue["brightness"], state.value))
    }
    if (state.type === "DIMMABLE") {
      state.brightness = Math.min(MaxStateValue["brightness"], Math.max(MinStateValue["brightness"], state.brightness))
    }
    if (state.type === "COLORABLE") {
      state.brightness = Math.min(MaxStateValue["brightness"], Math.max(MinStateValue["brightness"], state.brightness))
      state.hue = Math.min(MaxStateValue["hue"], Math.max(MinStateValue["hue"], state.hue))
      state.saturation = Math.min(MaxStateValue["saturation"], Math.max(MinStateValue["saturation"], state.saturation))
    }


  }

}