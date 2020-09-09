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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Framework = void 0;
var fs_1 = require("fs");
var Bridge_1 = require("./Bridge");
var node_hue_api_1 = require("node-hue-api");
;
var discovery = node_hue_api_1.v3.discovery;
var hueApi = node_hue_api_1.v3.api;
var model = node_hue_api_1.v3.model;
//Return messages/Error codes
var NO_BRIDGES_IN_CONFIG = "NO_BRIDGES_IN_CONFIG";
var NO_BRIDGES_DISCOVERED = "NO_BRIDGES_DISCOVERED";
var UNAUTHORIZED_USER = "UNAUTHORIZED_USER";
var BRIDGE_LINK_BUTTON_UNPRESSED = "BRIDGE_LINK_BUTTON_UNPRESSED";
var BRIDGE_CONNECTION_FAILED = "BRIDGE_CONNECTION_FAILED";
//TODO
//config locations/names
var CONF_NAME = "saveConfig.json";
var CONF_BRIDGE_LOCATION = "bridges";
var CONF_LIGHT_LOCATION = "lights";
var Framework = /** @class */ (function () {
    function Framework() {
        this.configSettings = { "bridges": "", "lights": "" };
        this.connectedBridges = new Array();
        this.APP_NAME = 'Hub';
        this.DEVICE_NAME = 'Hub1';
    }
    Framework.prototype.init = function () {
        return __awaiter(this, void 0, void 0, function () {
            var result, bridges, _i, result_1, bridgeId;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getConfigSettings()];
                    case 1:
                        _a.sent();
                        result = this.getConfiguredBridges();
                        bridges = new Array();
                        for (_i = 0, result_1 = result; _i < result_1.length; _i++) {
                            bridgeId = result_1[_i];
                            bridges.push(this.createBridgeFromConfig(bridgeId));
                        }
                        return [2 /*return*/, bridges];
                }
            });
        });
    };
    Framework.prototype.getConfigSettings = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fs_1.promises.readFile(CONF_NAME, 'utf8').then(function (data) {
                            _this.configSettings = JSON.parse(data);
                        }).catch(function (err) {
                            if (err.code === "ENOENT") {
                                _this.updateConfigFile();
                            }
                            throw err;
                        })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ;
    // Returns either a list of bridges
    Framework.prototype.discoverBridges = function () {
        return __awaiter(this, void 0, void 0, function () {
            var discoveryResults, bridges_1;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, discovery.nupnpSearch()];
                    case 1:
                        discoveryResults = _a.sent();
                        if (discoveryResults.length === 0) {
                            throw Error(NO_BRIDGES_DISCOVERED);
                        }
                        else {
                            bridges_1 = new Array();
                            discoveryResults.forEach(function (item) {
                                bridges_1.push(new Bridge_1.Bridge(item.name, "", "", "", item.ipaddress, "", _this));
                            });
                            return [2 /*return*/, bridges_1];
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    //Returns a string[] of bridges
    Framework.prototype.getConfiguredBridges = function () {
        var bridges = Object.keys(this.configSettings["bridges"]);
        if (bridges === undefined || bridges === null || bridges.length === 0) {
            throw Error(NO_BRIDGES_IN_CONFIG);
        }
        else {
            return bridges;
        }
    };
    //Temp???
    Framework.prototype.saveBridgeInformation = function (bridge) {
        return __awaiter(this, void 0, void 0, function () {
            var config, bridgeId;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        config = bridge.getInfo();
                        bridgeId = config["bridgeId"];
                        delete config["reachable"];
                        delete config["bridgeId"];
                        this.configSettings[CONF_BRIDGE_LOCATION][bridgeId] = config;
                        return [4 /*yield*/, this.updateConfigFile()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Framework.prototype.saveAllLightsFromConnectedBridges = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                this.connectedBridges.forEach(function (bridge) {
                    bridge.getConnectedLights().forEach(function (light) { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, this.saveLightInfo(light.getInfo())];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                });
                return [2 /*return*/];
            });
        });
    };
    Framework.prototype.saveLightInfo = function (light) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.configSettings[CONF_LIGHT_LOCATION][light["uniqueId"]] = {};
                        this.configSettings[CONF_LIGHT_LOCATION][light["uniqueId"]]["name"] = light["name"];
                        this.configSettings[CONF_LIGHT_LOCATION][light["uniqueId"]]["id"] = light["id"];
                        this.configSettings[CONF_LIGHT_LOCATION][light["uniqueId"]]["bridgeId"] = light["bridgeId"];
                        this.configSettings[CONF_LIGHT_LOCATION][light["uniqueId"]]["state"] = light["state"];
                        return [4 /*yield*/, this.updateConfigFile()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    //Call this to save configuration to the config file.
    Framework.prototype.updateConfigFile = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fs_1.promises.writeFile(CONF_NAME, JSON.stringify(this.configSettings))];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    Framework.prototype.getConnectedBridges = function () {
        return this.connectedBridges;
    };
    Framework.prototype.createBridgeFromConfig = function (bridgeId) {
        var bridgeConfig = this.configSettings[CONF_BRIDGE_LOCATION][bridgeId];
        var bridge = new Bridge_1.Bridge(bridgeConfig.name, bridgeConfig.username, bridgeConfig.clientKey, bridgeConfig.macAddress, bridgeConfig.ipAddress, bridgeId, this);
        this.connectedBridges.push(bridge);
        return bridge;
    };
    return Framework;
}());
exports.Framework = Framework;
