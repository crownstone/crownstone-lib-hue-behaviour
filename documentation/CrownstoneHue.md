# Documentation - Crownstone Hue 
## Overview
 - **Crownstone Hue**
	- [Constructing](#Constructing)
	- [Adding a Philips Hue Bridge](#adding-a-philips-hue-bridge)
	- [Removing a Philips Hue Bridge](#removing-a-philips-hue-bridge)
	- [Adding/Removing Philips Hue Lights](#addingremoving-philips-hue-lights)
		- [Adding a light](#adding-a-light)
		- [Removing a light](#removing-a-light)
	- [Adding/Updating/Removing Behaviours](#addingupdatingremoving-behaviours)
		- [Adding/Updating a Behaviour](#addingupdating-a-behaviour) 
		- [Removing a Behaviour](#removing-a-behaviour)
	-  [Updating user presence](#updating-user-presence)
	-  [Updating Sphere location](#updating-sphere-location)
	-  [Switching Dumb house mode](#switching-dumb-house-mode)
	-  [Stopping the module](#stopping-the-module)
	-  [Obtaining Lights and Bridges](#obtaining-lights-and-bridges)
 - [Discovery](/documentation/Discovery.md)
 - [Bridge](/documentation/Bridge.md)
 - [Light](/documentation/Light.md)
 - [Errors](/documentation/Errors.md)
 - [Event calls](/documentation/EventCalls.md)
 - [LightBehaviourWrapper](/documentation/LightBehaviourWrapper.md)
 - [Behaviour Aggregator](/documentation/BehaviourAggregator.md)
 - [SwitchBehaviour- & Twilight Prioritizer](/documentation/Prioritizer.md)
 - [Behaviours](/documentation/Behaviours.md)

## About
The Crownstone Hue class is the front of the module. To use the module, call one of its functions as this will handle all passed data from outside and calls the persistence functions when needed.
## Usage 
### Import
```import {CrownstoneHueBehaviour} from {.}```
### Constructing

``` 
const crownstoneHue = new CrownstoneHueBehaviour(sphereLocation:SphereLocation);
or
const crownstoneHue = new CrownstoneHueBehaviour();

``` 
A SphereLocation object has the following structure:
```
interface SphereLocation {
	latitude: number,
	longitude: number
}
```
This information will be used for the time of sunrise and sunset.

If no sphereLocation object is given or the latitutde or longitude are missing, location of Crownstone will be used as default.

### Adding a Philips Hue Bridge
To add a bridge to the module there are three ways.
 - By a config format
 - By Ip Address
 - By Bridge Id
 
#### By a config format
In case you already have certain information about the bridge you can create a bridge with that information, to do this, call:

```
await crownstoneHue.addBridge(configFormat:BridgeInitialization);
``` 

The BridgeInitFormat is of format:
```
interface BridgeInitialization {  
  name?: string;  
  username?: string;  
  clientKey?: string;  
  macAddress?: string;  
  ipAddress?: string;  
  bridgeId?: string;  
}
```



Based on the information passed with the format, it will create a bridge.
If any of the keys are missing or undefined, it will use a null on the creation of the object.

The most important parts of the format are the username, bridge id and ip address as the bridge object relies on these and will attempt to find them itself if any or a combination of those are missing.
When there is/are...
 - No username: The bridge's linking procedure will be started and the physical
   link button has to be pressed. If not done, the bridge will throw an error with ``errorCode`` `406`. 
  - No ip address: The bridge's (re)discovery procedure will be started and it tries to find an ip address linked to the bridge id.
  - No bridge id: The bridge has 1 attempt to find the bridge id with the given ip address, in case of failure: the bridge throws an `errorCode` `408`.
  - No bridge id and no ip address, the function will throw `errorCode` `413`, because it cannot initialize without both.
  - The bridge corresponding the bridge id given is already configured,  the function will throw `errorCode` `410`.
  - The bridge corresponding the bridge ip address given is already configured,  the function will throw `errorCode` `411`.

On a successful initialization it returns the Bridge object.

 

### Removing a Philips Hue Bridge
To remove a bridge from the module, call:
```
crownstoneHue.removeBridge(bridgeId);
``` 
This will remove the bridge, its light's and the behaviours of those lights from the module.

### Adding/Removing Philips Hue Lights
#### Adding a light
In order to add a light, call:
```
await crownstoneHue.addLight(data:LightInitFormat);
``` 

`LightInitFormat` is of type 
```
{
	uniqueId: string,
	bridgeId: string,
	id: number,
} 
```
This will retrieve the information of the light from the given bridge and creates and initializes the light object and wraps it together with a behaviour aggregator.
After the light is added to the module, the light will be returned.
When you add a light and there are connection issues, the bridge will retry until its added.

#### Removing a light
In order to remove a light, you call:
```
crownstoneHue.removeLight(lightId);
``` 
The id that is used, is the light's unique id. 

### Adding/Updating/Removing Behaviours
#### Adding/Updating a Behaviour
To add or update a behaviour to the module, call:
```
crownstoneHue.setBehaviour(behaviour:HueBehaviourWrapper);
``` 
See [HueBehaviourWrapper](/src/declarations/behaviourTypes.d.ts) for the format.
 
This function will add/update the behaviour based on the ```cloudId``` and ```lightId ``` variable inside the object. 
Returning a true when done or false when there is no light corresponding the behaviour's light.

#### Removing a Behaviour 
To remove a behaviour from the module, call:
```
crownstoneHue.removeBehaviour(lightId,cloudId);
``` 
This will search for the light on the bridges and then if found, it will try to remove the behaviour from the light based on the ```cloudId```.
 

### Updating user presence
If a user enters or leaves a room or a sphere, call:
```
crownstoneHue.presenceChange(data:PresenceEvent);
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
crownstoneHue.setSphereLocation(sphereLocation:SphereLocation);

```

###  Switching Dumb house mode
To switch dumb house mode on or off, call:
```
crownstoneHue.setDumbHouseMode(on:boolean);
```
On function call, it emits an event call to all BehaviourAggregators with the given value.
When the value is true, behaviours do not manipulate the light's state.

### Stopping the module.
To stop the module, call:
```
crownstoneHue.stop();
```
This will stop all timers and cleanup the eventbus.


### Obtaining Lights and Bridges
There are some extra functions to obtain lights and bridges.

```getAllConnectedLights()```  will return a mapped list as `{[uniqueId: string]: Light}`, `uniqueId` represents the Light's uniqueId.

```getConfiguredBridges()```  will return all bridges that are configured. 
