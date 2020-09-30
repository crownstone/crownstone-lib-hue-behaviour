import {EventBus} from "./util/EventBus";

const oneBriPercentage = 2.54;
const numberToWeekDay = {0: "Sun", 1: "Mon", 2: "Tue", 3: "Wed", 4: "Thu", 5: "Fri", 6: "Sat"}

export class Behaviour {
    behaviour: HueBehaviourWrapper;
    isActive: boolean;
    presenceLocations: PresenceProfile[];
    // presenceTypeActive: boolean;   // True on presence with "SOMEBODY", True without presence with "NOBODY", Always true with IGNORE
    eventBus: EventBus;
    ticks: number; // ms

    constructor(behaviour, eventBus) {
        this.behaviour = behaviour;
        this.eventBus = eventBus;
        this._presenceOnCreation();
        this.eventBus.subscribe("onPresenceDetect", this.handlePresence.bind(this));
        this.ticks = Date.now();
        this._behaviourActiveCheck();
    }

    tick(ticks = Date.now()) {
        this.ticks = ticks;
        this._behaviourActiveCheck();
    }

    //ENDCONDITION:? MAY HAVE IGNORE... TEMP ADDING/REMOVING MECHANISM
    handlePresence(presenceEvent: PresenceEvent) {
        if (this.behaviour.data.presence.type !== "IGNORE") {
            this._handlePresenceEvent(presenceEvent);
        } else if ("endCondition" in this.behaviour.data && this.behaviour.data.endCondition.presence.type === "SOMEBODY") {
            if (presenceEvent.data.type === "SPHERE" && presenceEvent.type === "ENTER") {
                this.presenceLocations.push(presenceEvent.data);
            } else if (presenceEvent.data.type === "SPHERE" && presenceEvent.type === "LEAVE") {
                this._handlePresenceEventLeave(presenceEvent);
            }
        }
    }

    _handlePresenceEventEnter(presenceEvent: PresenceEvent) {
        if (presenceEvent.data.type === "SPHERE") {
            this.presenceLocations.push(presenceEvent.data);
        } else if (presenceEvent.data.type === "LOCATION") {
            if ("data" in this.behaviour.data.presence && this.behaviour.data.presence.data.type === "LOCATION") {
                presenceEvent.data.locationIds.forEach(locationId => {
                    if (this._hasPresenceGivenLocationId(locationId)) {
                        this.presenceLocations.push(presenceEvent.data);
                        return;
                    }
                });
            }
        }
    }

    _handlePresenceEventLeave(presenceEvent: PresenceEvent) {
        for (var i = 0; i < this.presenceLocations.length; i++) {
            if (presenceEvent.data.profileIdx === this.presenceLocations[i].profileIdx) {
                if (presenceEvent.data.type === this.presenceLocations[i].type && presenceEvent.data.type === "SPHERE") {
                    this.presenceLocations[i] = undefined;
                    break;
                } else if (presenceEvent.data.type === this.presenceLocations[i].type && presenceEvent.data.type === "LOCATION") {
                    this.presenceLocations[i] = undefined;
                    break;
                }
            }
        }
    }

    _handlePresenceEvent(presenceEvent: PresenceEvent) {
        if (presenceEvent.type === "ENTER") {
            this._handlePresenceEventEnter(presenceEvent);
        } else if (presenceEvent.type === "LEAVE") {
            this._handlePresenceEventLeave(presenceEvent);
        }
    }

    getComposedState() {
        return (this.isActive) ? this._createComposedState() : {on: false}
    }

    _createComposedState() {
        const state = {on: true, bri: this.behaviour.data.action.data * oneBriPercentage}
    }


    //TODO Get save state?
    _presenceOnCreation() {
        // return (this.behaviour.data.presence.type === "IGNORE") ? this.currentPresence = "IGNORE" : "NOBODY";
    }


    /*
    Checks if type All_DAY is still valid.
    if currentTimeInMinutes < 240 = new day.. Check yesterday for activation..

    04:00 - 03:59
     */
    _isActiveTimeAllDay(): boolean {
        const currentTimeInMinutes = new Date(this.ticks).getMinutes() + (new Date(this.ticks).getHours() * 60);

        //Checks if time is between  00:00 > 03:59.
        if (currentTimeInMinutes < 4 * 60) {
            //Checks if yesterday should be active.
            return this.behaviour.activeDays[this._getWeekday(-1)]
        } else {//Else means 04:00 -> 23:59.
            //Is Today active. Thus 04:00 -> 23:59
            return this.behaviour.activeDays[this._getWeekday()]
        }
    }


    //Returns (de)activation time in minutes from 00:00 to 23:59 or -1 when invalid type.
    _getSwitchingTime(operator: string): number {
        switch (this.behaviour.data.time[operator].type) {
            case "SUNRISE":
                return getSunriseTime().getMinutes() + this.behaviour.data.time[operator].offsetMinutes + (getSunriseTime().getHours() * 60);
            case "SUNSET":
                return getSunsetTime().getMinutes() + this.behaviour.data.time[operator].offsetMinutes + (getSunsetTime().getHours() * 60);
            case "CLOCK":
                return this.behaviour.data.time[operator].data.minutes + (this.behaviour.data.time[operator].data.hours * 60);
            default:
                return -1;
        }
    }

