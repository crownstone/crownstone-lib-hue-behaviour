# Documentation - Crownstone Hue Behaviour
## Overview
 - **Crownstone Hue Behaviour**
	- [Constructing](#Constructing) 
	- [Adding/Removing Light objects](#addingremoving-light-objects)
		- [Adding a light](#adding-a-light)
		- [Removing a light](#removing-a-light)
	- [Adding/Updating/Removing Behaviours](#addingupdatingremoving-behaviours)
		- [Adding/Updating a Behaviour](#addingupdating-a-behaviour) 
		- [Removing a Behaviour](#removing-a-behaviour)
	-  [Updating user presence](#updating-user-presence)
	-  [Updating Sphere location](#updating-sphere-location)
	-  [Switching Dumb house mode](#switching-dumb-house-mode)
	-  [Stopping the module](#stopping-the-module)
	-  [Obtaining Lights](#obtaining-lights) 
 - [Errors](/documentation/Errors.md)
 - [Event calls](/documentation/EventCalls.md)
 - [LightBehaviourWrapper](/documentation/LightBehaviourWrapper.md)
 - [Behaviour Aggregator](/documentation/BehaviourAggregator.md)
 - [SwitchBehaviour- & Twilight Prioritizer](/documentation/Prioritizer.md)
 - [Behaviours](/documentation/Behaviours.md)

## About
The Crownstone Hue Behaviour class is the front of the module, it combines all its functions for easier usage.
## Usage 
### Import
```import {CrownstoneHueBehaviour} from {crownstone-lib-hue-behaviour}```
### Constructing
```
const crownstoneHueBehaviour = new CrownstoneHueBehaviour({latitude: 51.916064, longitude: 4.472683})  
..or..
const crownstoneHueBehaviour = new CrownstoneHueBehaviour()  
```
A SphereLocation object has the following structure:
```
interface SphereLocation {
	latitude: number,
	longitude: number
}
```
This information will be used for the time of sunrise and sunset.

If no sphereLocation object is given, the latitude or longitude is missing, the location defaults to the Crownstone's office.

### Adding/Removing Light objects
#### Adding a light
In order to add a light, call:
```
await crownstoneHueBehaviour.addLight(light:Light);
``` 
The light object should be a CrownstoneHue Light objects, as this is the only thing it supports as of writing.

#### Removing a light
In order to remove a light, you call:
```
crownstoneHueBehaviour.removeLight(lightId);
``` 
The id that is used, is the light's unique id. 

### Adding/Updating/Removing Behaviours
#### Adding/Updating a Behaviour
To add or update a behaviour to the module, call:
```
crownstoneHueBehaviour.setBehaviour(behaviour:HueBehaviourWrapper);
``` 
See [HueBehaviourWrapper](/src/declarations/behaviourTypes.d.ts) for the format.
 
This function will add/update the behaviour based on the ```cloudId``` and ```lightId ``` variable inside the object. 
Returning a true when done or false when there is no light corresponding the behaviour's lightId.

##### Example
```
await crownstoneHueBehaviour.setBehaviour({
				  "type": "BEHAVIOUR",
                    "data": {
                      "action": {"type": "BE_ON", "data": 100},
                      "time": {
                        "type": "RANGE",
                        "from": {"type": "CLOCK", "data": {"hours": 13, "minutes": 20}},
                        "to": {"type": "SUNSET", "offsetMinutes": 0}
                  
                      },
                      "presence": {"type": "IGNORE"}
                    },
                    "activeDays": {
                      "Mon": true,
                      "Tue": true,
                      "Wed": true,
                      "Thu": true,
                      "Fri": true,
                      "Sat": true,
                      "Sun": true
                    },
				  lightId: "AS:FD:52....",
				  cloudId:"ygD9z3FyKWqyOVb7xkJCC5v"
				  })
```

#### Removing a Behaviour 
To remove a behaviour from the module, call:
```
crownstoneHueBehaviour.removeBehaviour(lightId,cloudId);
``` 

### Updating user presence
If a user enters or leaves a room or a sphere, call:
```
crownstoneHueBehaviour.presenceChange(data:PresenceEvent);
``` 
This will send an event call with the presence event data to all the behaviours
The format for the PresenceEvent can be build with the following interfaces:
```
interface PresenceEvent{  
  type: PresenceEventType  
  data: PresenceProfile  
}

type PresenceEventType = "ENTER" | "LEAVE"  

type PresenceProfile = PresenceProfileLocation | PresenceProfileSphere  
  
interface PresenceProfileLocation {  
  type: "LOCATION"  
  profileIdx: number  
  locationId: number  
}  
  
interface PresenceProfileSphere {  
  type: "SPHERE"  
  profileIdx: number  
}  
```
#### Example:
An event for a user with id 0 entering a sphere is as follows:
```
{
	type:"ENTER",
	data: {
		type:"SPHERE",
		profileIdx: 0
		}
}
```
An event for a user with id 1 leaving a location with id 4 is as follows:
```
{
	type:"LEAVE",
	data: {
		type:"LOCATION",
		profileIdx: 1,
		locationId: 4
		}
}
```

### Updating Sphere location
To update the Sphere's location, call:
```
crownstoneHueBehaviour.setSphereLocation(sphereLocation:SphereLocation);

```

###  Switching Dumb house mode
To switch dumb house mode on or off, call:
```
crownstoneHueBehaviour.setDumbHouseMode(on:boolean);
```
On function call, it emits an event call to all BehaviourAggregators with the given value.
When the value is true, behaviours do not manipulate the light's state.

### Stopping the module
To stop the module, call:
```
crownstoneHueBehaviour.stop();
```
This will stop all timers and cleanup the eventbus.


### Obtaining Lights

```getAllConnectedLights()```  will return a mapped list as `{[uniqueId: string]: Light}`, `uniqueId` represents the Light's uniqueId.

