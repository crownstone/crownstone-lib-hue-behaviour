export const SPHERE_DELAY = 5 * 60;


export const EMPTY_RULE_DATA: SwitchBehaviourData = {
  action: {type: "BE_ON", data: 100},
  time: {type: "ALL_DAY"},
  presence: {type: "IGNORE"},
};

export const EMPTY_RULE_ACTIVE_DAYS: ActiveDays = {
  Fri: true, Mon: true, Sat: true, Sun: true, Thu: true, Tue: true, Wed: true
};

export const EMPTY_RULE: BehaviourWrapper = {
  type: "BEHAVIOUR",
  activeDays: {...EMPTY_RULE_ACTIVE_DAYS},
  data: {...EMPTY_RULE_DATA},
  cloudId: "ci" + Date.now(),
  deviceId: "22:FF:DD:TT:AA:CC:GG"

}
