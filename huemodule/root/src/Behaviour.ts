import {EventBus} from "./util/EventBus";

const oneBriPercentage = 2.54;
const numberToWeekDay = {0: "Sun", 1: "Mon", 2: "Tue", 3: "Wed", 4: "Thu", 5: "Fri", 6: "Sat"}

export class Behaviour {
    behaviour: HueBehaviourWrapper;
    isActive: boolean;
    presenceLocations: PresenceProfile[]; // Empty when no one is present for this behaviour.
    eventBus: EventBus;
    ticks: number; // ms

    constructor(behaviour, eventBus) {
        this.behaviour = behaviour;
        this.eventBus = eventBus;
        this.presenceLocations = [];
        this.ticks = Date.now();
        this._behaviourActiveCheck();

        this.eventBus.subscribe("onPresenceDetect", this._onPresenceDetect.bind(this));
    }

    tick(ticks = Date.now()) {
        this.ticks = ticks;
        this._behaviourActiveCheck();
    }


    /**
     * On Presence detection when someone enters/leaves a SPHERE or LOCATION,
     * Checks if Behaviour has IGNORE as presence type and if endCondition is set.
     * Calls _handlePresenceEvent() with the appropriate Presence object.
     * @param presenceEvent - PresenceEvent object of type ENTER or LEAVE, containing information of who enters/leaves which room or the house.
     */
    _onPresenceDetect(presenceEvent: PresenceEvent): void {
        if (this.behaviour.data.presence.type !== "IGNORE") {
            this._handlePresenceEvent(presenceEvent, this.behaviour.data.presence)
        } else if ("endCondition" in this.behaviour.data && this.behaviour.data.endCondition.presence.type === "SOMEBODY") {
            this._handlePresenceEvent(presenceEvent, this.behaviour.data.endCondition.presence)
        }
    }

    /**
     * Parsing function for Presence Detection Event Handling,
     * Simple check for handling the appropriate event.
     * @param presenceEvent - PresenceEvent object of type ENTER or LEAVE
     * @param presenceObject - Presence object, can be the one of Behaviour.presence or Behaviour.endCondition.
     */
    _handlePresenceEvent(presenceEvent: PresenceEvent, presenceInformation): void {
        if (presenceEvent.type === "ENTER") {
            this._onPresenceEnterEvent(presenceEvent, presenceInformation);
        } else if (presenceEvent.type === "LEAVE") {
            this._onPresenceLeaveEvent(presenceEvent);
        }
    }

    /**
     * On Presence detection when someone enters a SPHERE or LOCATION,
     * If SPHERE related, Check if Behaviour handles SPHERE based presences, then simply add PresenceProfile to list.
     * If LOCATION related, Check if Behaviour handles LOCATION based presences,
     *    If true: Check if PresenceProfile locationId matches locationId in Presence object locationIds.
     *        If true: add to presenceLocations list if matches.
     * @param presenceEvent - PresenceEvent object of type ENTER, containing information of who entered a which room or the house.
     * @param presenceObject - Presence object, can be the one of Behaviour.presence or Behaviour.endCondition.
     */
    _onPresenceEnterEvent(presenceEvent: PresenceEvent, presenceObject: Presence): void {
        if (presenceEvent.data.type === "SPHERE") {
            if ("data" in presenceObject && presenceObject.data.type === "SPHERE") {
                this.presenceLocations.push(presenceEvent.data);
            }
        } else if (presenceEvent.data.type === "LOCATION") {
            if ("data" in presenceObject && presenceObject.data.type === "LOCATION") {
                if (presenceEvent.data.locationId in presenceObject.data.locationIds) {
                    this.presenceLocations.push(presenceEvent.data);
                }
            }
        }
    }

    /**
     * On Presence detection when someone leaves a SPHERE or LOCATION,
     * Removes the PresenceProfile from the list on a match.
     *
     * @param presenceEvent - PresenceEvent object of type LEAVE, containing information of who leaves which room or the house.
     */
    _onPresenceLeaveEvent(presenceEvent: PresenceEvent): void {
        for (let i = 0; i < this.presenceLocations.length; i++) {
            let presenceProfile = this.presenceLocations[i];
            if (presenceProfile.profileIdx === presenceEvent.data.profileIdx) {
                if (presenceEvent.data.type === "SPHERE" && presenceProfile.type === "SPHERE") {
                    this.presenceLocations[i] = undefined;
                    break;
                }
                if (presenceEvent.data.type === "LOCATION" && presenceProfile.type === "LOCATION") {
                    if (presenceEvent.data.locationId === presenceProfile.locationId) {
                        this.presenceLocations[i] = undefined;
                        break;
                    }
                }
            }
        }
    }

    /**
     * Retrieves the Behaviour's composed state.
     *
     *
     * @Returns a Hue Light state
     */
    getComposedState(): StateUpdate {
        return (this.isActive) ? this._createComposedState() : {on: false}
    }

    _createComposedState(): StateUpdate {
        return {on: true, bri: this.behaviour.data.action.data * oneBriPercentage}
    }

    _isActiveTimeAllDay(): boolean {
        const currentTimeInMinutes = new Date(this.ticks).getMinutes() + (new Date(this.ticks).getHours() * 60);

        //Checks if current time is between  00:00 > 03:59.
        if (currentTimeInMinutes < 4 * 60) {
            //Checks if yesterday should be active.
            return this.behaviour.activeDays[this._getWeekday(-1)]
        } else {//Else means 04:00 -> 23:59.
            //Is Today active. Thus 04:00 -> 23:59
            return this.behaviour.activeDays[this._getWeekday()]
        }
    }


    /**
     * Retrieves the Behaviour's (de)activation time in minutes.

     * @Param operator -  Either from or to
     *
     * @Returns
     */
    _getSwitchingTime(operator: "from" | "to"): number {
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

        //Checks if Behaviour is activated yesterday and is still active.
        if (((toTimeInMinutes - fromTimeInMinutes) < 0) && (currentTimeInMinutes < toTimeInMinutes)) {
            return this.behaviour.activeDays[this._getWeekday(-1)];
        }

        //Checks if behaviour should be activated today
        if (currentTimeInMinutes >= fromTimeInMinutes) {
            //Checks if behaviour is still active with ending day today)
            if (currentTimeInMinutes < toTimeInMinutes) {
                return this.behaviour.activeDays[this._getWeekday()];
            }
            // If above failed, check if ending day is the next day.
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
        return ("endCondition" in this.behaviour.data && this.isActive && this._isSomeonePresent())?true:false;
    }

    /**
     * Presence check
     *
     * @returns Boolean - True if Someone is present, False if No one is present.
     */
    _isSomeonePresent(): boolean {
        return (this.presenceLocations.length > 0);
    }

    _behaviourActiveCheck(): void {
        if (this.behaviour.type === "BEHAVIOUR"
        ) {
            if (this._isActiveTimeObject()) {
                if (this._isActivePresenceObject()) {
                    this.isActive = true;
                    return;
                }
            } else if (this._isActiveEndConditionObject()) {
                this.isActive = true;
                return;

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

