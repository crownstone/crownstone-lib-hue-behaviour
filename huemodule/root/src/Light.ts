import {Bridge} from "./Bridge";


const maxValueOfStates: StateUpdate = {
    'hue': 65535,
    'bri': 254,
    'sat': 254,
    'xy': [0.5, 0.5],
    'ct': 500
}

const minValueOfStates: StateUpdate = {
    'hue': 0,
    'bri': 1,
    'sat': 0,
    'xy': [0.0, 0.0],
    'ct': 153
}

const minMaxValueStates = {
    'hue': true,
    'bri': true,
    'sat': true,
    'xy': true,
    'ct': true,
}
const possibleStates = {
    ...minMaxValueStates,
    'on': true,
    'effect': true,
    'alert': true
}

/**
 * Light object
 *
 * @remarks
 *
 * @param name - Name of the light.
 * @param uniqueId - Unique id of the Light.
 * @param state - The state of the light.
 * @param id - The id of the light on the Bridge.
 * @param bridgeId - The id of the Bridge the Light is connected to.
 * @param capabilities - Capabilities what the light is capable off,  For each light type it's different. Info added on creation from Bridge.
 * @param supportedStates - supported states of the light. For each light type it's different. Info added on creation from Bridge.
 * @param connectedBridge - Link to the bridge object it is connected to.
 * @param lastUpdate - Timestamp of when the state was last changed.
 *
 */
export class Light {
    name: string;
    readonly uniqueId: string;
    private state: HueState;
    readonly id: number;
    bridgeId: string;
    capabilities: object;
    supportedStates: object;
    connectedBridge: Bridge;
    lastUpdate: number;

    constructor(name: string, uniqueId: string, state: HueState, id: number, bridgeId: string, capabilities: object, supportedStates: object, connectedBridge: any) {
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

    private _setLastUpdate(): void {
        this.lastUpdate = Date.now();

    }

    /**
     * Obtains the state from the light on the bridge and updates the state object if different.
     */
    async renewState(): Promise<void> {
        const newState = await this.connectedBridge.api.lights.getLightState(this.id);
        if (this.state != newState) {
            this.state = newState
            this._setLastUpdate()
        }
    }

    getState(): HueState {
        return this.state;
    }

    private _isAllowedStateType(state): boolean {
        return possibleStates[state] || false;
    }

    private _updateState(state: StateUpdate): void {

        Object.keys(state).forEach(key => {
            if (this._isAllowedStateType(key)) {
                this.state[key] = state[key];
            }
        });
        this._setLastUpdate()
    }


    /**
     * Checks if state value is out of it's range and then return right value.
     *
     * @return State value between it's min and max.
     */
   private _manipulateMinMaxValueStates(state:StateUpdate): StateUpdate {
        Object.keys(state).forEach(key => {
            if ((minMaxValueStates[key] || false)) {
                if (key === "xy") {
                    state[key] = [Math.min(maxValueOfStates[key][0], Math.max(minValueOfStates[key][0], state[key][0])), Math.min(maxValueOfStates[key][1], Math.max(minValueOfStates[key][1], state[key][1]))];
                } else {
                    state[key] = Math.min(maxValueOfStates[key], Math.max(minValueOfStates[key], state[key]));
                }
            }
        });

        return state;
    }

    /**
     * Sets the state of the light.
     */
    async setState(state: StateUpdate): Promise<boolean> {
        state = this._manipulateMinMaxValueStates(state);
        const result = await this.connectedBridge.api.lights.setLightState(this.id.toString(), state);
        if (result) {
            this._updateState(state);
        }
        return result;
    }

    isReachable(): boolean {
        return this.state["reachable"] || false;
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