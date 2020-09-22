import {Framework} from "./index";
import {Light} from "./index";
import {EventBus} from "./util/EventBus";

const framework = new Framework();
const oneBriPercentage = 2.54;


const numberToWeekDay = {0: "Sun", 1: "Mon", 2: "Tue", 3: "Wed", 4: "Thu", 5: "Fri", 6: "Sat"}

const delay = ms => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

interface LightBehaviourWrapper {
    behaviour: behaviourWrapper,
    light: Light,
    overrideActive: boolean
    behaviourActive: boolean
}

export class BehaviourModule {
    eventBus: EventBus;
    private moduleRunning: boolean;
    behaviours: object = {};
    pollingRate: number;
    lightsInRoom: object;

    lights: Light[];

    constructor(pollingRate: number = 500) {
        this.eventBus = new EventBus();
        this.moduleRunning = false;
        this.lightsInRoom = {};
        this.lights = [];
        this.pollingRate = pollingRate;

        this.eventBus.subscribe("lightStateChanged", (data) => {
            this._lightStateCheck(data)
        });
        this.eventBus.subscribe("presenceDetected", this._onPresenceDetected.bind(this));
        this.eventBus.subscribe("error", this._errorHandling.bind(this));
    }

    async init() {
        ///--- To Be changed
        const bridges = await framework.init();
        const bridge = bridges[0];
        await bridge.init();

        this.lights = bridge.getConnectedLights()
        this.lightsInRoom["Bedroom"] = [this.lights[0], this.lights[1]];

        ///---
        this.moduleRunning = true;
    }

    stop() {
        this.moduleRunning = false;
    }


    addBehaviour(behaviour: object, room) {
        if (this.lightsInRoom[room] !== undefined) {
            this.lightsInRoom[room].forEach(light => {
                this.behaviours[light.uniqueId] = {
                    behaviour: behaviour,
                    light: light,
                    overrideActive: false,
                    behaviourActive: false,
                    someoneInRoom: false
                }
            })
        }
    }


    async _loop() {
        try {
            await this._pollLights();
            this._checkBehaviours();
            await delay(this.pollingRate);


            return (this.moduleRunning) ? this._loop() : "";
        } catch (err) {
            this.eventBus.emit("error", err);
            return (this.moduleRunning) ? this._loop() : "";
        }
    }

    detectPresence(data) {
        if (!this.moduleRunning) {
            return;
        }
        this.eventBus.emit("presenceDetected", data);
    }

    async _onPresenceDetected(data) {
        if (!this.lightsInRoom[data.room]) {
            return;
        }
        this.lightsInRoom[data.room].forEach(light => {
            this.behaviours[light.uniqueId].someoneInRoom = data.presence;



            // to be removed/changed        .
            this._behaviourHandling(this.behaviours[light.uniqueId]);
            this._lightStateCheck(this.behaviours[light.uniqueId]);
            this._stateHandling(this.behaviours[light.uniqueId]);

        });
    }


    _checkBehaviours() {
        if (this.behaviours == {}) {
            return;
        }
        Object.keys(this.behaviours).forEach(id => {
            this._behaviourHandling(this.behaviours[id]);
            this._lightStateCheck(this.behaviours[id]);
        })
    }


    _createStateFromBehaviour(data: LightBehaviourWrapper): StateUpdate {
        if (data.behaviourActive) {
            return {on: true, bri: data.behaviour.data.action.data * oneBriPercentage}
        } else {
            return {on: false}
        }
    }

    //TODO endcondition
    _behaviourHandling(behaviourLightWrapper) {

        function isValidBehaviourType() {
            return behaviourLightWrapper.behaviour.type === "BEHAVIOUR"
        }

        function isActiveWeekObject() {
            return behaviourLightWrapper.behaviour.activeDays[getDayOfToday()]
        }

        function isActiveTimeObject() {
            if (behaviourLightWrapper.behaviour.data.time.type === "ALL_DAY") {
                return true;
            }
            if (behaviourLightWrapper.behaviour.data.time.type === "RANGE") {

                //TODO Impl. sunset sunrise
                const getSunsetTime = () => {
                    return new Date(2020, 9, 22, 20, 10, 0);
                }
                const getSunriseTime = () => {
                    return new Date(2020, 9, 22, 6, 10, 0);
                }

                const handleTimeObject = (operator: string) => {
                    let switchingTime = 0;
                    if (behaviourLightWrapper.behaviour.data.time[operator].type === "SUNRISE") {
                        switchingTime = getSunriseTime().getMinutes() + behaviourLightWrapper.behaviour.data.time.from.offsetMinutes + (getSunriseTime().getHours() * 60);
                    }

                    if (behaviourLightWrapper.behaviour.data.time[operator].type === "SUNSET") {
                        switchingTime = getSunsetTime().getMinutes() + behaviourLightWrapper.behaviour.data.time.from.offsetMinutes + (getSunsetTime().getHours() * 60);
                    }

                    if (behaviourLightWrapper.behaviour.data.time[operator].type === "CLOCK") {
                        switchingTime = behaviourLightWrapper.behaviour.data.time[operator].data.minutes + (behaviourLightWrapper.behaviour.data.time[operator].data.hours * 60)
                    }

                    const currentMinutesInDay = new Date().getMinutes() + (new Date().getHours() * 60);
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
        function isActivePresenceObject() {
            switch (behaviourLightWrapper.behaviour.data.presence.type) {
                case "SOMEBODY":
                    return behaviourLightWrapper.someoneInRoom;

                case "NOBODY":
                    return !behaviourLightWrapper.someoneInRoom;

                case "IGNORE":
                    return true;
            }
        }

        if (!isValidBehaviourType()) {
            //Todo Replace consolelog
            console.log("Not valid behaviour type");
            behaviourLightWrapper.behaviourActive = false;
            return;
        }
        if (!isActiveWeekObject()) {
            //Todo Replace consolelog
            console.log("Not active today.");
            behaviourLightWrapper.behaviourActive = false;
            return;
        }

        if (!isActivePresenceObject()) {
            //Todo Replace consolelog
            console.log("Not active with this presence state");
            behaviourLightWrapper.behaviourActive = false;
            return
        }

        if (!isActiveTimeObject()) {
            //Todo Replace consolelog
            console.log("Not active on this time of the day.");
            behaviourLightWrapper.behaviourActive = false;
            return;
        }


        behaviourLightWrapper.behaviourActive = true;
    }

    async _pollLights() {
        for (const light of this.lights) {
            const prevLightState = light.getState();
            await light.renewState();
            if (JSON.stringify(light.getState()) !== JSON.stringify(prevLightState)) {
                debugPrintStateDifference(prevLightState, light.getState());
                this.eventBus.emit("lightStateChanged", light);
            }
        }
    }

    _stateHandling(data: LightBehaviourWrapper) {
        if (!data.overrideActive) {
            data.light.setState(this._createStateFromBehaviour(data));
        } else {
            console.log("OVERRIDE ACTIVE");
        }
    }

    //Todo When state match. override checking
    _lightStateCheck(data: LightBehaviourWrapper) {
     return;
    }

    _errorHandling(error) {
        console.log(error);
    }

}

function getDayOfToday(): number {
    return numberToWeekDay[new Date().getDay()];

}

function debugPrintStateDifference(oldS, newS) {
    let printableState = {};

    Object.keys(oldS).forEach(key => {
        if (JSON.stringify(oldS[key]) !== JSON.stringify(newS[key])) {
            printableState[key] = {old: oldS[key], new: newS[key]};
        }
    });
    console.log(printableState);
}

