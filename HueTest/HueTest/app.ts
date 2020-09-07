import { config } from "process";

const fetch = require('node-fetch');
const fs = require('fs');
const v3 = require('node-hue-api').v3
    , discovery = v3.discovery
    , hueApi = v3.api
    ;

//TODO Omvormen naar module.


export class CrownstoneHueModule {
    constructor() {

    }
}


//User signing
let APP_NAME: string = 'node-hue-api';
let DEVICE_NAME: string = 'testSuite';

//Return messages/Error codes
const NO_BRIDGES_IN_CONFIG = "NO_BRIDGES_IN_CONFIG";
const NO_BRIDGES_DISCOVERED = "NO_BRIDGES_DISCOVERED";
const UNAUTHORIZED_USER = "UNAUTHORIZED_USER";
const BRIDGE_LINK_BUTTON_UNPRESSED = "BRIDGE_LINK_BUTTON_UNPRESSED";
const BRIDGE_CONNECTION_REFUSED = "BRIDGE_CONNECTION_REFUSED";

const DISCOVERY_URL = "https://discovery.meethue.com/";


//config locations/names
const CONF_NAME: string = "saveConfig.json";
const CONF_BRIDGE_LOCATION: string = "bridges";

var configSettings: object = {};




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



async function getConfigSettings(): Promise<void> {
    const content = await fs.readFileSync(CONF_NAME)
    configSettings = JSON.parse(content);
};


// Returns either a list of bridges or a errorcode
async function discoverBridges() {
    const discoveryResults = await discovery.nupnpSearch();
    if (discoveryResults.length === 0) {
        return NO_BRIDGES_DISCOVERED;
    } else {
        return discoveryResults;
    }
}



async function linkBridgeByIp(ipaddress) {
    const result = await createUser(ipaddress)
    if (result.isFailure()) {
        const api = await __createAuthenticatedApi(ipaddress, result.value.username);

        //TODO Check if this succeeded.
        await saveNewDiscovery(api, result.value);
        await updateConfigFile();
        return success(api);
    } else {
        return result;
    }
}

//Currently only 1 bridge supported, returns an api if connection succesfull, else returns an error code.
async function initModule() {
    await getConfigSettings();
    const result = await __getConnectedBridges();

    if (result.isSuccess()) {
        return await __connectToBridge(result.value);
    } else {
        return result;
    }
}


//Currently only 1 bridge supported.
async function __getConnectedBridges() {
    const firstBridge: string = Object.keys(configSettings["bridges"])[0];
    if (firstBridge === undefined || firstBridge === null || firstBridge === "") {
        return failure(NO_BRIDGES_IN_CONFIG);
    } else {
        return success(firstBridge);
    }
}


async function __connectToBridge(bridgeIpAddress) {
    let result = await __createAuthenticatedApi(bridgeIpAddress, configSettings[CONF_BRIDGE_LOCATION][bridgeIpAddress]["username"]);
    if (result.isSuccess()) {
        return result;
    } else if (result.isFailure()) {
        if (result.value == "ENOTFOUND" || result.value == "ETIMEDOUT") {
            return await findUnreachableBridge(bridgeIpAddress);
        } else {
            return result;
        }
    } else {
        return failure("UNEXPECTED ERROR");
    }
} 

async function __createAuthenticatedApi(ipaddress: string, username: string) {
    const api = await hueApi.createLocal(ipaddress).connect(username).then(result => { return success(result) }).catch((err) => {
        return failure(err.code);
    });
    return api;
}

async function __createUnAuthenticatedApi(ipaddress: string) {
    return await hueApi.createLocal(ipaddress).connect().then(result => { return success(result) }).catch((err) => {
        return failure(err.code);
    }); 
}

