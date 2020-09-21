
import {Framework} from "./index";
import {Light} from "./index";



class EventBus {
    subscriptions = {}

    constructor() {
    }

    subscribe(topic: string, callback: (data: any) => void): void {
        this.subscriptions[topic] = callback;
    }

    emit(topic: string, data: any): void {
        this.subscriptions[topic](data);
    }

    reset() {
        this.subscriptions = {};
    }

}

const framework = new Framework();
const oneBriPercentage = 2.54;

const delay = ms => {
    return new Promise(resolve => setTimeout(resolve, ms));
};
interface LightBehaviourWrapper{
    behaviour: behaviourWrapper,
    lights: Light,
    override: boolean
}

export class BehaviourModule{
    eventBus = new EventBus();
    private moduleRunning: boolean = false;
    behaviours: object = {};
    pollingRate: number = 500;
    lightsInRoom: object = {};

    lights: Light[] = [];

    constructor(pollingRate:number = 500){
        this.pollingRate = pollingRate;
    }
    async init(){
        ///--- To Be changed
        const bridges = await framework.init();
        const bridge = bridges[0];
        await bridge.init();

        this.lights = bridge.getConnectedLights()
        this.lightsInRoom["Bedroom"] = [this.lights[0], this.lights[1]];

        ///---
        this.createSubscription();
        this.moduleRunning = true;
    }
    stop(){
        this.moduleRunning = false;
    }


    addBehaviour(behaviour:object,room){
        if(this.lightsInRoom[room] !== undefined){
            this.lightsInRoom[room].forEach(light => {
                this.behaviours[light.uniqueId] = {behaviour: behaviour, light: light, override: false}
            })
        }
    }

    createSubscription(){
        this.eventBus.subscribe("lightStateChanged", this._lightStateCheck);
        this.eventBus.subscribe("presenceDetected", this._onPresenceDetected);
        this.eventBus.subscribe("error", this._errorHandling);
    }

    async _loop(){
            try {
                await this._pollLights();
                await delay(this.pollingRate);
                if(this.moduleRunning){
                return this._loop();
                } else {
                    return;
                }
            } catch(err){
                this.eventBus.emit("error", err);
                if(this.moduleRunning){
                    return this._loop();
                } else {
                    return;
                }
            }
    }


    //work around..
    detectPresence(data) {
        data = {...data, lightsInRoom: this.lightsInRoom, behaviours: this.behaviours}
        this.eventBus.emit("presenceDetected", data);
    }

    async _onPresenceDetected(data) {
        await data.lightsInRoom[data.room].forEach(async light => {
            if (data.behaviours[light.uniqueId].override) {
                console.log("OVERRIDE ACTIVE! ON LIGHT " + light.id)
            } else {
                await light.setState({on: data.presence, bri: data.behaviours[light.uniqueId].behaviour.data.action.data * oneBriPercentage});
            }
        });
    }




    async _pollLights(){
        for (const light of this.lights) {
            const prevLightState = light.getState();
            await light.renewState();
            if (JSON.stringify(light.getState()) !== JSON.stringify(prevLightState)) {
                debugPrintStateDifference(prevLightState,light.getState());
                this.eventBus.emit("lightStateChanged", light);
            }
        }
    }


    _lightStateCheck(data) {
        console.log(this);
        if(this.behaviours[data.uniqueId] !== undefined){
            if ((data.getState().on === true && this.behaviours[data.uniqueId].behaviour.data.action.type === "BE_ON") && (data.getState().bri === this.behaviours[data.uniqueId].behaviour.data.action.data * oneBriPercentage)) {
                this.behaviours[data.uniqueId].override = false;
            } else {
                this.behaviours[data.uniqueId].override = true;
            }
        }
    }

    _errorHandling(error){
        console.log(error);
    }

}



function debugPrintStateDifference(oldS,newS){
    let printableState = {};

    Object.keys(oldS).forEach( key => {
        if(JSON.stringify(oldS[key]) !== JSON.stringify(newS[key])){
            printableState[key] = {old: oldS[key],new: newS[key]};
        }
    });
    console.log(printableState);
}

