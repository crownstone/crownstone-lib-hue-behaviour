import {Bridge} from "./Bridge";

export class Light {
    name: string;
    uniqueId: string;
    // TODO Look into state objects
    state: object;
    id: number;
    bridgeId: string;
    capabilities: object;
    supportedStates: object;
    //TODO Look if only api.lights is sufficient.
    connectedBridge: Bridge;


    constructor(name: string, uniqueId: string, state: object, id: number, bridgeId: string,capabilities: object, supportedStates: object, connectedBridge: any) {
        this.name = name;
        this.uniqueId = uniqueId;
        this.state = state;
        this.id = id;
        this.bridgeId = bridgeId;
        this.capabilities = capabilities;
        this.supportedStates = supportedStates;
        this.connectedBridge = connectedBridge;

    }

    // update(newValues: object) {
    //     Object.keys(newValues).forEach(key => {
    //         if (typeof (this[key]) !== undefined) {
    //             this[key] = newValues[key];
    //         }
    //
    //     });
    // }

    async updateStateFromBridge(): Promise<void> {
        this.state = await this.connectedBridge.api.lights.getLightState(this.id);
    }

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

    updateState(state): void{
        Object.keys(state).forEach(key => {
            if (this._isAllowedStateType(key)) {
                this.state[key] = state[key];
            }
        });
    }

    async setState(state): Promise<boolean> {
        const result = this.connectedBridge.api.lights.setLightState(this.id.toString(), state);
        if (result) {
            this.updateState(state);
        }
        return result;
    }

    getInfo(): object {
        return {
            name: this.name,
            uniqueId: this.uniqueId,
            state: this.state,
            bridgeId: this.bridgeId,
            id: this.id,
            capabilities: this.capabilities
        };
    }

}