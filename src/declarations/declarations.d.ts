
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

  setStateUpdateCallback(callback:((state: StateUpdate) => void)): void

  getUniqueId(): string

  getDeviceType(): DeviceType

  getState(): DeviceState
}

