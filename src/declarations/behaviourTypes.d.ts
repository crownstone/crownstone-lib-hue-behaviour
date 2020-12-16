type PresenceTypeSomeone = "SOMEBODY" | "NOBODY"
type PresenceType = PresenceTypeSomeone | "IGNORE" | "SPECIFIC_USERS"
type SunTimes = "SUNSET" | "SUNRISE"
type TimeDataType = SunTimes | "CLOCK"
type BehaviourType = "BEHAVIOUR" | "TWILIGHT";

interface PresenceNone {
  type: "IGNORE"
}

interface PresenceGeneric {
  type: PresenceType,
  data: PresenceData,
  delay: number
}

interface PresenceSomebody extends PresenceGeneric {
  type: "SOMEBODY"
}

type Presence = PresenceGeneric | PresenceNone

type PresenceData = PresenceSphere | PresenceLocation

interface PresenceSphere {
  type: "SPHERE"
}

interface PresenceLocation {
  type: "LOCATION",
  locationIds: number[]
}

interface TimeAlways {
  type: "ALL_DAY"
}

interface TimeRange {
  type: "RANGE",
  from: TimeData,
  to: TimeData
}

type Time = TimeAlways | TimeRange

interface TimeDataSun {
  type: SunTimes,
  offsetMinutes: number
}

interface TimeDataClock {
  type: "CLOCK",
  data: timeHoursMinutes
}

type TimeData = TimeDataSun | TimeDataClock

interface EndCondition {
  type: "PRESENCE_AFTER",
  presence: PresenceSomebody,
}

interface timeHoursMinutes {
  minutes: number,
  hours: number,
}


interface ActiveDays {
  Mon: boolean,
  Tue: boolean,
  Wed: boolean,
  Thu: boolean,
  Fri: boolean,
  Sat: boolean,
  Sun: boolean
}


// TYPE: behaviour
interface SwitchBehaviourData {
  action:BehaviourAction,
  time: Time,
  presence: Presence,
  endCondition?: EndCondition
}

// TYPE: TWILIGHT
interface TwilightData {
  action: TwilightAction,
  time: Time
}


type BehaviourAction = ActionSwitch | ActionColorSwitch
type TwilightAction = ActionTwilight | ActionColorTwilight


interface ActionSwitch {
  type: "BE_ON",
  data: number // 0 .. 100
}
interface ActionTwilight {
  type: "DIM_WHEN_TURNED_ON",
  data: number
}

type ActionColorTwilight = { type:"SET_COLOR_WHEN_TURNED_ON", data: ColorData }

type ActionColorSwitch   = { type:"BE_COLOR", data: ColorData }

type ColorData = ColorTemperatureData | ColorStateData

type ColorTemperatureData = { type: "COLOR_TEMPERATURE", temperature: number, brightness: number } // temperature in kelvin.
type ColorStateData = { type: "COLOR", hue: number, saturation: number, brightness: number } // hue 0..360 saturation 0..100 brightness 0..100

type BehaviourWrapper =  BehaviourWrapperTwilight | BehaviourWrapperBehaviour

interface BehaviourWrapperBehaviour {
  type: "BEHAVIOUR"
  data: SwitchBehaviourData
  activeDays: ActiveDays, 
  cloudId: string
}


interface BehaviourWrapperTwilight {
  type: "TWILIGHT"
  data: TwilightData
  activeDays: ActiveDays,
  cloudId: string
}

interface BehaviourBaseInterface {
  behaviour: BehaviourWrapper;
  isActive: boolean;
  timestamp: number | null;
  sphereLocation: SphereLocation
  unsubscribeSphereChangeEvent: EventUnsubscriber;
}

interface SwitchBehaviourInterface extends BehaviourBaseInterface {
  presenceLocations: PresenceProfile[];
  lastPresenceUpdate: number;
  unsubscribePresenceChangeEvent: EventUnsubscriber;
}