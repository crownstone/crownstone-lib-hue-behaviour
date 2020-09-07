//import * as apiModel from "node-hue-api/lib/api/Api";

const fetch = require("node-fetch");
const fs = require('fs');
const v3 = require('node-hue-api').v3
    , discovery = v3.discovery
    , hueApi = v3.api
;


//User signing
const APP_NAME: string = 'node-hue-api';
const DEVICE_NAME: string = 'testSuite';

//Return messages/Error codes
const NO_BRIDGES_IN_CONFIG = "NO_BRIDGES_IN_CONFIG";
const NO_BRIDGES_DISCOVERED = "NO_BRIDGES_DISCOVERED";
const UNAUTHORIZED_USER = "UNAUTHORIZED_USER";
const BRIDGE_LINK_BUTTON_UNPRESSED = "BRIDGE_LINK_BUTTON_UNPRESSED";
const BRIDGE_CONNECTION_FAILED = "BRIDGE_CONNECTION_FAILED";

const DISCOVERY_URL = "https://discovery.meethue.com/";


//config locations/names
const CONF_NAME: string = "saveConfig.json";
const CONF_BRIDGE_LOCATION: string = "bridges";


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


//TODO Omvormen naar module.


export class CrownstoneHueModule {
    configSettings: object = {};
    api: any;


    constructor() {
        this.getConfigSettings();
    }


    async getConfigSettings(): Promise<void> {
        const content = await fs.readFileSync(CONF_NAME)
        this.configSettings = JSON.parse(content);
    };


    // Returns either a list of bridges or a errorcode
    async discoverBridges(): Promise<string | Array<object>> {
        const discoveryResults = await discovery.nupnpSearch();
        if (discoveryResults.length === 0) {
            return NO_BRIDGES_DISCOVERED;
        } else {
            return discoveryResults;
        }
    }


