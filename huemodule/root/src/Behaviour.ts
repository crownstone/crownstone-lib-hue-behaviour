import {EventBus} from "./util/EventBus";

const oneBriPercentage = 2.54;
const numberToWeekDay = {0: "Sun", 1: "Mon", 2: "Tue", 3: "Wed", 4: "Thu", 5: "Fri", 6: "Sat"}

export class Behaviour {
    behaviour: HueBehaviourWrapper;
    isActive: boolean;
    presenceLocations: number[];
    // presenceTypeActive: boolean;   // True on presence with "SOMEBODY", True without presence with "NOBODY", Always true with IGNORE
    eventBus: EventBus;
    ticks: number;

    constructor(behaviour, eventBus) {
        this.behaviour = behaviour;
        this.eventBus = eventBus;
        this.isActive = false;
        this._presenceOnCreation();
        this.eventBus.subscribe("onPresenceDetect", this.handlePresence.bind(this))
        this.ticks = Date.now()
    }

    tick(ticks = Date.now()) {
        this.ticks = ticks;
        this._behaviourActiveCheck();
    }

    handlePresence(data: DetectedPresence) {
        if (this.behaviour.data.presence.type !== "IGNORE") {
            if (data.type === "SPHERE") {

            } else if (data.type === "LOCATION") {

            }
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

    _isLocation(data) {
        // if (this.behaviour.data.presence.data.type === "SPHERE" && data.locationId === "SPHERE") {
        //     return true;
        // } else if (this.behaviour.data.presence.data.type === "LOCATION") {
        //     return (this.behaviour.data.presence.data.locationIds[0] === data.locationId) ? true : false; //Currently 1 room sup.
        // } else {
        //     return false; //Type is wrong.
        // }
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
        if (currentTimeInMinutes >= fromTimeInMinutes ) {
            // 12:00 -> (15:59)    curr. 13:00   13:00 < 15:59 = true;
            if( currentTimeInMinutes < toTimeInMinutes){
                return this.behaviour.activeDays[this._getWeekday()];
            }
            // 12:00 -> 11:00 Curr. 13:00 11:00 < 12:00 = true. Meaning that the time overlaps to next day and will be caught at 00:00 by yesterday checking
            if(toTimeInMinutes < fromTimeInMinutes){
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

    //todo PresenceData & Delay
    // _isActivePresenceObject() {
    //     switch (this.behaviour.data.presence.type) {
    //         case "SOMEBODY":
    //             return this.someoneInRoom;
    //
    //         case "NOBODY":
    //             return !this.someoneInRoom;
    //
    //         case "IGNORE":
    //             return true;
    //     }
    // }

    _behaviourActiveCheck() {
        if (this.behaviour.type === "BEHAVIOUR") {
            if (this._isActiveTimeObject()) {
                // if (this._isActivePresenceObject()) {
                //     this.isActive = true;
                // }
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