    _isActiveRangeObject(): boolean {
        const currentTimeInMinutes = new Date(this.ticks).getMinutes() + (new Date(this.ticks).getHours() * 60);
        const fromTimeInMinutes = this._getSwitchingTime("from");
        const toTimeInMinutes = this._getSwitchingTime("to");

        if (fromTimeInMinutes === -1 || toTimeInMinutes === -1) {
            return false;
        }

        //TODO GLOBAL CALC and 00:00 case
        /*
         start 21:00 - 04:00 end. Curr time. 03:00
        21*60 = 1260
        4*60 = 240
        3*60 =  180
       yesterday check> true.


        yesterday start, today ends, active Wanted result: true
        start 15:00 - 14:59 end. Curr time. 13:00
        14*60 + 59 = 899
        15*60 = 900
        13*60 =  780
        yesterday check> true

         yesterday start, today end inactive after. Wanted result: False
        start 21:00 - 04:00 end. Curr time. 05:00
        21*60 = 1260
        4*60 = 240
        5*60 =  300
       yesterday check false
       currentTimeInMinutes >= fromTimeInMinutes = FALSE


        today start, tomorrow end active. Wanted result: true
        start 21:00 - 04:00 end. Curr time. 22:00
        21*60 = 1260
        4*60 = 240
        22*60 =  1320
       yesterday check false
       currentTimeInMinutes >= fromTimeInMinutes = true

       currentTimeInMinutes < toTimeInMinutes  = false
       toTimeInMinutes < fromTimeInMinutes = true


        today start, tomorrow end, inactive before Wanted result: false
        start 21:00 - 04:00 end. Curr time. 19:00
        21*60 = 1260
        4*60 = 240
        19*60 =  1140
       yesterday check false
       currentTimeInMinutes >= fromTimeInMinutes = false


        today start and end, active Wanted result: true
        start 15:00 - 18:00 end. Curr time. 17:00 res false
        15*60 = 900
        18*60 = 1080
        17*60 =  1020
       yesterday check false

       currentTimeInMinutes >= fromTimeInMinutes = true
       currentTimeInMinutes < toTimeInMinutes  = true




        today start and end, after active Wanted result: false
        start 15:00 - 18:00 end. Curr time. 19:00 res false
        15*60 = 900
        18*60 = 1080
        19*60 = 1140
       yesterday check false
       currentTimeInMinutes >= fromTimeInMinutes = true
       currentTimeInMinutes < toTimeInMinutes  = false
        toTimeInMinutes < fromTimeInMinutes = false




        today start and end, before active Wanted result: false
        start 15:00 - 18:00 end. Curr time. 14:00 res false
        15*60 = 900
        18*60 = 1080
        14*60 =  840
       yesterday check false
       currentTimeInMinutes >= fromTimeInMinutes = false


        start 00:00 - 04:00 end. Curr time. 00:00
        21*60 = 1260
        4*60 = 240
        0*60 =  0
        yesterday check false
        currentTimeInMinutes >= fromTimeInMinutes = false




         start 21:00 - 04:00 end. Curr time. 00:00
        21*60 = 1260
        4*60 = 240
        3*60 =  180
       ((toTimeInMinutes - fromTimeInMinutes) < 0) && (currentTimeInMinutes < toTimeInMinutes)
        true &&  true
        */

        /*Yesterday started and still active. CALCULATION
        ONLY CHECKS FOR YESTERDAY, TODAY OR TOMORROW ARE NOT INCLUDED
                    (24 hour check)                                               (still active check)               (check if started yesterday)
        END TIME MINUS START TIME LESS THAN 0 IS TRUE? THEN CURRENT TIME IS LESS THAN END TIME IS TRUE? THEN CHECK IF YESTERDAY IS ACTIVE.
        (((endTime - startTime)< 0 ) && (currentTime < endTime) && yesterday should be active)?true:false
        yesterday start, today ends, active Wanted result: true
        start 21:00 - 04:00 end. Curr time. 03:00
        21*60 = 1260
        4*60 = 240
        3*60 =  180
        240-1260 < 0  = True;
                       (180 < 240) true


        yesterday start, today ends, active Wanted result: true
        start 15:00 - 14:59 end. Curr time. 13:00
        14*60 + 59 = 899
        15*60 = 900
        13*60 =  780
        840 - 899 < 0  = True;
                       (780 < 899 ) true

         yesterday start, today end inactive after. Wanted result: False
        start 21:00 - 04:00 end. Curr time. 05:00
        21*60 = 1260
        4*60 = 240
        5*60 =  300
        240-1260 < 0  = True;
                       (300 < 240) false



        today start, tomorrow end active. Wanted result: False
        start 21:00 - 04:00 end. Curr time. 22:00
        21*60 = 1260
        4*60 = 240
        22*60 =  1320
        240 - 1260 < 0 == true
                        (1320 < 240) = false;

        today start, tomorrow end, inactive before Wanted result: False
        start 21:00 - 04:00 end. Curr time. 19:00
        21*60 = 1260
        4*60 = 240
        19*60 =  1140
        240 - 1260  < 0 = true
                        (1140 < 240) = false;

        today start and end, active Wanted result: False
        start 15:00 - 18:00 end. Curr time. 17:00 res false
        15*60 = 900
        18*60 = 1080
        17*60 =  1020
        1080 - 900 < 0 = false;



        today start and end, after active Wanted result: False
        start 15:00 - 18:00 end. Curr time. 19:00 res false
        15*60 = 900
        18*60 = 1080
        19*60 = 1140
        1080 - 900 < 0 = false;



        today start and end, before active Wanted result: False
        start 15:00 - 18:00 end. Curr time. 14:00 res false
        15*60 = 900
        18*60 = 1080
        14*60 =  840
        1080 - 900 < 0 = false;


        */
        if (((toTimeInMinutes - fromTimeInMinutes) < 0) && (currentTimeInMinutes < toTimeInMinutes)) {
            return this.behaviour.activeDays[this._getWeekday(-1)];
        }
        // 12:00 - 11:00  19:00
        //Starts today and still active. (12:00) -> 15:59  curr. 13:00.   13:00 >= 12:00 true
        if (currentTimeInMinutes >= fromTimeInMinutes) {
            // 12:00 -> (15:59)    curr. 13:00   13:00 < 15:59 = true;
            if (currentTimeInMinutes < toTimeInMinutes) {
                return this.behaviour.activeDays[this._getWeekday()];
            }
            // 12:00 -> 11:00 Curr. 13:00 11:00 < 12:00 = true. Meaning that the time overlaps to next day and will be caught at 00:00 by yesterday checking
            if (toTimeInMinutes < fromTimeInMinutes) {
                return this.behaviour.activeDays[this._getWeekday()];
            }
        }
        return false;

    }

