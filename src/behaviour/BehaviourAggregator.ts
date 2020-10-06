import {CrownstoneHue, Light} from "../index";
import {eventBus} from "../util/EventBus";
import {Behaviour} from "./behaviour/Behaviour";

const oneBriPercentage = 2.54;

const delay = ms => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

export class BehaviourAggregator {
    private moduleRunning: boolean = false;
    behaviours: Behaviour[] = [];
    pollingRate: number;
    isInOverride:boolean = false;
    light: Light;

    constructor(pollingRate: number = 500, light) {
        this.light = light;
        this.pollingRate = pollingRate;



    }

    init() {
        this.moduleRunning = true;
    }

    stop() {
        this.moduleRunning = false;
    }


    addBehaviour(behaviour: HueBehaviourWrapper,sphereLocation: SphereLocation) {
        this.behaviours.push(new Behaviour(behaviour,sphereLocation));
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

    _checkBehaviours() {
        if (this.behaviours === []) {
            return;
        }
        this.behaviours.forEach(behaviour => {
             //check if active
        })
    }

    async _pollLights() {
            const prevLightState = this.light.getState();
            await this.light.renewState();
            if (JSON.stringify(this.light.getState()) !== JSON.stringify(prevLightState)) {
                debugPrintStateDifference(prevLightState, this.light.getState());
                eventBus.emit("lightStateChanged", this.light);
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

