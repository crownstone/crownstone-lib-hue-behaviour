
interface DiscoverResult {
  id: string,
  internalipaddress: string
}

interface HueStateBase{
  on?: boolean,
  bri?: number,
  hue?: number,
  sat?: number,
  xy?: [number, number],
  ct?: number,
}
interface HueLightState extends HueStateBase{
  on: boolean
}

interface HueFullState extends HueLightState{
  effect?: string,
  alert?: string,
  colormode?: string,
  mode?: string,
  reachable: boolean
}

interface StateUpdate extends HueStateBase{
  effect?: string,
  alert?: string,
  bri_inc?: number;
  hue_inc?: number;
  sat_inc?: number;
  ct_inc?: number;
  xy_inc?: [number, number];
  transitiontime?:number
}


interface BridgeFormat {
  name: string;
  username: string;
  clientKey: string;
  macAddress: string;
  ipAddress: string;
  bridgeId: string;
  lights?: object;
}

interface PresenceProfileLocation {
  type: "LOCATION"
  profileIdx: number
  locationId: number
}

interface PresenceProfileSphere {
  type: "SPHERE"
  profileIdx: number
}

type PresenceProfile = PresenceProfileLocation | PresenceProfileSphere

type PresenceEventType = "ENTER" | "LEAVE"

interface PresenceEvent{
  type: PresenceEventType
  data: PresenceProfile
}

interface SphereLocation {
  latitude: number,
  longitude: number
}
interface PrioritizedList{
  1: SwitchBehaviourInterface[];
  2: SwitchBehaviourInterface[];
  3: SwitchBehaviourInterface[];
  4: SwitchBehaviourInterface[];
}

type EventUnsubscriber = () => void

interface lightInfo {
  name: string
  uniqueId: string,
  state: HueFullState,
  bridgeId: string,
  id: number,
  supportedStates: {  },
  capabilities: { },
  lastUpdate: number
}

interface failedConnection{
  hadConnectionFailure:true;
}