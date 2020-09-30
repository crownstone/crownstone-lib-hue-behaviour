
interface DiscoverResult {
    id: string,
    internalipaddress: string
}

interface HueState {
    on: boolean,
    bri?: number,
    hue?: number,
    sat?: number,
    effect?: string,
    xy?: [number, number],
    ct?: number,
    alert?: string,
    colormode?: string,
    mode?: string,
    reachable?: boolean
}

interface StateUpdate {
    on?: boolean,
    bri?: number,
    hue?: number,
    sat?: number,
    effect?: string,
    xy?: [number, number],
    ct?: number,
    alert?: string,
    bri_inc?: number;
    hue_inc?: number;
    sat_inc?: number;
    ct_inc?: number;
    xy_inc?: [number, number];
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