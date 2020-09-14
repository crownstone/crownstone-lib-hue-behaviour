import {Bridge} from "./Bridge";


interface hueState {
    on: boolean,
    bri?: number,
    hue?: number,
    sat?: number,
    effect?: string,
    xy?: [number, number],
    ct?: number,
    alert?: string,
    colormode?: string,
    mode?: string,
    reachable?: boolean
}


const possibleStates = {
    'on': true,
    'hue': true,
    'bri': true,
    'sat': true,
    'effect': true,
    'xy': true,
    'ct': true,
    'alert': true
}

export class Light {
    name: string;
    uniqueId: string;
    state: hueState;
    id: number;
    bridgeId: string;
    capabilities: object;
    supportedStates: object;
    connectedBridge: Bridge;
    lastUpdate: number;

    constructor(name: string, uniqueId: string, state: hueState, id: number, bridgeId: string, capabilities: object, supportedStates: object, connectedBridge: any) {
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

    setName(name: string): void {
        this.name = name;
    }

    setLastUpdate(): void {
        this.lastUpdate = Date.now();

    }

    async renewState(): Promise<void> {
        const newState = await this.connectedBridge.api.lights.getLightState(this.id);
        if (this.state != newState) {
            this.state = newState
            this.setLastUpdate()
        }

    }

    //This is just to filter for the state object. It is not connected to the supported states.
    _isAllowedStateType(state): boolean {
        return possibleStates[state] || false;
    }


    updateState(state: object): void {
        Object.keys(state).forEach(key => {
            if (this._isAllowedStateType(key)) {
                this.state[key] = state[key];
            }
        });
        this.setLastUpdate()
    }

    async setState(state: object): Promise<boolean> {
        const result = await this.connectedBridge.api.lights.setLightState(this.id.toString(), state);
        if (result) {
            this.updateState(state);
        }
        return result;
    }

    isReachable(): boolean {
        return this.state["reachable"];
    }

    getInfo(): object {
        return {
            name: this.name,
            uniqueId: this.uniqueId,
            state: this.state,
            bridgeId: this.bridgeId,
            id: this.id,
            supportedStates: this.supportedStates,
            capabilities: this.capabilities,
            lastUpdate: this.lastUpdate
        };
    }

    getUniqueId(): string {
        return this.uniqueId;
    }


    getSupportedStates(): object {
        return this.supportedStates;
    }
}