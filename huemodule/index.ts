import {promises as fs} from 'fs';
import {v3} from "node-hue-api";
import {nupnp as unalteredNupnp} from "node-hue-api/lib/api/discovery/nupnp";
import lightModel = require("./node_modules/node-hue-api/lib/model/Light");
import Api = require("./node_modules/node-hue-api/lib/api/Api");

const discovery = v3.discovery;
const hueApi = v3.api;
const model = v3.model;


//User signing
const APP_NAME: string = 'node-hue-api';
const DEVICE_NAME: string = 'testSuite';

//Return messages/Error codes
const NO_BRIDGES_IN_CONFIG = "NO_BRIDGES_IN_CONFIG";
const NO_BRIDGES_DISCOVERED = "NO_BRIDGES_DISCOVERED";
const UNAUTHORIZED_USER = "UNAUTHORIZED_USER";
const BRIDGE_LINK_BUTTON_UNPRESSED = "BRIDGE_LINK_BUTTON_UNPRESSED";
const BRIDGE_CONNECTION_FAILED = "BRIDGE_CONNECTION_FAILED";


//TODO
class Light {
    name: string;
    uniqueId:string;
    reachable: boolean = false;
    state: object;
    id: string;

    constructor(name:string, uniqueId: string, state: object, id: string, reachable?:boolean){
        this.name = name;
        this.uniqueId = uniqueId;
        this.state = state;
        this.id = id;
        this.reachable = reachable;
    }



    update(newValues: object) {
        Object.keys(newValues).forEach(key => {
            if (typeof (this[key]) !== undefined) {
                this[key] = newValues[key];
            }

        });
    }


}

class Bridge {
    lights: Light[];
    api: any;
    name: string;
    username: string;
    clientKey: string;
    macAddress: string;
    ipAddress: string;
    bridgeId: string
    reachable: boolean = false;

    framework: Framework;

    constructor(name: string, username: string, clientKey: string, macAddress: string, ipAddress: string, bridgeId: string, framework:Framework) {
        this.name = name;
        this.username = username;
        this.ipAddress = ipAddress;
        this.clientKey = clientKey;
        this.macAddress = macAddress;
        this.bridgeId = bridgeId;

        //temp fix??
        this.framework = framework;
    }

    async init() {
        if (this.username == "") {
            let result = await this.link();
            if (result.isFailure()) {
                return result;
            }
        } else {
            await this.connect();
        }
    }

    async link(): Promise<Either<boolean, string>> {
        const result = await this.createUser()
        if (result.isSuccess()) {
            await this.connect();
            const bridgeConfig = await this.api.configuration.getConfiguration();
            this.update({
                "bridgeId": bridgeConfig.bridgeId,
                "name": bridgeConfig.name,
                "macAddress": bridgeConfig.mac,
                "reachable": true
            })
            return success(true);
        } else {
            return result;
        }
    }

    async connect(): Promise<Either<boolean, string>> {
        let result = await this.createAuthenticatedApi().then(res => {
            return res;
        });
        if (result.isSuccess()) {
            return result;
        } else if (result.isFailure()) {
            if (result.value == "ENOTFOUND" || result.value == "ETIMEDOUT") {
                return await this._rediscoverMyself().then(res => {
                    return res;
                });
            } else {
                return result;
            }
        } else {
            return failure("UNEXPECTED ERROR");
        }
    }


    async getConnectedLights(): Promise<Light[]> {
        return this.lights;
    }

    async createAuthenticatedApi(): Promise<Either<boolean, string>> {
        try {
            const result = await hueApi.createLocal(this.ipAddress).connect(this.username);
            this.api = result;
            this.reachable = true;
            return success(true)
        } catch (err) {
            return failure(err.code);
        }
    }

    async createUnAuthenticatedApi(): Promise<Either<boolean, string>> {
        try {
            const result = await hueApi.createLocal(this.ipAddress);
            this.api = result;
            this.reachable = true;
            return success(true);
        } catch (err) {
            return failure(err.code);
        }
    }

