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
exports.Bridge = void 0;
var Light_1 = require("./Light");
var node_hue_api_1 = require("node-hue-api");
var discovery = node_hue_api_1.v3.discovery;
var hueApi = node_hue_api_1.v3.api;
var model = node_hue_api_1.v3.model;
var fetch = require('node-fetch');
var DISCOVERY_URL = "https://discovery.meethue.com/";
//Return messages/Error codes
var NO_BRIDGES_IN_CONFIG = "NO_BRIDGES_IN_CONFIG";
var NO_BRIDGES_DISCOVERED = "NO_BRIDGES_DISCOVERED";
var UNAUTHORIZED_USER = "UNAUTHORIZED_USER";
var BRIDGE_LINK_BUTTON_UNPRESSED = "BRIDGE_LINK_BUTTON_UNPRESSED";
var BRIDGE_NOT_DISCOVERED = "BRIDGE_NOT_DISCOVERED";
var Bridge = /** @class */ (function () {
    function Bridge(name, username, clientKey, macAddress, ipAddress, bridgeId, framework) {
        this.lights = new Array();
        this.reachable = false;
        this.name = name;
        this.username = username;
        this.ipAddress = ipAddress;
        this.clientKey = clientKey;
        this.macAddress = macAddress;
        this.bridgeId = bridgeId;
        this.framework = framework;
    }
    Bridge.prototype.init = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(this.username == "")) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.link()];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, this.connect()];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: return [4 /*yield*/, this.populateLights()];
                    case 5:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Bridge.prototype.link = function () {
        return __awaiter(this, void 0, void 0, function () {
            var bridgeConfig;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.createUser()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.connect()];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.api.configuration.getConfiguration()];
                    case 3:
                        bridgeConfig = _a.sent();
                        return [4 /*yield*/, this.update({
                                "bridgeId": bridgeConfig.bridgeid,
                                "name": bridgeConfig.name,
                                "macAddress": bridgeConfig.mac,
                                "reachable": true
                            })
                            //TODO Different solution?
                        ];
                    case 4:
                        _a.sent();
                        //TODO Different solution?
                        return [4 /*yield*/, this.framework.connectedBridges.push(this)];
                    case 5:
                        //TODO Different solution?
                        _a.sent();
                        return [4 /*yield*/, this.framework.saveBridgeInformation(this)];
                    case 6:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Bridge.prototype.connect = function () {
        return __awaiter(this, void 0, void 0, function () {
            var err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 5]);
                        return [4 /*yield*/, this.createAuthenticatedApi()];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 2:
                        err_1 = _a.sent();
                        if (!(err_1.code == "ENOTFOUND" || err_1.code == "ETIMEDOUT")) return [3 /*break*/, 4];
                        return [4 /*yield*/, this._rediscoverMyself()];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: throw err_1;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    Bridge.prototype.getConnectedLights = function () {
        return this.lights;
    };
    Bridge.prototype.createAuthenticatedApi = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this;
                        return [4 /*yield*/, hueApi.createLocal(this.ipAddress).connect(this.username)];
                    case 1:
                        _a.api = _b.sent();
                        this.reachable = true;
                        return [2 /*return*/];
                }
            });
        });
    };
    Bridge.prototype.createUnAuthenticatedApi = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this;
                        return [4 /*yield*/, hueApi.createLocal(this.ipAddress).connect()];
                    case 1:
                        _a.api = _b.sent();
                        this.reachable = true;
                        return [2 /*return*/];
                }
            });
        });
    };
    //User should press link button before this is called.
    Bridge.prototype.createUser = function () {
        return __awaiter(this, void 0, void 0, function () {
            var createdUser;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.createUnAuthenticatedApi()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.api.users.createUser(this.framework.APP_NAME, this.framework.DEVICE_NAME)];
                    case 2:
                        createdUser = _a.sent();
                        this.update({ "username": createdUser.username, "clientKey": createdUser.clientkey });
                        return [2 /*return*/];
                }
            });
        });
    };
    Bridge.prototype.populateLights = function () {
        return __awaiter(this, void 0, void 0, function () {
            var lights;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.api.lights.getAll()];
                    case 1:
                        lights = _a.sent();
                        lights.forEach(function (light) {
                            _this.lights.push(new Light_1.Light(light.name, light.uniqueid, light.state, light.id, light.capabilities.control, light.getSupportedStates(), _this));
                        });
                        return [2 /*return*/];
                }
            });
        });
    };
    //Attempts to find- and connect to the bridge
    Bridge.prototype._rediscoverMyself = function () {
        return __awaiter(this, void 0, void 0, function () {
            var possibleBridges, result, _i, possibleBridges_1, item, oldIpAddress;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._getBridgesFromDiscoveryUrl()];
                    case 1:
                        possibleBridges = _a.sent();
                        if (!(possibleBridges.length === 0)) return [3 /*break*/, 2];
                        throw Error(BRIDGE_NOT_DISCOVERED);
                    case 2:
                        result = { id: "", internalipaddress: "" };
                        for (_i = 0, possibleBridges_1 = possibleBridges; _i < possibleBridges_1.length; _i++) {
                            item = possibleBridges_1[_i];
                            if (this.bridgeId.toLowerCase() === item.id.toLowerCase()) {
                                result = item;
                                break;
                            }
                        }
                        if (!(typeof (result) === "object")) return [3 /*break*/, 5];
                        oldIpAddress = this.ipAddress;
                        this.ipAddress = result.internalipaddress;
                        return [4 /*yield*/, this.createAuthenticatedApi()];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, this.framework.saveBridgeInformation(this, oldIpAddress)];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5:
                        if (result.id === "") {
                            throw Error(BRIDGE_NOT_DISCOVERED);
                        }
                        _a.label = 6;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    Bridge.prototype._getBridgesFromDiscoveryUrl = function () {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fetch(DISCOVERY_URL, { method: "Get" }).then(function (res) { return res.json(); })];
                    case 1:
                        result = _a.sent();
                        console.log(result);
                        return [2 /*return*/, result];
                }
            });
        });
    };
    /// TODO
    Bridge.prototype.update = function (newValues) {
        var _this = this;
        Object.keys(newValues).forEach(function (key) {
            if (typeof (_this[key]) !== undefined) {
                _this[key] = newValues[key];
            }
        });
    };
    Bridge.prototype.getInfo = function () {
        return {
            name: this.name,
            ipAddress: this.ipAddress,
            macAddress: this.macAddress,
            username: this.username,
            clientKey: this.clientKey,
            bridgeId: this.bridgeId,
            reachable: this.reachable
        };
    };
    return Bridge;
}());
exports.Bridge = Bridge;
