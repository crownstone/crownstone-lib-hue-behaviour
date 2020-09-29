type PresenceTypeSomeone = "SOMEBODY" | "NOBODY"
type PresenceType = PresenceTypeSomeone | "IGNORE" | "SPECIFIC_USERS"
type SunTimes = "SUNSET" | "SUNRISE"

interface PresenceNone {
    type: "IGNORE"
}
interface PresenceGeneric {
    type: PresenceTypeSomeone,
    data: PresenceData,
    delay: number
}

interface PresenceSomebody extends PresenceGeneric{
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

type TimeData = TimeDataSun |TimeDataClock

interface EndCondition {
    type: "PRESENCE_AFTER",
    presence: PresenceSomebody,
}

interface timeHoursMinutes {
    minutes: number,
    hours: number,
}


type ActiveDays = {
    Mon: boolean,
    Tue: boolean,
    Wed: boolean,
    Thu: boolean,
    Fri: boolean,
    Sat: boolean,
    Sun: boolean
}


// TYPE: behaviour
interface HueBehaviour {
    action: {
        type: "BE_ON",
        data: number, // 0 .. 1
    },
    time: Time,
    presence: Presence,
    endCondition?: EndCondition
}

// TYPE: TWILIGHT
interface Twilight {
    action: {
        type: "DIM_WHEN_TURNED_ON",
        data: number,
    },
    time: Time,
}


interface HueBehaviourWrapper {
    type: "BEHAVIOUR"
    data: HueBehaviour
    activeDays: ActiveDays,
    lightId,
    string
    updatedAt: number
}