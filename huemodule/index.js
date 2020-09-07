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
exports.CrownstoneHueModule = exports.failure = exports.success = exports.Failure = exports.Success = void 0;
const node_fetch_1 = require("node-fetch");
const fs_1 = require("fs");
const node_hue_api_1 = require("node-hue-api");
const discovery = node_hue_api_1.v3.discovery;
const hueApi = node_hue_api_1.v3.api;
//User signing
const APP_NAME = 'node-hue-api';
const DEVICE_NAME = 'testSuite';
//Return messages/Error codes
const NO_BRIDGES_IN_CONFIG = "NO_BRIDGES_IN_CONFIG";
const NO_BRIDGES_DISCOVERED = "NO_BRIDGES_DISCOVERED";
const UNAUTHORIZED_USER = "UNAUTHORIZED_USER";
const BRIDGE_LINK_BUTTON_UNPRESSED = "BRIDGE_LINK_BUTTON_UNPRESSED";
const BRIDGE_CONNECTION_FAILED = "BRIDGE_CONNECTION_FAILED";
const DISCOVERY_URL = "https://discovery.meethue.com/";
//config locations/names
const CONF_NAME = "saveConfig.json";
const CONF_BRIDGE_LOCATION = "bridges";
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
//TODO Omvormen naar module.
class CrownstoneHueModule {
    constructor() {
        this.configSettings = {};
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.getConfigSettings();
        });
    }
    getConfigSettings() {
        return __awaiter(this, void 0, void 0, function* () {
            yield fs_1.promises.readFile(CONF_NAME, 'utf8').then((data) => { this.configSettings = JSON.parse(data); });
        });
    }
    ;
    // Returns either a list of bridges or a errorcode
    discoverBridges() {
        return __awaiter(this, void 0, void 0, function* () {
            const discoveryResults = yield discovery.nupnpSearch().then(res => { return res; });
            if (discoveryResults.length === 0) {
                return NO_BRIDGES_DISCOVERED;
            }
            else {
                return discoveryResults;
            }
        });
    }
    linkBridgeByIp(ipaddress) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.createUser(ipaddress);
            if (result.isSuccess()) {
                const api = yield this.__createAuthenticatedApi(ipaddress, result.value.username);
                //TODO Check if this succeeded.
                yield this.saveNewDiscovery(api, result.value);
                yield this.updateConfigFile();
                this.api = api;
                return exports.success(true);
            }
            else {
                return result;
            }
        });
    }
    switchToBridge(ipAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            let api = yield this.__connectToBridge(ipAddress).then(res => { return res; });
            if (api.isSuccess()) {
                this.api = api.value;
                return exports.success(true);
            }
            else
                return api;
        });
    }
    //Returns a string[] of bridges or an string.
    getConfiguredBridges() {
        return __awaiter(this, void 0, void 0, function* () {
            const bridges = Object.keys(this.configSettings["bridges"]);
            if (bridges === undefined || bridges === null || bridges.length === 0) {
                return NO_BRIDGES_IN_CONFIG;
            }
            else {
                return bridges;
            }
        });
    }
    __connectToBridge(bridgeIpAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            let result = yield this.__createAuthenticatedApi(bridgeIpAddress, this.configSettings[CONF_BRIDGE_LOCATION][bridgeIpAddress]["username"]).then(res => { return res; });
            if (result.isSuccess()) {
                return result;
            }
            else if (result.isFailure()) {
                if (result.value == "ENOTFOUND" || result.value == "ETIMEDOUT") {
                    return yield this.findUnreachableBridge(bridgeIpAddress).then(res => { return res; });
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
    __createAuthenticatedApi(ipaddress, username) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield hueApi.createLocal(ipaddress).connect(username);
                return exports.success(result);
            }
            catch (err) {
                return exports.failure(err.code);
            }
        });
    }
    __createUnAuthenticatedApi(ipaddress) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield hueApi.createLocal(ipaddress).connect().then(result => {
                return exports.success(result);
            }).catch((err) => {
                return exports.failure(err.code);
            });
        });
    }
    createUser(bridgeIpAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            // Create an unauthenticated instance of the Hue API so that we can create a new user
            const result = yield this.__createUnAuthenticatedApi(bridgeIpAddress);
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
    updateConfigFile() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fs_1.promises.writeFile(CONF_NAME, JSON.stringify(this.configSettings)).then((res) => { return exports.success(true); }).catch((err) => { return exports.failure(err.code); });
        });
    }
    saveNewDiscovery(api, user) {
        return __awaiter(this, void 0, void 0, function* () {
            const bridgeConfig = yield api.configuration.getConfiguration();
            if (!(bridgeConfig.ipaddress in this.configSettings[CONF_BRIDGE_LOCATION])) {
                this.configSettings[CONF_BRIDGE_LOCATION][bridgeConfig.ipaddress] = {
                    "username": user.username,
                    "clientkey": user.clientkey,
                    "mac-address": bridgeConfig.mac,
                    "name": bridgeConfig.name,
                    "bridgeid": bridgeConfig.bridgeid
                };
            }
        });
    }
    //Returns a list of all lights.
    getAllLights() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.api.lights.getAll().then(res => {
                return exports.success(res);
            }).catch(err => {
                return exports.failure(err.code);
            });
        });
    }
    //Returns   or failure(message)
    manipulateLight(id, state) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.api.lights.setLightState(id, state);
        });
    }
    __getBridgesFromDiscoveryUrl() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield node_fetch_1.fetch(DISCOVERY_URL, { method: "Get" })
                .then((res) => __awaiter(this, void 0, void 0, function* () {
                return yield res.json().then(res => {
                    return exports.success(res);
                });
            })).catch((err) => {
                return exports.failure(err.code);
            });
        });
    }
    getConnectedBridge() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.api;
        });
    }
    //Attempts to find- and connect to the bridge
    findUnreachableBridge(unreacheableBridgeIP) {
        return __awaiter(this, void 0, void 0, function* () {
            let unreachableBridge = this.configSettings[CONF_BRIDGE_LOCATION][unreacheableBridgeIP];
            let possibleBridges = yield this.__getBridgesFromDiscoveryUrl().catch(err => {
                return exports.failure(err.code);
            });
            if (possibleBridges.isSuccess()) {
                if (possibleBridges.value.length === 0) {
                    return exports.failure(NO_BRIDGES_DISCOVERED);
                }
                else {
                    let result = { id: "", internalipaddress: "" };
                    yield possibleBridges.value.forEach(function (item) {
                        if (unreachableBridge["bridgeid"].toLowerCase() === item.id.toLowerCase()) {
                            result = item;
                            return;
                        }
                    });
                    if (typeof (result) === "object") {
                        let api = yield this.__createAuthenticatedApi(result.internalipaddress, unreachableBridge["username"]).catch(err => {
                            return exports.failure(err.code);
                        });
                        if (api.isSuccess()) {
                            this.configSettings[CONF_BRIDGE_LOCATION][result.internalipaddress] = unreachableBridge;
                            delete this.configSettings[CONF_BRIDGE_LOCATION][unreacheableBridgeIP];
                            this.updateConfigFile();
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
}
exports.CrownstoneHueModule = CrownstoneHueModule;
function testing() {
    return __awaiter(this, void 0, void 0, function* () {
        const test = new CrownstoneHueModule();
        yield test.init();
        const firstBridge = yield test.getConfiguredBridges().then(res => { return res[0]; });
        yield test.switchToBridge(firstBridge);
        // console.log(test.getConnectedBridge());
        let lights = yield test.getAllLights().then(res => { return res; });
        if (lights.isSuccess()) {
            lights.value.forEach(light => {
                console.log(light.id);
                test.manipulateLight(light.id, { on: false });
            });
        }
        // await test.switchToBridge(await test.getConfiguredBridges().then(res => {return res[0];}));
        // console.log(await test.getAllLights());
    });
}
testing();
//# sourceMappingURL=index.js.map