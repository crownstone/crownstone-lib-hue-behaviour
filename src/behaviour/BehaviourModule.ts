import {CrownstoneHue} from "../index";
import {eventBus} from "../util/EventBus";

const oneBriPercentage = 2.54;

class fakeLights {
    uniqueId: string;
    state: { on: boolean, bri: number };
    id: number;

    constructor(uniqueId, state, id) {
        this.uniqueId = uniqueId;
        this.state = state;
        this.id = id;
    }

    getState() {
        return this.state;
    }

    renewState() {

    }


    setState(state) {
        if (state.bri != undefined) {
            this.state.bri = state.bri;
        }
        if (state.on != undefined) {
            this.state.on = state.on;
        }
        this.printLightInformation()
    }

    printLightInformation() {
        console.log(`Light is turned ${(this.state.on) ? "ON" : "OFF"} with a brightness of ${(this.state["bri"]) / oneBriPercentage}%`)
    }

}

class Light extends fakeLights {

}


const delay = ms => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

interface LightBehaviourWrapper {
    behaviour: HueBehaviourWrapper,
    light: Light,
    overrideActive: boolean
    behaviourActive: boolean
    presence: true,
    presenceUpdated: number
}


class BehaviourSimulator {

}

class LightBehaviour extends Light {
    lightPolling = setInterval(this.poll, 500);
    eventBus: EventBus;

    constructor(uniqueId, state, id, eventBus) {
        super(uniqueId, state, id);
        this.eventBus = eventBus;
    }

    poll() {
        const old = this.state;
        this.renewState();
        if (old != this.state) {
            this.eventBus.emit("presenceChanged", this);
        }
    }


}

export class BehaviourModule {
    private moduleRunning: boolean;
    behaviours: object = {};
    pollingRate: number;
    lightsInRoom: object;

    lights: Light[];

    constructor(pollingRate: number = 500) {
        this.moduleRunning = false;
        this.lightsInRoom = {};
        this.lights = [];
        this.pollingRate = pollingRate;

        eventBus.subscribe("lightStateChanged", (data) => {
            this._handleLightStateChange(data)
        });
        eventBus.subscribe("presenceDetected", this._onPresenceDetected.bind(this));
        // Ik zou dit niet doen, probeer gewoon een goed beschrijvende log in elke error
        // eventBus.subscribe("error", this._errorHandling.bind(this));
    }

    async init() {
        ///--- To Be changed
        let lightA = new Light("AA:BB:CC:DD:EE:FF:GG-af", {}, 0);
        let lightB = new Light("TT:EE:SS:TT:11:22:33-af", {}, 1);
        this.lightsInRoom["Bedroom"] = [lightA, lightB];

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


            return (this.moduleRunning) ? this._loop() : "STOPPED";
        } catch (err) {
            eventBus.emit("error", err);
            return (this.moduleRunning) ? this._loop() : "STOPPED";
        }
    }

    setDumbHouseMode(on: boolean) {

    }

    detectPresence(data) {
        if (!this.moduleRunning) {
            return;
        }
        eventBus.emit("presenceDetected", data);
    }

    _handleLightStateChange(data) {
        this._behaviourHandling(this.behaviours[data.uniqueId]);
        this._lightStateCheck(this.behaviours[data.uniqueId]);

    }

    async _onPresenceDetected(data) {
        if (!this.lightsInRoom[data.room]) {
            return;
        }
        this.lightsInRoom[data.room].forEach(light => {
            this.behaviours[light.uniqueId].someoneInRoom = data.presence;

            // to be removed/changed        .
            this._behaviourHandling(this.behaviours[light.uniqueId]);
            this._stateHandling(this.behaviours[light.uniqueId]);
            this._lightStateCheck(this.behaviours[light.uniqueId]);


        });
    }

    _behaviourHandling(a){

    }
    _checkBehaviours() {
        if (this.behaviours == {}) {
            return;
        }
        Object.keys(this.behaviours).forEach(id => {
            const oldBehaviour = this.behaviours[id].behaviourActive
            this._behaviourHandling(this.behaviours[id]);
            if (oldBehaviour != this.behaviours[id].behaviourActive) {
                this._lightStateCheck(this.behaviours[id]);
            }
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


    /*

    user gets in room... lights on.
    User turns lights off.  > Beh: on = override true.
    user leaves room, lights still off. override false;

     */

    //Todo When state match. override checking
    _lightStateCheck(data: LightBehaviourWrapper) {
        if (data.light.getState().on === this._createStateFromBehaviour(data).on && data.light.getState().bri === this._createStateFromBehaviour(data).bri) {
            data.overrideActive = false;
        } else {
            if (!data.behaviourActive && !data.light.getState().on) {
                data.overrideActive = false;
            } else if (data.light.getState().on !== this._createStateFromBehaviour(data).on || data.light.getState().bri !== this._createStateFromBehaviour(data).bri) {
                data.overrideActive = true
                console.log("OVERRIDE ACTIVE");

            }

        }
    }

    _errorHandling(error) {
        console.log(error);
    }

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

