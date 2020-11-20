
# Documentation - Event calls
## Overview
 - [Crownstone Hue Behaviour](/documentation/CrownstoneHueBehaviour.md) 
 - [Errors](/documentation/Errors.md)
 - **Event calls**
 - [LightBehaviourWrapper](/documentation/LightBehaviourWrapper.md)
 - [Behaviour Aggregator](/documentation/BehaviourAggregator.md)
 - [SwitchBehaviour- & Twilight Prioritizer](/documentation/Prioritizer.md)
 - [Behaviours](/documentation/Behaviours.md)

## About
The Crownstone Hue module uses some event calls for data transferring.
Meaning you can subscribe to these topics in case you need to catch something.
These topic constants are exported from [EventConstants.ts](/src/constants/EventConstants.ts)
## Import
`import {EventBus} from "."`
## Events 
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
