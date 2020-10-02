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

export class BehaviourAggregator {
    private moduleRunning: boolean;
    behaviours: object = {};
    pollingRate: number;

    light: Light;

    constructor(pollingRate: number = 500, light) {
        this.moduleRunning = false;
        this.light = light;
        this.pollingRate = pollingRate;

        eventBus.subscribe("lightStateChanged", (data) => {
            this._handleLightStateChange(data)
        }); ;

    }

    async init() {
        ///--- To Be changed
        let lightA = new Light("AA:BB:CC:DD:EE:FF:GG-af", {}, 0);
        ///---
        this.moduleRunning = true;
    }

    stop() {
        this.moduleRunning = false;
    }


    addBehaviour(behaviour: HueBehaviourWrapper) {

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

    _handleLightStateChange(data) {
        this._behaviourHandling(this.behaviours[data.uniqueId]);
        this._lightStateCheck(this.behaviours[data.uniqueId]);

    }


    _behaviourHandling(a){

    }
    _checkBehaviours() {
        if (this.behaviours == {}) {
            return;
        }
        Object.keys(this.behaviours).forEach(id => {
             //check if active
        })
    }


    _createStateFromBehaviour(data: LightBehaviourWrapper): StateUpdate {
        if (data.behaviourActive) {
            return {on: true, bri: data.behaviour.data.action.data * oneBriPercentage}
        } else {
            return {on: false}
        }
    }



    async _pollLights() {
            const prevLightState = this.light.getState();
            await this.light.renewState();
            if (JSON.stringify(this.light.getState()) !== JSON.stringify(prevLightState)) {
                debugPrintStateDifference(prevLightState, this.light.getState());
                eventBus.emit("lightStateChanged", this.light);
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