async function createUser(bridgeIpAdress) {
    // Create an unauthenticated instance of the Hue API so that we can create a new user
    const result = await __createUnAuthenticatedApi(bridgeIpAdress);
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
async function updateConfigFile() {
    await fs.writeFile(CONF_NAME, JSON.stringify(configSettings), function (err) {
        if (err) {
            return failure(err.code);
        }
        return success(true);
    });

}


async function saveNewDiscovery(api, user) {
    const bridgeConfig = await api.configuration.getConfiguration();
    if (!(bridgeConfig.ipaddress in configSettings[CONF_BRIDGE_LOCATION])) {
        configSettings[CONF_BRIDGE_LOCATION][bridgeConfig.ipaddress] = { "username": user.username, "clientkey": user.clientkey, "mac-address": bridgeConfig.mac, "name": bridgeConfig.name, "bridgeid": bridgeConfig.bridgeid }
    }

}
 
//Returns a list of all lights.
async function getAllLights(api) {
    return await api.lights.getAll().then(res => { return success(res) }).catch(err => {return failure(err.code)});
}


//Returns  success or failure(message)
async function manipulateLight(api, id, state) {
    return await api.lights.setLightState(id, state).then(res => { return success(res) }).catch(err => { return failure(err.message) });
}


async function __getBridgesFromDiscoveryUrl() {
    return await fetch(DISCOVERY_URL, { method: "Get" })
        .then(async res => {
            return await res.json().then(res => { return success(res) });
        }).catch((err) => { return failure(err.code) });
}


//Attempts to find- and connect to the bridge
async function findUnreachableBridge(unreacheableBridgeIP) {
    let unreachableBridge = configSettings[CONF_BRIDGE_LOCATION][unreacheableBridgeIP];
    let possibleBridges = await __getBridgesFromDiscoveryUrl().catch(err => { return failure(err.code)});
    if (possibleBridges.isSuccess()) {
        if (possibleBridges.value.length === 0) {
            return failure(NO_BRIDGES_DISCOVERED);
        } else {
            let result = { id: "", internalipaddress: "" };
            await possibleBridges.value.forEach(function (item, index) {
                if (unreachableBridge["bridgeid"].toLowerCase() === item.id.toLowerCase()) {
                    result = item;
                    return;
                }
            });

            if (typeof (result) === "object") {
                let api = await __createAuthenticatedApi(result.internalipaddress, unreachableBridge["username"]).catch(err => { return failure(err.code)});
                if (api.isSuccess()) {
                    configSettings[CONF_BRIDGE_LOCATION][result.internalipaddress] = unreachableBridge;
                    delete configSettings[CONF_BRIDGE_LOCATION][unreacheableBridgeIP];
                    updateConfigFile();
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

function printErrorCode(errorCode) {
    switch (errorCode) {
        case (NO_BRIDGES_DISCOVERED): {
            console.log("No bridges found in the network.");
            break;
        }
        case (NO_BRIDGES_IN_CONFIG): {
            console.log("No bridges in config file found.");
            break;
        }
        case (UNAUTHORIZED_USER): {
            console.log("User not authorized/wrong username.");
            break;
        }
        case (BRIDGE_LINK_BUTTON_UNPRESSED): {
            console.log("The Link button on the bridge was not pressed. Please press the Link button and try again.");
            break;
        }
        default:
            console.log(errorCode);
            break;


    }
}


async function dev() {
    await getConfigSettings();

    var result = await initModule();
    if (result.isFailure()) {
        if (result.value === NO_BRIDGES_IN_CONFIG) {
            printErrorCode(result.value);
            console.log("Init. bridge discovery");
            const bridges = await discoverBridges()
            result = await linkBridgeByIp(bridges[0]);
            if (result.isFailure()) {
                printErrorCode(result.value);
                return;
            }
        } else {
            printErrorCode(result.value);
            return;
        }
    } 
    console.log("Bridge connected.");
    const authenticatedApi = result.value;

    //const authenticatedApi = await hueApi.createLocal(firstBridge).connect(configSettings["bridges"][firstBridge]["username"]);
    let res = await manipulateLight(authenticatedApi, 2, { on: true, ct: 500 });

    await getAllLights(authenticatedApi).then(allLights => {
        console.log(JSON.stringify(allLights.value, null, 2));

         rl.question("Man. light?", async function (answer) {
            if (answer != "") {
                allLights.value.forEach(async light => {
                    console.log(light.id);
                    manipulateLight(authenticatedApi, light.id, { on: true, ct: answer });
                });
            } 
            else {
                allLights.value.forEach(async light => {
                    console.log(light.id);
                    console.log(await manipulateLight(authenticatedApi, light.id, { on: false }).then(res => { res.value }).catch(res => {res.value}));
                });
             }  
             //rl.close();
        });
    });
}


dev();







//async function __isDiscoveredBridgeAlreadyInConfig(bridge) {
//    if (bridge.ipaddress in configSettings[CONF_BRIDGE_LOCATION]) {
//        return true;
//    } else {
//        return false;
//    }
//}

//async function commandLine(state) {
//    var stateBuild = state;
//    rl.question("State? or execute", async function (answer) {

//        if (answer === "execute") {
//            return stateBuild
//        } else {
//            stateBuild[answer] = "";
//            await rl.question("var?", async function (variable) {
//                stateBuild[answer] = variable;
//                rl.close();
//            });
//        }
//        rl.close();
//        commandLine(stateBuild)

//    });

//    return stateBuild;
//}

//Filters already excisting light-states for 'Hue optimization'(? to be tested if optimisation is worth it in contrast to extra time used filtering).
// niet nodig!
//async function buildState(light, newState) {
//    let buildState = {};

//    Object.keys(newState).forEach(function (key) {
//        if (light.state[key] != newState[key]) {
//            buildState[key] = newState[key];
//        }
//    }); 
//    console.log(buildState);
//    return buildState;

//}

////Returns an api or an errorCode  ?still Needed?????
//async function initBridgeLinking() {
//    const discoveredBridge = await discoverBridge();

//    if (discoveredBridge != NO_BRIDGES_DISCOVERED) {
//        if (await __isDiscoveredBridgeAlreadyInConfig(discoveredBridge)) {
//            return await __createAuthenticatedApi(discoveredBridge.ipaddress, configSettings[CONF_BRIDGE_LOCATION][discoveredBridge.ipaddress]["username"]);
//        } else {
//            return await attemptToLinkBridgeByIp(discoveredBridge.ipaddress);
//        }
//    } else {
//        return NO_BRIDGES_DISCOVERED;
//    }
//}

//Returns api or an errorcode  