    //User should press link button before this is called.
    async createUser(): Promise<Either<boolean, string>> {
        const result = await this.createUnAuthenticatedApi().then(res => {
            return res;
        });

        if (result.isSuccess()) {
            try {
                let createdUser = await this.api.value.users.createUser(APP_NAME, DEVICE_NAME);
                this.update({"username": createdUser.username, "clientKey": createdUser.clientkey})
                return success(true);
            } catch (err) {
                if (err.getHueErrorType() === 101) {
                    return failure(BRIDGE_LINK_BUTTON_UNPRESSED);
                } else {
                    return failure(err.code);
                }
            }
        } else {
            return result;
        }
    }


    //Attempts to find- and connect to the bridge
    async _rediscoverMyself(): Promise<Either<any, string>> {
        let possibleBridges = await this._getBridgesFromDiscoveryUrl().catch(err => {
            return failure(err.code)
        });
        if (possibleBridges.isSuccess()) {
            if (possibleBridges.value.length === 0) {
                return failure(NO_BRIDGES_DISCOVERED);
            } else {

                let result = {id: "", internalipaddress: ""};
                for(const item of possibleBridges.value){
                    if (this.bridgeId.toLowerCase() === item.id.toLowerCase()) {
                        result = item;
                        break;
                    }
                }

                if (typeof (result) === "object") {
                    const oldIpAddress = this.ipAddress;
                    this.ipAddress = result.internalipaddress;
                    let api = await this.createAuthenticatedApi().catch(err => {
                        return failure(err.code)
                    });
                    if (api.isSuccess()) {
                        await this.framework.saveBridgeInformation(this,oldIpAddress);
                        return api;
                    } else {
                        return api;
                    }
                }
            }
        } else {
            return possibleBridges;
        }
    }

    //Uses the nupnp export from the library before it gets altered. ?Move outside class??
    async _getBridgesFromDiscoveryUrl(): Promise<Either<object[], string>> {
        return await unalteredNupnp()
            .then(async res => {
                return success(res)
            }).catch((err) => {
                if (err.code != undefined) {
                    return failure(err.code)
                } else {
                    return failure(err)
                }
            });
    }

    update(newValues: object) {
        Object.keys(newValues).forEach(key => {
            if (typeof (this[key]) !== undefined) {
                this[key] = newValues[key];
            }
        });
        this.framework.saveBridgeInformation(this);
    }

    async getAllLightsOnBridge(): Promise<Either<lightModel[], string>> {
        return await this.api.lights.getAll().then(res => {
            return success(res)
        }).catch(err => {
            return failure(err.code)
        });
    }

    async setLightState(id: string, state: object) {
        return await this.api.lights.setLightState(id, state);
    }

    getInfo(): object{
        return {name : this.name, ipAddress: this.ipAddress, macAddress: this.macAddress,  username : this.username, clientKey: this.clientKey, bridgeId: this.bridgeId, reachable: this.reachable};
    }
}


//config locations/names
const CONF_NAME: string = "saveConfig.json";
const CONF_BRIDGE_LOCATION: string = "bridges";
const CONF_LIGHT_LOCATION: string = "lights";

export type Either<L, A> = Success<L, A> | Failure<L, A>;

export class Success<L, A> {
    readonly value: L;

    constructor(value: L) {
        this.value = value;
    }

    isSuccess(): this is Success<L, A> {
        return true;
    }

    isFailure(): this is Failure<L, A> {
        return false;
    }
}

export class Failure<L, A> {
    readonly value: A;

    constructor(value: A) {
        this.value = value;
    }

    isSuccess(): this is Success<L, A> {
        return false;
    }

    isFailure(): this is Failure<L, A> {
        return true;
    }
}

export const success = <L, A>(l: L): Either<L, A> => {
    return new Success(l);
};

