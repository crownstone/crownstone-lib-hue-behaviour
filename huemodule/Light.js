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
exports.Light = void 0;
var Light = /** @class */ (function () {
    function Light(name, uniqueId, state, id, bridgeId, capabilities, supportedStates, connectedBridge) {
        this.name = name;
        this.uniqueId = uniqueId;
        this.state = state;
        this.id = id;
        this.bridgeId = bridgeId;
        this.capabilities = capabilities;
        this.supportedStates = supportedStates;
        this.connectedBridge = connectedBridge;
        this.lastUpdate = Date.now();
    }
    Light.prototype.setName = function (name) {
        this.name = name;
    };
    Light.prototype.setLastUpdate = function () {
        this.lastUpdate = Date.now();
    };
    Light.prototype.renewState = function () {
        return __awaiter(this, void 0, void 0, function () {
            var newState;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.connectedBridge.api.lights.getLightState(this.id)];
                    case 1:
                        newState = _a.sent();
                        if (this.state != newState) {
                            this.state = newState;
                            this.setLastUpdate();
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    //This is just to filter for the state object. It is not connected to the supported states.
    Light.prototype._isAllowedStateType = function (state) {
        if (state === 'on' || state === 'hue' ||
            state === 'bri' || state === 'sat' ||
            state === 'effect' || state === 'xy' ||
            state === 'ct' || state === 'alert') {
            return true;
        }
        else {
            return false;
        }
    };
    Light.prototype.updateState = function (state) {
        var _this = this;
        Object.keys(state).forEach(function (key) {
            if (_this._isAllowedStateType(key)) {
                _this.state[key] = state[key];
            }
        });
        this.setLastUpdate();
    };
    Light.prototype.setState = function (state) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                result = this.connectedBridge.api.lights.setLightState(this.id.toString(), state);
                if (result) {
                    this.updateState(state);
                }
                return [2 /*return*/, result];
            });
        });
    };
    Light.prototype.isReachable = function () {
        return this.state["reachable"];
    };
    Light.prototype.getInfo = function () {
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
    };
    Light.prototype.getUniqueId = function () {
        return this.uniqueId;
    };
    Light.prototype.getSupportedStates = function () {
        return this.supportedStates;
    };
    return Light;
}());
exports.Light = Light;
