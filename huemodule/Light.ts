import {Bridge} from "./Bridge";

type hueState  = {
    on: boolean,
    bri?: number,
    hue?: number,
    sat?: number,
    effect?: string,
    xy?: [ number, number ],
    ct?: number,
    alert?: string,
    colormode?: string,
    mode?: string,
    reachable?: boolean
}


export class Light {
    name: string;
    uniqueId: string;
    // TODO Look into state objects
    state: hueState;
    id: number;
    bridgeId: string;
    capabilities: object;
    supportedStates: object;
    //TODO Look if only api.lights is sufficient.
    connectedBridge: Bridge;
    lastUpdate: number;

    constructor(name: string, uniqueId: string, state: hueState, id: number, bridgeId: string,capabilities: object, supportedStates: object, connectedBridge: any) {
        this.name = name;
        this.uniqueId = uniqueId;
        this.state = state;
        this.id = id;
        this.bridgeId = bridgeId;
        this.capabilities = capabilities;
        this.supportedStates = supportedStates;
        this.connectedBridge = connectedBridge;
        this.lastUpdate = Date.now();
    }

    setName(name:string): void{
        this.name = name;
    }

    setLastUpdate():void{
        this.lastUpdate = Date.now();

    }
    async renewState(): Promise<void> {
        const newState = await this.connectedBridge.api.lights.getLightState(this.id);
        if( this.state != newState){
            this.state = newState
            this.setLastUpdate()
        }

    }

    //This is just to filter for the state object. It is not connected to the supported states.
    _isAllowedStateType(state):boolean {
        if (state === 'on' || state === 'hue' ||
            state === 'bri' || state === 'sat' ||
            state === 'effect' || state === 'xy' ||
            state === 'ct' || state === 'alert') {
            return true;
        } else {
            return false;
        }
    }


    updateState(state:object): void{
        Object.keys(state).forEach(key => {
            if (this._isAllowedStateType(key)) {
                this.state[key] = state[key];
            }
        });
        this.setLastUpdate()
    }

    async setState(state:object): Promise<boolean> {
        const result = this.connectedBridge.api.lights.setLightState(this.id.toString(), state);
        if (result) {
            this.updateState(state);
        }
        return result;
    }

    isReachable(): boolean{
        return this.state["reachable"];
    }

    getInfo(): object {
        return {
            name: this.name,
            uniqueId: this.uniqueId,
            state: this.state,
            bridgeId: this.bridgeId,
            id: this.id,
            supportedStates : this.supportedStates,
            capabilities: this.capabilities,
            lastUpdate: this.lastUpdate
        };
    }

    getSupportedStates(): object{
        return this.supportedStates;
    }
}