"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.failure = exports.success = exports.Failure = exports.Success = exports.CrownstoneHueModule = void 0;
const fetch = require('node-fetch');
const fs = require('fs');
const v3 = require('node-hue-api').v3, discovery = v3.discovery, hueApi = v3.api;
//TODO Omvormen naar module.
class CrownstoneHueModule {
    constructor() {
    }
}
exports.CrownstoneHueModule = CrownstoneHueModule;
//User signing
const APP_NAME = 'node-hue-api';
const DEVICE_NAME = 'testSuite';
//Return messages/Error codes
const NO_BRIDGES_IN_CONFIG = "NO_BRIDGES_IN_CONFIG";
const NO_BRIDGES_DISCOVERED = "NO_BRIDGES_DISCOVERED";
const UNAUTHORIZED_USER = "UNAUTHORIZED_USER";
const BRIDGE_LINK_BUTTON_UNPRESSED = "BRIDGE_LINK_BUTTON_UNPRESSED";
const BRIDGE_CONNECTION_REFUSED = "BRIDGE_CONNECTION_REFUSED";
const DISCOVERY_URL = "https://discovery.meethue.com/";
//config locations/names
const CONF_NAME = "saveConfig.json";
const CONF_BRIDGE_LOCATION = "bridges";
var configSettings = {};
class Success {
    constructor(value) {
        this.value = value;
    }
    isSuccess() {
        return true;
    }
    isFailure() {
        return false;
    }
}
exports.Success = Success;
class Failure {
    constructor(value) {
        this.value = value;
    }
    isSuccess() {
        return false;
    }
    isFailure() {
        return true;
    }
}
exports.Failure = Failure;
exports.success = (l) => {
    return new Success(l);
};
exports.failure = (a) => {
    return new Failure(a);
};
function getConfigSettings() {
    return __awaiter(this, void 0, void 0, function* () {
        const content = yield fs.readFileSync(CONF_NAME);
        configSettings = JSON.parse(content);
    });
}
;
// Returns either a list of bridges or a errorcode
function discoverBridges() {
    return __awaiter(this, void 0, void 0, function* () {
        const discoveryResults = yield discovery.nupnpSearch();
        if (discoveryResults.length === 0) {
            return NO_BRIDGES_DISCOVERED;
        }
        else {
            return discoveryResults;
        }
    });
}
function linkBridgeByIp(ipaddress) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield createUser(ipaddress);
        if (result.isFailure()) {
            const api = yield __createAuthenticatedApi(ipaddress, result.value.username);
            //TODO Check if this succeeded.
            yield saveNewDiscovery(api, result.value);
            yield updateConfigFile();
            return exports.success(api);
        }
        else {
            return result;
        }
    });
}
//Currently only 1 bridge supported, returns an api if connection succesfull, else returns an error code.
function initModule() {
    return __awaiter(this, void 0, void 0, function* () {
        yield getConfigSettings();
        const result = yield __getConnectedBridges();
        if (result.isSuccess()) {
            return yield __connectToBridge(result.value);
        }
        else {
            return result;
        }
    });
}
//Currently only 1 bridge supported.
function __getConnectedBridges() {
    return __awaiter(this, void 0, void 0, function* () {
        const firstBridge = Object.keys(configSettings["bridges"])[0];
        if (firstBridge === undefined || firstBridge === null || firstBridge === "") {
            return exports.failure(NO_BRIDGES_IN_CONFIG);
        }
        else {
            return exports.success(firstBridge);
        }
    });
}
function __connectToBridge(bridgeIpAddress) {
    return __awaiter(this, void 0, void 0, function* () {
        let result = yield __createAuthenticatedApi(bridgeIpAddress, configSettings[CONF_BRIDGE_LOCATION][bridgeIpAddress]["username"]);
        if (result.isSuccess()) {
            return result;
        }
        else if (result.isFailure()) {
            if (result.value == "ENOTFOUND" || result.value == "ETIMEDOUT") {
                return yield findUnreachableBridge(bridgeIpAddress);
            }
            else {
                return result;
            }
        }
        else {
            return exports.failure("UNEXPECTED ERROR");
        }
    });
}
function __createAuthenticatedApi(ipaddress, username) {
    return __awaiter(this, void 0, void 0, function* () {
        const api = yield hueApi.createLocal(ipaddress).connect(username).then(result => { return exports.success(result); }).catch((err) => {
            return exports.failure(err.code);
        });
        return api;
    });
}
function __createUnAuthenticatedApi(ipaddress) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield hueApi.createLocal(ipaddress).connect().then(result => { return exports.success(result); }).catch((err) => {
            return exports.failure(err.code);
        });
    });
}
function createUser(bridgeIpAdress) {
    return __awaiter(this, void 0, void 0, function* () {
        // Create an unauthenticated instance of the Hue API so that we can create a new user
        const result = yield __createUnAuthenticatedApi(bridgeIpAdress);
        if (result.isSuccess()) {
            try {
                let createdUser = yield result.value.users.createUser(APP_NAME, DEVICE_NAME);
                return exports.success(createdUser);
            }
            catch (err) {
                if (err.getHueErrorType() === 101) {
                    return exports.failure(BRIDGE_LINK_BUTTON_UNPRESSED);
                }
                else {
                    exports.failure(err.code);
                }
            }
        }
        else {
            return result;
        }
    });
}
//Call this to save configuration to the config file.
function updateConfigFile() {
    return __awaiter(this, void 0, void 0, function* () {
        yield fs.writeFile(CONF_NAME, JSON.stringify(configSettings), function (err) {
            if (err) {
                return exports.failure(err.code);
            }
            return exports.success(true);
        });
    });
}
function saveNewDiscovery(api, user) {
    return __awaiter(this, void 0, void 0, function* () {
        const bridgeConfig = yield api.configuration.getConfiguration();
        if (!(bridgeConfig.ipaddress in configSettings[CONF_BRIDGE_LOCATION])) {
            configSettings[CONF_BRIDGE_LOCATION][bridgeConfig.ipaddress] = { "username": user.username, "clientkey": user.clientkey, "mac-address": bridgeConfig.mac, "name": bridgeConfig.name, "bridgeid": bridgeConfig.bridgeid };
        }
    });
}
//Returns a list of all lights.
function getAllLights(api) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield api.lights.getAll().then(res => { return exports.success(res); }).catch(err => { return exports.failure(err.code); });
    });
}
//Returns  success or failure(message)
function manipulateLight(api, id, state) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield api.lights.setLightState(id, state).then(res => { return exports.success(res); }).catch(err => { return exports.failure(err.message); });
    });
}
function __getBridgesFromDiscoveryUrl() {
    return __awaiter(this, void 0, void 0, function* () {
        return yield fetch(DISCOVERY_URL, { method: "Get" })
            .then((res) => __awaiter(this, void 0, void 0, function* () {
            return yield res.json().then(res => { return exports.success(res); });
        })).catch((err) => { return exports.failure(err.code); });
    });
}
//Attempts to find- and connect to the bridge
function findUnreachableBridge(unreacheableBridgeIP) {
    return __awaiter(this, void 0, void 0, function* () {
        let unreachableBridge = configSettings[CONF_BRIDGE_LOCATION][unreacheableBridgeIP];
        let possibleBridges = yield __getBridgesFromDiscoveryUrl().catch(err => { return exports.failure(err.code); });
        if (possibleBridges.isSuccess()) {
            if (possibleBridges.value.length === 0) {
                return exports.failure(NO_BRIDGES_DISCOVERED);
            }
            else {
                let result = { id: "", internalipaddress: "" };
                yield possibleBridges.value.forEach(function (item, index) {
                    if (unreachableBridge["bridgeid"].toLowerCase() === item.id.toLowerCase()) {
                        result = item;
                        return;
                    }
                });
                if (typeof (result) === "object") {
                    let api = yield __createAuthenticatedApi(result.internalipaddress, unreachableBridge["username"]).catch(err => { return exports.failure(err.code); });
                    if (api.isSuccess()) {
                        configSettings[CONF_BRIDGE_LOCATION][result.internalipaddress] = unreachableBridge;
                        delete configSettings[CONF_BRIDGE_LOCATION][unreacheableBridgeIP];
                        updateConfigFile();
                        return api;
                    }
                    else {
                        return api;
                    }
                }
            }
        }
        else {
            return possibleBridges;
        }
    });
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
function dev() {
    return __awaiter(this, void 0, void 0, function* () {
        yield getConfigSettings();
        var result = yield initModule();
        if (result.isFailure()) {
            if (result.value === NO_BRIDGES_IN_CONFIG) {
                printErrorCode(result.value);
                console.log("Init. bridge discovery");
                const bridges = yield discoverBridges();
                result = yield linkBridgeByIp(bridges[0]);
                if (result.isFailure()) {
                    printErrorCode(result.value);
                    return;
                }
            }
            else {
                printErrorCode(result.value);
                return;
            }
        }
        console.log("Bridge connected.");
        const authenticatedApi = result.value;
        //const authenticatedApi = await hueApi.createLocal(firstBridge).connect(configSettings["bridges"][firstBridge]["username"]);
        let res = yield manipulateLight(authenticatedApi, 2, { on: true, ct: 500 });
        yield getAllLights(authenticatedApi).then(allLights => {
            console.log(JSON.stringify(allLights.value, null, 2));
            rl.question("Man. light?", function (answer) {
                return __awaiter(this, void 0, void 0, function* () {
                    if (answer != "") {
                        allLights.value.forEach((light) => __awaiter(this, void 0, void 0, function* () {
                            console.log(light.id);
                            manipulateLight(authenticatedApi, light.id, { on: true, ct: answer });
                        }));
                    }
                    else {
                        allLights.value.forEach((light) => __awaiter(this, void 0, void 0, function* () {
                            console.log(light.id);
                            console.log(yield manipulateLight(authenticatedApi, light.id, { on: false }).then(res => { res.value; }).catch(res => { res.value; }));
                        }));
                    }
                    //rl.close();
                });
            });
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
//# sourceMappingURL=app.js.map