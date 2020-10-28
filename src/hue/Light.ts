import {
    LIGHT_POLLING_RATE
} from "../constants/HueConstants";
import {BehaviourAggregator} from "../behaviour/BehaviourAggregator";
import Timeout = NodeJS.Timeout;
import {v3} from "node-hue-api";
const hueApi = v3.api;
import {lightUtil} from "../util/LightUtil";




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
 * @param api  - Link to the api object it is connected to.
 * @param lastUpdate - Timestamp of when the state was last changed.
 * @param intervalId - Timeout object for the interval.
 * @param behaviourAggregator - Handles the behaviours.
 *
 */
export class Light {
    name: string;
    readonly uniqueId: string;
    private state: HueFullState;
    readonly id: number;
    bridgeId: string;
    capabilities: object;
    supportedStates: object;
    api: any;
    lastUpdate: number;
    intervalId : Timeout;
    behaviourAggregator: BehaviourAggregator;

    constructor(name: string, uniqueId: string, state: HueFullState, id: number, bridgeId: string, capabilities: object, supportedStates: object, api: any) {
        this.name = name;
        this.uniqueId = uniqueId;
        this.state = state;
        this.id = id;
        this.bridgeId = bridgeId;
        this.capabilities = capabilities;
        this.supportedStates = supportedStates;
        this.api = api;
        this.lastUpdate = Date.now();
        this.behaviourAggregator = new BehaviourAggregator(async (value:StateUpdate)=>{ await this.setState(value)},state);
    }

    init():void{
        this.behaviourAggregator.init();
        this.intervalId = setInterval(() => this.renewState(), LIGHT_POLLING_RATE);
    }

    private _setLastUpdate(): void {
        this.lastUpdate = Date.now();
    }

    cleanup(){
        clearInterval(this.intervalId);
        this.behaviourAggregator.cleanup();
    }

    /**
     * Obtains the state from the light on the bridge and updates the state object if different.
     */
    async renewState(): Promise<void> {
        const newState = await this.api.lights.getLightState(this.id) as HueFullState;
        if (!lightUtil.stateEqual(this.state,newState)) {
            this.state = newState;
            this._setLastUpdate();
            await this.behaviourAggregator.lightStateChanged({...this.state});
        }
    }

    getState(): HueFullState {
        return {...this.state};
    }


    private _updateState(state: StateUpdate): void {
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
        const result = await this.api.lights.setLightState(this.id.toString(), state);
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