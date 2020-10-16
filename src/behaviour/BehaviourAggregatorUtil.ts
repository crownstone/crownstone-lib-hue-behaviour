import {SwitchBehaviour} from "./behaviour/SwitchBehaviour";
import {BehaviourSupport} from "./behaviour/BehaviourSupport";
import {PrioritizedList} from "../declarations/declarations";
import {Twilight} from "./behaviour/Twilight";


interface TimeCompareResult {
  result: "BOTH" | "SINGLE";
  Behaviour?: SwitchBehaviour
}
export const POLLING_RATE = 500;
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
      } else {
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
    if ((behaviourSupportA.isActiveAllDay() && behaviourSupportB.isActiveAllDay())
      || behaviourSupportA.getSwitchingTime("from", behaviourA.timestamp, behaviourA.sphereLocation) === behaviourSupportB.getSwitchingTime("from", behaviourB.timestamp, behaviourB.sphereLocation)) {
      return <TimeCompareResult>{result: "BOTH"}
    }
    return (behaviourSupportA.getSwitchingTime("from", behaviourA.timestamp, behaviourA.sphereLocation)
      > behaviourSupportB.getSwitchingTime("from", behaviourB.timestamp, behaviourB.sphereLocation))
      ? <TimeCompareResult>{result: "SINGLE", behaviour: behaviourA}
      : <TimeCompareResult>{result: "SINGLE", behaviour: behaviourB};
  },

  /** Compares given behaviours for their dim percentage.
   *
   * @param behaviourA
   * @param behaviourB
   *
   * @returns SwitchBehaviour with lowest percentage.
   */
  compareByDimPercentage(behaviourA: SwitchBehaviour, behaviourB: SwitchBehaviour): SwitchBehaviour {
    return (behaviourA.behaviour.data.action.data <= behaviourB.behaviour.data.action.data) ? behaviourA : behaviourB;
  },
  /** Gets the behaviour that should be the active behaviour.
   * TODO Rewrite according to override rules
   * @param prioritizedBehaviour
   * @param prioritizedTwilight
   */
  getActiveBehaviour(prioritizedBehaviour: SwitchBehaviour, prioritizedTwilight: SwitchBehaviour): SwitchBehaviour {
    if (prioritizedBehaviour !== undefined && prioritizedTwilight !== undefined) {
      return this.compareByDimPercentage(prioritizedBehaviour, prioritizedTwilight);
    } else if (prioritizedBehaviour !== undefined) {
      return prioritizedBehaviour;
    } else if (prioritizedTwilight !== undefined) {
      return prioritizedTwilight;
    } else {
      return undefined;
    }
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
      } else if (behaviourSupport.isUsingMultiRoomPresence()) {
        prioritizedList[2].push(behaviour);
      } else if (behaviourSupport.isUsingSpherePresence()) {
        prioritizedList[3].push(behaviour);
      } else {
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
        } else if (prioritizedList[i].length > 1) {
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
    } else {
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
    } else {
      return this.filterBehaviours(twilights);
    }
  }


}