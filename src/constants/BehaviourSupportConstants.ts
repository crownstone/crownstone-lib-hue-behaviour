import {ActiveDays, HueBehaviour, HueBehaviourWrapper} from "../declarations/behaviourTypes";

export const SPHERE_DELAY = 5 * 60;


export const EMPTY_RULE_DATA : HueBehaviour = {
  action:   { type: "BE_ON", data: 100 },
  time:     { type: "ALL_DAY" },
  presence: { type: "IGNORE" },
};

export const EMPTY_RULE_ACTIVE_DAYS : ActiveDays ={
  Fri: true, Mon: true, Sat: true, Sun: true, Thu: true, Tue: true, Wed: true
};

export const EMPTY_RULE: HueBehaviourWrapper={
  activeDays: EMPTY_RULE_ACTIVE_DAYS,
  data: EMPTY_RULE_DATA,
  cloudId: "12345678900",
  lightId: "22:FF:DD:TT:AA:CC:GG",
  type: "BEHAVIOUR",
  updatedAt: "0"

}