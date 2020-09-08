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
exports.CrownstoneHueModule = exports.failure = exports.success = exports.Failure = exports.Success = void 0;
var fs_1 = require("fs");
var node_hue_api_1 = require("node-hue-api");
var nupnp_1 = require("node-hue-api/lib/api/discovery/nupnp");
var discovery = node_hue_api_1.v3.discovery;
var hueApi = node_hue_api_1.v3.api;
var model = node_hue_api_1.v3.model;
//User signing
var APP_NAME = 'node-hue-api';
var DEVICE_NAME = 'testSuite';
//Return messages/Error codes
var NO_BRIDGES_IN_CONFIG = "NO_BRIDGES_IN_CONFIG";
var NO_BRIDGES_DISCOVERED = "NO_BRIDGES_DISCOVERED";
var UNAUTHORIZED_USER = "UNAUTHORIZED_USER";
var BRIDGE_LINK_BUTTON_UNPRESSED = "BRIDGE_LINK_BUTTON_UNPRESSED";
var BRIDGE_CONNECTION_FAILED = "BRIDGE_CONNECTION_FAILED";
//config locations/names
var CONF_NAME = "saveConfig.json";
var CONF_BRIDGE_LOCATION = "bridges";
var CONF_LIGHT_LOCATION = "lights";
var Success = /** @class */ (function () {
    function Success(value) {
        this.value = value;
    }
    Success.prototype.isSuccess = function () {
        return true;
    };
    Success.prototype.isFailure = function () {
        return false;
    };
    return Success;
}());
exports.Success = Success;
var Failure = /** @class */ (function () {
    function Failure(value) {
        this.value = value;
    }
    Failure.prototype.isSuccess = function () {
        return false;
    };
    Failure.prototype.isFailure = function () {
        return true;
    };
    return Failure;
}());
exports.Failure = Failure;
exports.success = function (l) {
    return new Success(l);
};
exports.failure = function (a) {
    return new Failure(a);
};
var CrownstoneHueModule = /** @class */ (function () {
    function CrownstoneHueModule() {
        this.configSettings = { "bridges": "", "lights": "" };
    }
    CrownstoneHueModule.prototype.init = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getConfigSettings()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    CrownstoneHueModule.prototype.getConfigSettings = function () {
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
                        })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ;
    // Returns either a list of bridges or a errorcode
    CrownstoneHueModule.prototype.discoverBridges = function () {
        return __awaiter(this, void 0, void 0, function () {
            var discoveryResults;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, discovery.nupnpSearch().then(function (res) {
                            return res;
                        })];
                    case 1:
                        discoveryResults = _a.sent();
                        if (discoveryResults.length === 0) {
                            return [2 /*return*/, NO_BRIDGES_DISCOVERED];
                        }
                        else {
                            return [2 /*return*/, discoveryResults];
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    CrownstoneHueModule.prototype.linkBridgeByIp = function (ipaddress) {
        return __awaiter(this, void 0, void 0, function () {
            var result, api;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.createUser(ipaddress)];
                    case 1:
                        result = _a.sent();
                        if (!result.isSuccess()) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.__createAuthenticatedApi(ipaddress, result.value.username)];
                    case 2:
                        api = _a.sent();
                        //TODO Check if this succeeded.
                        return [4 /*yield*/, this.saveNewDiscovery(api, result.value)];
                    case 3:
                        //TODO Check if this succeeded.
                        _a.sent();
                        return [4 /*yield*/, this.updateConfigFile()];
                    case 4:
                        _a.sent();
                        this.api = api;
                        return [2 /*return*/, exports.success(true)];
                    case 5: return [2 /*return*/, result];
                }
            });
        });
    };
    CrownstoneHueModule.prototype.switchToBridge = function (ipAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var api;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.__connectToBridge(ipAddress).then(function (res) {
                            return res;
                        })];
                    case 1:
                        api = _a.sent();
                        if (api.isSuccess()) {
                            this.api = api.value;
                            return [2 /*return*/, exports.success(true)];
                        }
                        else
                            return [2 /*return*/, api];
                        return [2 /*return*/];
                }
            });
        });
    };
    //Returns a string[] of bridges or an string.
    CrownstoneHueModule.prototype.getConfiguredBridges = function () {
        return __awaiter(this, void 0, void 0, function () {
            var bridges;
            return __generator(this, function (_a) {
                bridges = Object.keys(this.configSettings["bridges"]);
                if (bridges === undefined || bridges === null || bridges.length === 0) {
                    return [2 /*return*/, NO_BRIDGES_IN_CONFIG];
                }
                else {
                    return [2 /*return*/, bridges];
                }
                return [2 /*return*/];
            });
        });
    };
    CrownstoneHueModule.prototype.__connectToBridge = function (bridgeIpAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.__createAuthenticatedApi(bridgeIpAddress, this.configSettings[CONF_BRIDGE_LOCATION][bridgeIpAddress]["username"]).then(function (res) {
                            return res;
                        })];
                    case 1:
                        result = _a.sent();
                        if (!result.isSuccess()) return [3 /*break*/, 2];
                        return [2 /*return*/, result];
                    case 2:
                        if (!result.isFailure()) return [3 /*break*/, 6];
                        if (!(result.value == "ENOTFOUND" || result.value == "ETIMEDOUT")) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.findUnreachableBridge(bridgeIpAddress).then(function (res) {
                                return res;
                            })];
                    case 3: return [2 /*return*/, _a.sent()];
                    case 4: return [2 /*return*/, result];
                    case 5: return [3 /*break*/, 7];
                    case 6: return [2 /*return*/, exports.failure("UNEXPECTED ERROR")];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    CrownstoneHueModule.prototype.__createAuthenticatedApi = function (ipaddress, username) {
        return __awaiter(this, void 0, void 0, function () {
            var result, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, hueApi.createLocal(ipaddress).connect(username)];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, exports.success(result)];
                    case 2:
                        err_1 = _a.sent();
                        return [2 /*return*/, exports.failure(err_1.code)];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    CrownstoneHueModule.prototype.__createUnAuthenticatedApi = function (ipaddress) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, hueApi.createLocal(ipaddress).connect().then(function (result) {
                            return exports.success(result);
                        }).catch(function (err) {
                            return exports.failure(err.code);
                        })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    //User should press link button before this is called.
    CrownstoneHueModule.prototype.createUser = function (bridgeIpAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var result, createdUser, err_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.__createUnAuthenticatedApi(bridgeIpAddress)];
                    case 1:
                        result = _a.sent();
                        if (!result.isSuccess()) return [3 /*break*/, 6];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, result.value.users.createUser(APP_NAME, DEVICE_NAME)];
                    case 3:
                        createdUser = _a.sent();
                        return [2 /*return*/, exports.success(createdUser)];
                    case 4:
                        err_2 = _a.sent();
                        if (err_2.getHueErrorType() === 101) {
                            return [2 /*return*/, exports.failure(BRIDGE_LINK_BUTTON_UNPRESSED)];
                        }
                        else {
                            exports.failure(err_2.code);
                        }
                        return [3 /*break*/, 5];
                    case 5: return [3 /*break*/, 7];
                    case 6: return [2 /*return*/, result];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    //Call this to save configuration to the config file.
    CrownstoneHueModule.prototype.updateConfigFile = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fs_1.promises.writeFile(CONF_NAME, JSON.stringify(this.configSettings)).then(function (res) {
                            return exports.success(true);
                        }).catch(function (err) {
                            return exports.failure(err.code);
                        })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    CrownstoneHueModule.prototype.saveNewDiscovery = function (api, user) {
        return __awaiter(this, void 0, void 0, function () {
            var bridgeConfig;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, api.configuration.getConfiguration()];
                    case 1:
                        bridgeConfig = _a.sent();
                        if (!(bridgeConfig.ipaddress in this.configSettings[CONF_BRIDGE_LOCATION])) {
                            this.configSettings[CONF_BRIDGE_LOCATION][bridgeConfig.ipaddress] = {
                                "username": user.username,
                                "clientkey": user.clientkey,
                                "mac-address": bridgeConfig.mac,
                                "name": bridgeConfig.name,
                                "bridgeid": bridgeConfig.bridgeid
                            };
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    //Uses the nupnp export from the library before it gets altered.
    CrownstoneHueModule.prototype.__getBridgesFromDiscoveryUrl = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, nupnp_1.nupnp()
                            .then(function (res) { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                return [2 /*return*/, exports.success(res)];
                            });
                        }); }).catch(function (err) {
                            if (err.code != undefined) {
                                return exports.failure(err.code);
                            }
                            else {
                                return exports.failure(err);
                            }
                        })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    CrownstoneHueModule.prototype.getConnectedBridge = function () {
        return this.api;
    };
    //Attempts to find- and connect to the bridge
    CrownstoneHueModule.prototype.findUnreachableBridge = function (ipAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var unreachableBridge, possibleBridges, result_1, api;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        unreachableBridge = this.configSettings[CONF_BRIDGE_LOCATION][ipAddress];
                        return [4 /*yield*/, this.__getBridgesFromDiscoveryUrl().catch(function (err) {
                                return exports.failure(err.code);
                            })];
                    case 1:
                        possibleBridges = _a.sent();
                        if (!possibleBridges.isSuccess()) return [3 /*break*/, 6];
                        if (!(possibleBridges.value.length === 0)) return [3 /*break*/, 2];
                        return [2 /*return*/, exports.failure(NO_BRIDGES_DISCOVERED)];
                    case 2:
                        result_1 = { id: "", internalipaddress: "" };
                        return [4 /*yield*/, possibleBridges.value.forEach(function (item) {
                                if (unreachableBridge["bridgeid"].toLowerCase() === item.id.toLowerCase()) {
                                    result_1 = item;
                                    return;
                                }
                            })];
                    case 3:
                        _a.sent();
                        if (!(typeof (result_1) === "object")) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.__createAuthenticatedApi(result_1.internalipaddress, unreachableBridge["username"]).catch(function (err) {
                                return exports.failure(err.code);
                            })];
                    case 4:
                        api = _a.sent();
                        if (api.isSuccess()) {
                            this.__replaceBridgeInformation(result_1.internalipaddress, unreachableBridge, ipAddress);
                            return [2 /*return*/, api];
                        }
                        else {
                            return [2 /*return*/, api];
                        }
                        _a.label = 5;
                    case 5: return [3 /*break*/, 7];
                    case 6: return [2 /*return*/, possibleBridges];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    CrownstoneHueModule.prototype.__replaceBridgeInformation = function (newIpAddress, unreachableBridge, oldIpAddress) {
        this.configSettings[CONF_BRIDGE_LOCATION][newIpAddress] = unreachableBridge;
        delete this.configSettings[CONF_BRIDGE_LOCATION][oldIpAddress];
        this.updateConfigFile();
    };
    //Returns a list of all lights.
    CrownstoneHueModule.prototype.getAllLights = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.api.lights.getAll().then(function (res) {
                            return exports.success(res);
                        }).catch(function (err) {
                            return exports.failure(err.code);
                        })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    //Returns   or failure(message)
    CrownstoneHueModule.prototype.manipulateLightByBridgeId = function (id, state) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.api.lights.setLightState(id, state)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    return CrownstoneHueModule;
}());
exports.CrownstoneHueModule = CrownstoneHueModule;
function testing() {
    return __awaiter(this, void 0, void 0, function () {
        var test, _a, _b, firstBridge, lights;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    test = new CrownstoneHueModule();
                    _b = (_a = console).log;
                    return [4 /*yield*/, test.__getBridgesFromDiscoveryUrl()];
                case 1:
                    _b.apply(_a, [_c.sent()]);
                    return [4 /*yield*/, test.init()];
                case 2:
                    _c.sent();
                    return [4 /*yield*/, test.getConfiguredBridges().then(function (res) {
                            return res[0];
                        })];
                case 3:
                    firstBridge = _c.sent();
                    return [4 /*yield*/, test.switchToBridge(firstBridge)];
                case 4:
                    _c.sent();
                    return [4 /*yield*/, test.getAllLights().then(function (res) {
                            return res;
                        })];
                case 5:
                    lights = _c.sent();
                    console.log(lights);
                    if (lights.isSuccess()) {
                        lights.value.forEach(function (light) {
                            console.log(light);
                            test.manipulateLightByBridgeId(light.id, { on: false });
                        });
                    }
                    return [2 /*return*/];
            }
        });
    });
}
testing();
