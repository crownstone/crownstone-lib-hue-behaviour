
import {promises as fs} from 'fs';
import {v3} from "node-hue-api";
import {nupnp as unalteredNupnp}  from "node-hue-api/lib/api/discovery/nupnp";
import Light = require("./node_modules/node-hue-api/lib/model/Light");
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



export class CrownstoneHueModule {
    configSettings: object = {"bridges": "", "lights": ""};
    api: any;


    constructor() {

    }

    async init() {
        await this.getConfigSettings();
    }

    async getConfigSettings() {
        await fs.readFile(CONF_NAME, 'utf8').then((data) => {
            this.configSettings = JSON.parse(data);
        }).catch(err => {
            if (err.code === "ENOENT") {
                this.updateConfigFile();
            }
        });

    };


    // Returns either a list of bridges or a errorcode
    async discoverBridges(): Promise<string | Array<object>> {
        const discoveryResults = await discovery.nupnpSearch().then(res => {
            return res
        });
        if (discoveryResults.length === 0) {
            return NO_BRIDGES_DISCOVERED;
        } else {
            return discoveryResults;
        }
    }


    async linkBridgeByIp(ipaddress:string): Promise<Either<boolean,string>> {
        const result = await this.createUser(ipaddress)
        if (result.isSuccess()) {
            const api = await this.__createAuthenticatedApi(ipaddress, result.value.username);

            //TODO Check if this succeeded.
            await this.saveNewDiscovery(api, result.value);
            await this.updateConfigFile();
            this.api = api;
            return success(true);
        } else {
            return result;
        }
    }

    async switchToBridge(ipAddress:string):Promise<Either<boolean,string>> {
        let api = await this.__connectToBridge(ipAddress).then(res => {
            return res
        });
        if (api.isSuccess()) {
            this.api = api.value;
            return success(true);
        } else
            return api;
    }

    //Returns a string[] of bridges or an string.
    async getConfiguredBridges(): Promise<string[] | string> {
        const bridges: string[] = Object.keys(this.configSettings["bridges"]);
        if (bridges === undefined || bridges === null || bridges.length === 0) {
            return NO_BRIDGES_IN_CONFIG;
        } else {
            return bridges;
        }
    }


    async __connectToBridge(bridgeIpAddress: string) : Promise<Either<Api,string>> {
        let result = await this.__createAuthenticatedApi(bridgeIpAddress, this.configSettings[CONF_BRIDGE_LOCATION][bridgeIpAddress]["username"]).then(res => {
            return res;
        });
        if (result.isSuccess()) {
            return result;
        } else if (result.isFailure()) {
            if (result.value == "ENOTFOUND" || result.value == "ETIMEDOUT") {
                return await this.findUnreachableBridge(bridgeIpAddress).then(res => {
                    return res;
                });
            } else {
                return result;
            }
        } else {
            return failure("UNEXPECTED ERROR");
        }
    }

    async __createAuthenticatedApi(ipaddress: string, username: string): Promise<Either<Api,string>> {
        try {
            const result = await hueApi.createLocal(ipaddress).connect(username);
            return success(result);
        } catch (err) {
            return failure(err.code);
        }
    }

    async __createUnAuthenticatedApi(ipaddress: string): Promise<any> {
        return await hueApi.createLocal(ipaddress).connect().then(result => {
            return success(result);
        }).catch((err) => {
            return failure(err.code);
        });
    }

    //User should press link button before this is called.
    async createUser(bridgeIpAddress:string): Promise<any> {
        const result = await this.__createUnAuthenticatedApi(bridgeIpAddress);
        if (result.isSuccess()) {
            try {
                let createdUser = await result.value.users.createUser(APP_NAME, DEVICE_NAME);
                return success(createdUser);

            } catch (err) {
                if (err.getHueErrorType() === 101) {
                    return failure(BRIDGE_LINK_BUTTON_UNPRESSED);
                } else {
                    failure(err.code);
                }
            }
        } else {
            return result;
        }
    }

    //Call this to save configuration to the config file.
    async updateConfigFile(): Promise<any> {
        return await fs.writeFile(CONF_NAME, JSON.stringify(this.configSettings)).then((res) => {
            return success(true)
        }).catch((err) => {
            return failure(err.code)
        });
    }


    async saveNewDiscovery(api: any, user: any): Promise<void> {
        const bridgeConfig = await api.configuration.getConfiguration();
        if (!(bridgeConfig.ipaddress in this.configSettings[CONF_BRIDGE_LOCATION])) {
            this.configSettings[CONF_BRIDGE_LOCATION][bridgeConfig.ipaddress] = {
                "username": user.username,
                "clientkey": user.clientkey,
                "mac-address": bridgeConfig.mac,
                "name": bridgeConfig.name,
                "bridgeid": bridgeConfig.bridgeid
            }
        }

    }

    //Uses the nupnp export from the library before it gets altered.
    async __getBridgesFromDiscoveryUrl(): Promise<Either<object[],string>> {
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

    getConnectedBridge() {
        return this.api;
    }


    //Attempts to find- and connect to the bridge
    async findUnreachableBridge(ipAddress : string): Promise<Either<any,string>> {
        let unreachableBridge = this.configSettings[CONF_BRIDGE_LOCATION][ipAddress];
        let possibleBridges = await this.__getBridgesFromDiscoveryUrl().catch(err => {
            return failure(err.code)
        });
        if (possibleBridges.isSuccess()) {
            if (possibleBridges.value.length === 0) {
                return failure(NO_BRIDGES_DISCOVERED);
            } else {
                let result = {id: "", internalipaddress: ""};
                await possibleBridges.value.forEach(function (item) {
                    if (unreachableBridge["bridgeid"].toLowerCase() === item.id.toLowerCase()) {
                        result = item;
                        return;
                    }
                });

                if (typeof (result) === "object") {
                    let api = await this.__createAuthenticatedApi(result.internalipaddress, unreachableBridge["username"]).catch(err => {
                        return failure(err.code)
                    });
                    if (api.isSuccess()) {
                        this.__replaceBridgeInformation(result.internalipaddress, unreachableBridge, ipAddress);
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


    __replaceBridgeInformation(newIpAddress: string, unreachableBridge: object, oldIpAddress: string): void {
        this.configSettings[CONF_BRIDGE_LOCATION][newIpAddress] = unreachableBridge;
        delete this.configSettings[CONF_BRIDGE_LOCATION][oldIpAddress];
        this.updateConfigFile();
    }


    //Returns a list of all lights.
    async getAllLights(): Promise<Either<Light[],string>> {
        return await this.api.lights.getAll().then(res => {
            return success(res)
        }).catch(err => {
            return failure(err.code)
        });
    }


    //Returns   or failure(message)
    async manipulateLightByBridgeId(id: number, state: object): Promise<void> {
        return await this.api.lights.setLightState(id, state);
    }

}


async function testing() {

    const test = new CrownstoneHueModule();
    console.log(await test.__getBridgesFromDiscoveryUrl());
    await test.init();
    const firstBridge = await test.getConfiguredBridges().then(res => {
        return res[0];
    });
    await test.switchToBridge(firstBridge);
    let lights = await test.getAllLights().then(res => {
        return res
    });
    console.log(lights);
    if (lights.isSuccess()) {
        lights.value.forEach(light => {
            console.log(light);
            test.manipulateLightByBridgeId(light.id, {on: false})
        })
    }
}

testing();
