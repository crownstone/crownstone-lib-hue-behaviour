
# Documentation  - Event calls
## Overview

 - Crownstone Hue  
 - Discovery
 - Bridge
 - Light 
 - LightAggregatorWrapper
 - Behaviour Aggregator 
 - Behaviour & Twilight Prioritizer 
 - Behavior/Twilight 
 - Persistence 
 - **Event calls**
 - Errors

## About
The Crownstone Hue module uses some event calls for data transfering.
Meaning you can subscribe to these topics in case you need to catch something.
These topic constants are exported from EventConstants.ts [ToDo link to event constants ]

## Events
### ON_BRIDGE_PERSISTENCE_UPDATE
When a bridge updates itself, it emits an event call with topic ```"onBridgeUpdate"``` and a data ```object``` with information about itself. Formatted as:
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
When dumbhouse mode is set, it emits an event call with topic ```"onDumbHouseModeSwitch"``` and a data ```boolean```.