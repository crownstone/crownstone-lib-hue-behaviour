import {EventBus} from "./EventBus";

const oneBriPercentage = 2.54;
const numberToWeekDay = {0: "Sun", 1: "Mon", 2: "Tue", 3: "Wed", 4: "Thu", 5: "Fri", 6: "Sat"}

class Behaviour {
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
        this.ticks = new Date.now()
    }

    tick(ticks = new Date.now()) {
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
        return (this.isActive)?this._createComposedState():{on: false}
    }

    _createComposedState(){
        const state = {on: true, bri: this.behaviour.data.action.data * oneBriPercentage}
    }


    //TODO Get save state?
    _presenceOnCreation() {
        return (this.behaviour.data.presence.type === "IGNORE") ? this.currentPresence = "IGNORE" : "NOBODY";
    }

    _isLocation(data) {
        if (this.behaviour.data.presence.data.type === "SPHERE" && data.locationId === "SPHERE") {
            return true;
        } else if (this.behaviour.data.presence.data.type === "LOCATION") {
            return (this.behaviour.data.presence.data.locationIds[0] === data.locationId) ? true : false; //Currently 1 room sup.
        } else {
            return false; //Type is wrong.
        }
    }


    /*
    Checks if type All_DAY is still valid.


    if currentTimeInMinutes < 240 = new day.. Check yesterday for activation..

    04:00 - 03:59
     */
    _isActiveTimeAllDay(){
        const currentMinutesInDay = new Date(this.ticks).getMinutes() + (new Date(this.ticks).getHours() * 60);

        //Checks if time is between  00:00 > 03:59.
        if(currentMinutesInDay < 4*60){
            //Checks if yesterday should be active.
            return numberToWeekDay[(new Date(this.ticks).getDay() === 0?6:new Date(this.ticks).getDay() - 1)]
        } else {//Else means 04:00 -> 23:59.
            //Is Today active. Thus 04:00 -> 23:59
            return numberToWeekDay[new Date(this.ticks).getDay()];
        }
    }

    _isActiveTimeObject() {
        const currentMinutesInDay = new Date().getMinutes() + (new Date().getHours() * 60);


        if(this.behaviour.data.time.type === "ALL_DAY"){
            return this._isActiveTimeAllDay();
        }

        if (this.behaviour.data.time.type === "RANGE") {

            //TODO Impl. sunset sunrise
            const getSunsetTime = () => {
                return new Date(2020, 9, 22, 20, 10, 0);
            }
            const getSunriseTime = () => {
                return new Date(2020, 9, 22, 6, 10, 0);
            }

            const handleTimeObject = (operator: string) => {
                let switchingTime = 0;
                if (this.behaviour.data.time[operator].type === "SUNRISE") {
                    switchingTime = getSunriseTime().getMinutes() + this.behaviour.data.time.from.offsetMinutes + (getSunriseTime().getHours() * 60);
                }

                if (this.behaviour.data.time[operator].type === "SUNSET") {
                    switchingTime = getSunsetTime().getMinutes() + this.behaviour.data.time.from.offsetMinutes + (getSunsetTime().getHours() * 60);
                }

                if (this.behaviour.data.time[operator].type === "CLOCK") {
                    switchingTime = this.behaviour.data.time[operator].data.minutes + (this.behaviour.data.time[operator].data.hours * 60)
                }

                if (operator === "from") {
                    if (currentMinutesInDay >= switchingTime) {
                        return true;
                    } else {
                        return false;
                    }
                } else if (operator === "to") {
                    if (currentMinutesInDay <= switchingTime) {
                        return true;
                    } else {
                        return false;
                    }
                }
            }


            if (handleTimeObject("from") && handleTimeObject("to")) {
                return true;
            }
        }

        return false;
    }

    //todo PresenceData & Delay
    _isActivePresenceObject() {
        switch (this.behaviour.data.presence.type) {
            case "SOMEBODY":
                return this.someoneInRoom;

            case "NOBODY":
                return !this.someoneInRoom;

            case "IGNORE":
                return true;
        }
    }

    _behaviourActiveCheck() {
        if (this.behaviour.type === "BEHAVIOUR") {
                if (this._isActiveTimeObject()) {
                    if(this._isActivePresenceObject()){
                        this.isActive = true;
                    }
            }
        }
        this.isActive = false;
    }
}


function getDayOfToday(): number {
    return numberToWeekDay[new Date(this.ticks).getDay()];

}