export const failure = <L, A>(a: A): Either<L, A> => {
    return new Failure<L, A>(a);
};


export class Framework {
    configSettings: object = {"bridges": "", "lights": ""};
    connectedBridges: Bridge[] = new Array();


    constructor() {
    }

    async init() {
        await this.getConfigSettings();
        const result = await this.getConfiguredBridges();
        if(result.isSuccess()){
            let bridges = new Array();
            for (const ip of result.value) {
                bridges.push(await this.createBridgeFromConfig(ip));
            }
            return bridges;
        } else {
            return result;
        }
    }

    async getConfigSettings(): Promise<void> {
        await fs.readFile(CONF_NAME, 'utf8').then((data) => {
            this.configSettings = JSON.parse(data);
        }).catch(err => {
            if (err.code === "ENOENT") {
                this.updateConfigFile();
            }
        });

    };


    // Returns either a list of bridges or a errorcode TODO: map result to Bridge
    async discoverBridges(): Promise<string | Array<object>> {
        const discoveryResults = await discovery.nupnpSearch().then(res => {
            return res
        });
        if (discoveryResults.length === 0) {
            return NO_BRIDGES_DISCOVERED;
        } else {
            let bridges: Bridge[] = new Array();
            discoveryResults.forEach(item => {
                bridges.push(new Bridge(
                    item.name,
                    "",
                    "",
                    "",
                    item.ipaddress,
                    "",
                    this
                ))
            })
            return discoveryResults;
        }
    }


    //Returns a string[] of bridges or an string.
    async getConfiguredBridges(): Promise<Either<string[] , string>> {
        const bridges: string[] = Object.keys(this.configSettings["bridges"]);
        if (bridges === undefined || bridges === null || bridges.length === 0) {
            return failure(NO_BRIDGES_IN_CONFIG);
        } else {
            return success(bridges);
        }
    }

    //Temp???
    async saveBridgeInformation(bridge: Bridge, oldIpAddress?: string): Promise<void> {
        let config = bridge.getInfo();
        let ipAddress = config["ipAddress"];
        delete config["reachable"];
        delete config["ipAddress"];
        this.configSettings[CONF_BRIDGE_LOCATION][ipAddress] = config;
        if(oldIpAddress !== undefined){
        delete this.configSettings[CONF_BRIDGE_LOCATION][oldIpAddress];
        }
        await this.updateConfigFile();
    }

    //Call this to save configuration to the config file.
    async updateConfigFile(): Promise<any> {


        return await fs.writeFile(CONF_NAME, JSON.stringify(this.configSettings)).then((res) => {
            return success(true)
        }).catch((err) => {
            return failure(err.code)
        });
    }

    getConnectedBridges() {
        return this.connectedBridges;
    }

    createBridgeFromConfig(ipAddress) {
        let bridge = new Bridge(this.configSettings[CONF_BRIDGE_LOCATION][ipAddress].name, this.configSettings[CONF_BRIDGE_LOCATION][ipAddress].username, this.configSettings[CONF_BRIDGE_LOCATION][ipAddress].clientKey, this.configSettings[CONF_BRIDGE_LOCATION][ipAddress].macAddress, ipAddress, this.configSettings[CONF_BRIDGE_LOCATION][ipAddress].bridgeId,this);
        this.connectedBridges.push(bridge);
        return bridge;
    }

}


async function testing() {

    const test = new Framework();
    const bridges = await test.init();
    const discoveredBridges =   await test.discoverBridges();
    // console.log(await discoveredBridges[0].init())
    console.log(bridges);
    await bridges[0].init()
    bridges[0].update({"name": "Philips Hue"});
    console.log(await bridges[0].getInfo());
    console.log(bridges);

    const lights = await bridges[0].getAllLightsOnBridge();
    lights.value.forEach(light => {
        bridges[0].setLightState(light.id,{on:false});
    });

}

testing();
