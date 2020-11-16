import {
    LIGHT_POLLING_RATE
} from "../constants/HueConstants";
import Timeout = NodeJS.Timeout;
import {lightUtil} from "../util/LightUtil";
import {GenericUtil} from "../util/GenericUtil";




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
 * @param api  - callBack to Api function
 * @param lastUpdate - Timestamp of when the state was last changed.
 * @param intervalId - Timeout object for the interval.
 * @param stateChangeCallback - Callback for when state is change
 *
 */
export class Light {
    name: string;
    readonly uniqueId: string;
    private state: HueFullState;
    readonly id: number;
    bridgeId: string;
    capabilities: object;
    supportedStates: [];
    api: ((action,extra?) => {});
    lastUpdate: number;
    intervalId : Timeout;
    stateChangeCallback = ((value) => {});

    constructor(name: string, uniqueId: string, state: HueFullState, id: number, bridgeId: string, capabilities: object, supportedStates: [], api: any) {
        this.name = name;
        this.uniqueId = uniqueId;
        this.state = state;
        this.id = id;
        this.bridgeId = bridgeId;
        this.capabilities = capabilities;
        this.supportedStates = supportedStates;
        this.api = api;
        this.lastUpdate = Date.now();
    }

    // TODO: protect this init from being called more than once.
    init():void{
        // if (this.initialized) { return; }
        // this.initialize = true
        this.intervalId = setInterval(async () => await this.renewState(), LIGHT_POLLING_RATE);
    }

    // TODO: rename this method so we know what this callback does
    // Can setStateUpdateCallback or something.
    setCallback(callback){
        this.stateChangeCallback = callback;
    }

    _setLastUpdate(): void {
        this.lastUpdate = Date.now();
    }

    cleanup(){
        clearInterval(this.intervalId);
    }

    /**
     * Obtains the state from the light on the bridge and updates the state object if different.
     */
    async renewState(): Promise<void> {
        let newState = await this.api("getLightState",this.id) as failedConnection | HueFullState;
        if("hadConnectionFailure" in newState && newState.hadConnectionFailure){
            return;
        }
        newState = newState as HueFullState;
        if ( typeof(newState) !== "undefined" && !lightUtil.stateEqual(this.state,newState)) {
            this.state = <HueFullState>GenericUtil.deepCopy(newState);
            this._setLastUpdate();
            this.stateChangeCallback(this.state);
        }
        else if( typeof(newState) !== "undefined" && this.state.reachable !== newState.reachable){
            this.state.reachable = newState.reachable
            this._setLastUpdate();
        }
    }


    getState(): HueFullState {
        return <HueFullState>GenericUtil.deepCopy(this.state);
    }


     _updateState(state: StateUpdate): void {
        Object.keys(state).forEach(key => {
            if (lightUtil.isAllowedStateType(key)) {
                this.state[key] = state[key];
            }
        });
        this._setLastUpdate()
    }
    /**
     * Sets the state of the light.
     */
    async setState(state: StateUpdate): Promise<boolean> {
        state = lightUtil.manipulateMinMaxValueStates(state);
        const result = await this.api("setLightState",[this.id.toString(), state]) as failedConnection | boolean;
        if((typeof result !== "boolean" && result.hadConnectionFailure)){
            return false;
        }
        if (result) {
            this._updateState(state);
        }
        return <boolean>result;
    }

    isReachable(): boolean {
        return this.state["reachable"] || false;
    }

    getInfo(): lightInfo {
        return GenericUtil.deepCopy({
            name: this.name,
            uniqueId: this.uniqueId,
            state: this.state,
            bridgeId: this.bridgeId,
            id: this.id,
            supportedStates: this.supportedStates,
            capabilities: this.capabilities,
            lastUpdate: this.lastUpdate
        });
    }

    getUniqueId(): string {
        return this.uniqueId;
    }
    getSupportedStates(): [] {
        return this.supportedStates;
    }
}