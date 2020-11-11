
# Documentation - Event calls
## Overview
 - [Crownstone Hue](/documentation/CrownstoneHue.md)
 - [Discovery](/documentation/Discovery.md)
 - [Bridge](/documentation/Bridge.md)
 - [Light](/documentation/Light.md)
 - [Errors](/documentation/Errors.md)
 - **Event calls**
 - [Persistence](/documentation/Persistence.md)
 - [LightAggregatorWrapper](/documentation/LightAggregatorWrapper.md)
 - [Behaviour Aggregator](/documentation/BehaviourAggregator.md)
 - [SwitchBehaviour- & Twilight Prioritizer](/documentation/Prioritizer.md)
 - [Behaviours](/documentation/Behaviours.md)

## About
The Crownstone Hue module uses some event calls for data transferring.
Meaning you can subscribe to these topics in case you need to catch something.
These topic constants are exported from [EventConstants.ts](/src/constants/EventConstants.ts)

## Events
### ON_BRIDGE_PERSISTENCE_UPDATE
When a bridge updates itself, it emits an event call with the topic ```"onBridgeUpdate"``` and a data ```object``` with information about itself. Formatted as:
```
{
name: string,
ipAddress: string, 
macAddress: string, 
username: string, 
clientKey: string, 
bridgeId: string, 
lights: {name: string, id: number, uniqueId: string}[]
}
``` 
### ON_PRESENCE_CHANGE
When a presence change call is made, it emits an event call with topic ```"onPresenceChange"``` and a data ```object``` formatted as follows:
```
{
type: "ENTER" | "LEAVE"
data: {
    type: "LOCATION"
    profileIdx: number
    locationId: number
    }   
}
...
{
type: "ENTER" | "LEAVE"
data: {
    type: "SPHERE"
    profileIdx: number 
    }   
}
```

### ON_DUMB_HOUSE_MODE_SWITCH
When dumb house mode is set, it emits an event call with the topic ```"onDumbHouseModeSwitch"``` and a data ```boolean```.