import {Behaviour} from "./behaviour/Behaviour";
import {BehaviourSupport} from "./behaviour/BehaviourSupport";
import {PrioritizedList} from "../declarations/declarations";


export const BehaviourAggregatorUtil = {


  /** Loops through a list of active behaviours, comparing them with each other to find the one with the latest starting time.
   *
   * @param behaviours - a list of behaviours or twilights to be iterated through.
   * @Returns a Behaviour
   */
  filterByStartingTime(behaviours: Behaviour[]): Behaviour {
    let filteredBehaviour = behaviours[0];
    for(let i = 1; i < behaviours.length; i++){
      filteredBehaviour = this.compareStartingTime(filteredBehaviour,behaviours[i]);
    }
    return filteredBehaviour
  },


  /** Compares A with B, finding the latest starting time.
   * If somehow the starting time is the same, behaviourA will be returned.
   * @param behaviourA - Behaviour to be compared with B
   * @param behaviourB - Behaviour to be compared with A
   *
   * @returns a Behaviour with latest starting time of the two.
   */
  compareStartingTime(behaviourA, behaviourB):Behaviour {
    const behaviourSupportA = new BehaviourSupport(behaviourA.behaviour);
    const behaviourSupportB = new BehaviourSupport(behaviourB.behaviour);

    if (behaviourB === undefined) {
      return behaviourA;
    }
    if(!behaviourSupportA.isActiveAllDay() && behaviourSupportB.isActiveAllDay()){
      return behaviourA;
    }
    if(behaviourSupportA.isActiveAllDay() && !behaviourSupportB.isActiveAllDay()){
      return behaviourB;
    }
    if(behaviourSupportA.isActiveAllDay() && behaviourSupportB.isActiveAllDay()){
      return behaviourA;
    }
    return (behaviourSupportA.getSwitchingTime("from", behaviourA.timestamp, behaviourA.sphereLocation) >=
      behaviourSupportB.getSwitchingTime("from",  behaviourB.timestamp, behaviourB.sphereLocation))?behaviourA:behaviourB;
  },

  /** Compares given behaviours for their dim percentage.
   *
   * @param behaviourA
   * @param behaviourB
   *
   * @returns Behaviour with lowest percentage.
   */
  compareByDimPercentage(behaviourA, behaviourB):Behaviour{
    return(behaviourA.behaviour.data.action.data <= behaviourB.behaviour.data.action.data)?behaviourA:behaviourB;
  },
  /** Gets the behaviour that should the active behaviour.
   *
   * @param prioritizedBehaviour
   * @param prioritizedTwilight
   */
  getActiveBehaviour(prioritizedBehaviour,prioritizedTwilight):Behaviour{
    if (prioritizedBehaviour !== undefined && prioritizedTwilight !== undefined) {
      return this.compareByDimPercentage(prioritizedBehaviour, prioritizedTwilight);
    } else if (prioritizedBehaviour !== undefined) {
      return prioritizedBehaviour;
    } else if (prioritizedTwilight !== undefined) {
      return prioritizedTwilight;
    }
  },

  /** Prioritizes Behaviours based on Behaviour overlapping rules.
   *
   * @param behaviours - To be prioritized
   *
   * @returns A prioritized behaviours object with 4 priority levels and a list of behaviours on each level.
   */
  prioritizeBehaviours(behaviours: Behaviour[]): PrioritizedList {
    let prioritizedList = {1: [], 2: [], 3: [], 4: []};
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
   * @Returns Behaviour
   */
  getBehaviourWithHighestPriority(prioritizedList: PrioritizedList):Behaviour{
    for (let i = 1; i <= 4; i++) {
      if (prioritizedList[i].length > 0) {
        if (prioritizedList[i].length === 1) {
          return prioritizedList[i][0];
        } else if (prioritizedList[i].length > 1) {
          return BehaviourAggregatorUtil.filterByStartingTime(prioritizedList[i]);
        }
      }
    }
  }

}