    async linkBridgeByIp(ipaddress) {
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


    ////Currently only 1 bridge supported, returns an api if connection succesfull, else returns an error code.
    //async initModule() {
    //    const result = await this.__getConnectedBridges();

    //    //if (result.isSuccess()) {
    //    //    let api = await this.__connectToBridge(result.value);
    //    //    if (api.isSuccess()) {
    //    //        this.api = api;
    //    //    } else
    //    //        return api;
    //    //} else {
    //    //    return result;
    //    //}
    //    return result;
    //}


    async switchToBridge(ipAddress) {
        let api = await this.__connectToBridge(ipAddress);
        if (api.isSuccess()) {
            this.api = api;
            return success(true);
        } else
            return api;
    }

    //Returns a string[] of bridges or an string.
    async getConfiguredBridges(): Promise<string | Array<string>> {
        const bridges: string[] = Object.keys(this.configSettings["bridges"]);
        if (bridges === undefined || bridges === null || bridges.length === 0) {
            return NO_BRIDGES_IN_CONFIG;
        } else {
            return bridges;
        }
    }


    async __connectToBridge(bridgeIpAddress) {
        let result = await this.__createAuthenticatedApi(bridgeIpAddress, this.configSettings[CONF_BRIDGE_LOCATION][bridgeIpAddress]["username"]);
        if (result.isSuccess()) {
            return result;
        } else if (result.isFailure()) {
            if (result.value == "ENOTFOUND" || result.value == "ETIMEDOUT") {
                return await this.findUnreachableBridge(bridgeIpAddress);
            } else {
                return result;
            }
        } else {
            return failure("UNEXPECTED ERROR");
        }
    }

    async __createAuthenticatedApi(ipaddress: string, username: string) {
        const api = await hueApi.createLocal(ipaddress).connect(username).then(result => {
            return success(result)
        }).catch((err) => {
            return failure(err.code);
        });
        return api;
    }

    async __createUnAuthenticatedApi(ipaddress: string) {
        return await hueApi.createLocal(ipaddress).connect().then(result => {
            return success(result)
        }).catch((err) => {
            return failure(err.code);
        });
    }

    async createUser(bridgeIpAdress) {
        // Create an unauthenticated instance of the Hue API so that we can create a new user
        const result = await this.__createUnAuthenticatedApi(bridgeIpAdress);
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
    async updateConfigFile() {
        await fs.writeFile(CONF_NAME, JSON.stringify(this.configSettings), function (err) {
            if (err) {
                return failure(err.code);
            }
            return success(true);
        });

    }


    async saveNewDiscovery(api, user) {
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

    //Returns a list of all lights.
    async getAllLights(): Promise<object> {
        return await this.api.lights.getAll().then(res => {
            return success(res)
        }).catch(err => {
            return failure(err.code)
        });
    }


    //Returns   or failure(message)
    async manipulateLight(id, state) {
        return await this.api.lights.setLightState(id, state);
    }


    async __getBridgesFromDiscoveryUrl() {
        return await fetch(DISCOVERY_URL, {method: "Get"})
            .then(async res => {
                return await res.json().then(res => {
                    return success(res)
                });
            }).catch((err) => {
                return failure(err.code)
            });
    }


    //Attempts to find- and connect to the bridge
    async findUnreachableBridge(unreacheableBridgeIP) {
        let unreachableBridge = this.configSettings[CONF_BRIDGE_LOCATION][unreacheableBridgeIP];
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
                        this.configSettings[CONF_BRIDGE_LOCATION][result.internalipaddress] = unreachableBridge;
                        delete this.configSettings[CONF_BRIDGE_LOCATION][unreacheableBridgeIP];
                        this.updateConfigFile();
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


}


function MacAddressToSerial(macaddress) {
    return macaddress.replace(':', '');
}


//testing purposes \/


const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
//

//function printErrorCode(errorCode) {
//    switch (errorCode) {
//        case (NO_BRIDGES_DISCOVERED): {
//            console.log("No bridges found in the network.");
//            break;
//        }
//        case (NO_BRIDGES_IN_CONFIG): {
//            console.log("No bridges in config file found.");
//            break;
//        }
//        case (UNAUTHORIZED_USER): {
//            console.log("User not authorized/wrong username.");
//            break;
//        }
//        case (BRIDGE_LINK_BUTTON_UNPRESSED): {
//            console.log("The Link button on the bridge was not pressed. Please press the Link button and try again.");
//            break;
//        }
//        default:
//            console.log(errorCode);
//            break;


//    }
//}


async function dev() {
    let hueModule = new CrownstoneHueModule();

    const bridges = hueModule.getConfiguredBridges();
    console.log(bridges);
    //let result = hueModule.initModule();
    //if (result.isFailure()) {
    //    if (result.value === NO_BRIDGES_IN_CONFIG) {
    //        printErrorCode(result.value);
    //        console.log("Init. bridge discovery");
    //        const bridges = await hueModule.discoverBridges()
    //        result = await hueModule.linkBridgeByIp(bridges[0]);
    //        if (result.isFailure()) {
    //            printErrorCode(result.value);
    //            return;
    //        }
    //    } else {
    //        printErrorCode(result.value);
    //        return;
    //    }
    //}
    //console.log("Bridge connected.");

    ////const authenticatedApi = await hueApi.createLocal(firstBridge).connect(configSettings["bridges"][firstBridge]["username"]);
    //let res = await hueModule.manipulateLight( 2, { on: true, ct: 500 });

    //await hueModule.getAllLights().then(allLights => {
    //    console.log(JSON.stringify(allLights.value, null, 2));

    //    rl.question("Man. light?", async function (answer) {
    //        if (answer != "") {
    //            allLights.value.forEach(async light => {
    //                console.log(light.id);
    //                hueModule.manipulateLight( light.id, { on: true, ct: answer });
    //            });
    //        }
    //        else {
    //            allLights.value.forEach(async light => {
    //                console.log(light.id);
    //                console.log(await hueModule.manipulateLight( light.id, { on: false }).then(res => { res.value }).catch(res => { res.value }));
    //            });
    //        }
    //        //rl.close();
    //    });
    //});
}


dev();
