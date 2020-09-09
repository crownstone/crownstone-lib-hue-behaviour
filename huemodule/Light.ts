import {Bridge} from "./Bridge";

export class Light {
    name: string;
    uniqueId: string;
    // TODO Look into state objects
    state: object;
    id: number;
    //TODO Look if only api.lights is sufficient.
    connectedBridge: Bridge;
    capabilities: object;
    supportedStates:object;

    constructor(name: string, uniqueId: string, state: object, id: number,capabilities: object,supportedStates: object, connectedBridge: any) {
        this.name = name;
        this.uniqueId = uniqueId;
        this.state = state;
        this.id = id;
        this.capabilities = capabilities;
        this.connectedBridge = connectedBridge;
        this.supportedStates = supportedStates;

    }


    update(newValues: object) {
        Object.keys(newValues).forEach(key => {
            if (typeof (this[key]) !== undefined) {
                this[key] = newValues[key];
            }

        });
    }

    updateState(state) {
        Object.keys(state).forEach(key => {
            if (typeof (this[key]) !== undefined) {
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
        return {name: this.name, uniqueId: this.uniqueId, state: this.state, id: this.id, capabilities : this.capabilities};
    }

}