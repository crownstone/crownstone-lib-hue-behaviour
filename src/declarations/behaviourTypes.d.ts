export type PresenceTypeSomeone = "SOMEBODY" | "NOBODY"
export type PresenceType = PresenceTypeSomeone | "IGNORE" | "SPECIFIC_USERS"
export type SunTimes = "SUNSET" | "SUNRISE"
export type TimeDataType = SunTimes | "CLOCK"
export type BehaviourType = "BEHAVIOUR" | "TWILIGHT";

export interface PresenceNone {
    type: "IGNORE"
}
export interface PresenceGeneric {
    type: PresenceType,
    data: PresenceData,
    delay: number
}

export interface PresenceSomebody extends PresenceGeneric{
    type: "SOMEBODY"
}

export type Presence = PresenceGeneric | PresenceNone

export type PresenceData = PresenceSphere | PresenceLocation

export interface PresenceSphere {
    type: "SPHERE"
}

export interface PresenceLocation {
    type: "LOCATION",
    locationIds: number[]
}

export interface TimeAlways {
    type: "ALL_DAY"
}

export interface TimeRange {
    type: "RANGE",
    from: TimeData,
    to: TimeData
}

export type Time = TimeAlways | TimeRange

export interface TimeDataSun {
    type: SunTimes,
    offsetMinutes: number
}

export interface TimeDataClock {
    type: "CLOCK",
    data: timeHoursMinutes
}

export type TimeData = TimeDataSun |TimeDataClock

export interface EndCondition {
    type: "PRESENCE_AFTER",
    presence: PresenceSomebody,
}

export interface timeHoursMinutes {
    minutes: number,
    hours: number,
}


export interface ActiveDays {
    Mon: boolean,
    Tue: boolean,
    Wed: boolean,
    Thu: boolean,
    Fri: boolean,
    Sat: boolean,
    Sun: boolean
}


// TYPE: behaviour
export interface HueBehaviour {
    action: {
        type: "BE_ON",
        data: number, // 0 .. 1
    },
    time: Time,
    presence: Presence,
    endCondition?: EndCondition
}

// TYPE: TWILIGHT
export interface HueTwilight {
    action: {
        type: "DIM_WHEN_TURNED_ON",
        data: number,
    },
    time: Time,
}

export type HueBehaviourWrapper = HueBehaviourWrapperTwilight | HueBehaviourWrapperBehaviour

export interface HueBehaviourWrapperBehaviour {
    type: "BEHAVIOUR"
    data: HueBehaviour
    activeDays: ActiveDays,
    lightId: string,
    cloudId: string,
    updatedAt: string
}


export interface HueBehaviourWrapperTwilight {
    type: "TWILIGHT"
    data: HueTwilight
    activeDays: ActiveDays,
    lightId: string,
    cloudId: string,
    updatedAt: string
}

