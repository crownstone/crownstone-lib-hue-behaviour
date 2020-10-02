interface ConfigurationObject {
  "Bridges": ConfBridges;
}

interface ConfLights {
  [hueUniqueId: string]: ConfLightObject;
}

interface ConfBridges {
  [uniqueId: string]: ConfBridgeObject
}

interface ConfLightObject {
  name: string;
  id: number;
  behaviours: HueBehaviourWrapper[];
}

interface ConfBridgeObject {
  name: string;
  ipAddress: string;
  macAddress: string;
  username: string;
  clientKey: string;
  lights: ConfLights;
}