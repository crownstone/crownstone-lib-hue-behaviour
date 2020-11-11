interface ConfigurationObject {
  "Bridges": ConfBridges;
}

interface ConfLights {
  [hueUniqueId: string]: ConfLightObject;
}

interface ConfLightObject {
  name: string;
  id: number;
  behaviours: HueBehaviourWrapper[];
}

interface ConfBridges {
  [uniqueId: string]: ConfBridgeObject
}

interface ConfBridgeObject {
  name: string;
  ipAddress: string;
  macAddress: string;
  username: string;
  clientKey: string;
  lights: ConfLights;
}

interface LightInfoObject {
  name: string,
  id: number,
  uniqueId: string
}