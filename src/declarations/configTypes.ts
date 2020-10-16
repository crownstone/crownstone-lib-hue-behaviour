import {HueBehaviourWrapper} from "./behaviourTypes";

export interface ConfigurationObject {
  "Bridges": ConfBridges;
}

export interface ConfLights {
  [hueUniqueId: string]: ConfLightObject;
}

export interface ConfLightObject {
  name: string;
  id: number;
  behaviours: HueBehaviourWrapper[];
}

export interface ConfBridges {
  [uniqueId: string]: ConfBridgeObject
}

export interface ConfBridgeObject {
  name: string;
  ipAddress: string;
  macAddress: string;
  username: string;
  clientKey: string;
  lights: ConfLights;
}
