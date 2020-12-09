// interface HueStateBase {
//   on?: boolean,
//   bri?: number,
//   hue?: number,
//   sat?: number,
//   xy?: [number, number],
//   ct?: number,
// }
//
// interface HueLightState extends HueStateBase {
//   on: boolean
// }
//
// interface HueFullState extends HueLightState {
//   effect?: string,
//   alert?: string,
//   colormode?: string,
//   mode?: string,
//   reachable: boolean
// }
// //
// // interface StateUpdate extends HueStateBase {
// //   effect?: string,
// //   alert?: string,
// //   bri_inc?: number;
// //   hue_inc?: number;
// //   sat_inc?: number;
// //   ct_inc?: number;
// //   xy_inc?: [number, number];
// //   transitiontime?: number
// // }
//

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

interface PresenceEvent {
  type: PresenceEventType
  data: PresenceProfile
}

interface SphereLocation {
  latitude: number,
  longitude: number
}

interface PrioritizedList {
  1: SwitchBehaviourInterface[];
  2: SwitchBehaviourInterface[];
  3: SwitchBehaviourInterface[];
  4: SwitchBehaviourInterface[];
}

type EventUnsubscriber = () => void

interface DeviceBehaviourSupport {
  receiveStateUpdate(state:StateUpdate): void

  setStateUpdateCallback(callback:((state:StateUpdate) => {})): void

  getUniqueId(): string

  getDeviceType(): DeviceType

  getState(): DeviceStates
}