    _isActiveTimeObject(): boolean {
        if (this.behaviour.data.time.type === "ALL_DAY") {
            return this._isActiveTimeAllDay();
        }
        if (this.behaviour.data.time.type === "RANGE") {
            return this._isActiveRangeObject();
        }
        return false;
    }

    _isActivePresenceObject(): boolean {
        switch (this.behaviour.data.presence.type) {
            case "IGNORE":
                return true;
            case "NOBODY":
                return !this._isSomeonePresent();
            case "SOMEBODY":
                return this._isSomeonePresent();
            default:
                return false;
        }
    }

    _isActiveEndConditionObject(): boolean {
        if (this.behaviour.data.endCondition.presence.data.type === "SPHERE" && this.presenceLocations.length !== 0) {
            return true;
        }
        if (this.behaviour.data.endCondition.presence.data.type === "LOCATION") {
            for (let i = 0; i < this.presenceLocations.length; i++) {
                // @ts-ignore
                if ("locationIds" in this.presenceLocations[i] && this.behaviour.data.endCondition.presence.data.locationIds.some(r => this.presenceLocations[i].locationIds.indexOf(r) >= 0)) {
                    return true;
                }
                ;
            }
        }
        return false;
    }

    /* Checks if someone is present in the sphere or a certain location

     */
    _isSomeonePresent(): boolean {
        const result = this.presenceLocations.forEach(profile => {
            if (profile.type === "SPHERE") {
                return true;
            } else if ("locationIds" in profile && profile.type === "LOCATION") {
                const result = profile.locationIds.forEach(id => {
                    if (this._hasPresenceGivenLocationId(id)) {
                        return true;
                    }
                });
                return (result !== undefined) ? true : false;
            }
        });
        return (result !== undefined) ? true : false;

    }

    _hasPresenceGivenLocationId(locationId: number): boolean {
        if ("data" in this.behaviour.data.presence && "locationIds" in this.behaviour.data.presence.data && locationId in this.behaviour.data.presence.data.locationIds) {
            return true
        } else {
            return false;
        }
    }

    _behaviourActiveCheck(): void {
        if (this.behaviour.type === "BEHAVIOUR") {
            if (this._isActiveTimeObject()) {
                if (this._isActivePresenceObject()) {
                    this.isActive = true;
                    return;
                }
            } else if ("endCondition" in this.behaviour.data && this.isActive) {
                if (this._isActiveEndConditionObject()) {
                    this.isActive = true;
                    return;
                }
            }
        }
        this.isActive = false;
    }

    _getWeekday(offsetDay: number = 0): number {
        const dayNumber = ((new Date(this.ticks).getDay()) + offsetDay) % 7
        return numberToWeekDay[dayNumber];
    }
}


function getSunsetTime(): Date {
    return new Date(2020, 9, 22, 20, 10, 0);
}

function getSunriseTime(): Date {
    return new Date(2020, 9, 22, 6, 10, 0);

}

