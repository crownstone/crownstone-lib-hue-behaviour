import {Bridge} from "./Bridge";

export class Light {
    name: string;
    uniqueId: string;
    state: object;
    id: number;
    api: Bridge;

    constructor(name: string, uniqueId: string, state: object, id: number, api: any) {
        this.name = name;
        this.uniqueId = uniqueId;
        this.state = state;
        this.id = id;
        this.api = api;
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
        const result = this.api.setLightState(this.id.toString(), state);
        if (result) {
            this.updateState(state);
        }
        return result;
    }

    getInfo(): object {
        return {name: this.name, uniqueId: this.uniqueId, state: this.state, id: this.id};
    }

}