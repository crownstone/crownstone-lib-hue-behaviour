# Documentation - Crownstone Hue

## Overview

- **Crownstone Hue**  
   - Initialization 
   - Adding a Philips Hue Bridge 
   - Removing a Philips Hue Bridge 
   - Adding/Removing Philips Hue Lights 
   		- Adding a light 
   		- Removing a light 
   - Adding/Updating/Removing Behaviours 
   		- Adding a Behaviour 
   		- Updating a Behaviour 
   		- Removing a Behaviour 
   - Updating user presence 
   - Switching Dumb house mode 
   - Obtaining Lights and Bridges
- Discovery
- Bridge
- Light
- LightBehaviourAggregator
- Behaviour Aggregator
- Behaviour & Twilight Prioritizer
- Behavior/Twilight
- Persistence
- Event calls
- Errors

## Introduction

The Crownstone Hue class is the entry point into the module. It will handle all passed data from outside through it's defined functions and calls the persistence functions when needed.

## Usage

### Initialization

This should be the first thing to do before using the module.
The module is initializated with:

```
const crownstoneHue = new CrownstoneHue();
await crownstoneHue.init(sphereLocation:SphereLocation);
```

A SphereLocation object has the following structure:

```
interface SphereLocation {
	latitude: number,
	longitude: number
}
```

This information will be used for the time of sunrise and sunset.

Upon initialization the module will load the configuration settings from the configuration file.
After the configuration file is loaded, it will attempt to create Bridges with the given information from the configuration file.
When the Bridges are reachable and successfully configured, the lights will be configured and initialized.
Afterwards it will a light and a behaviour aggregator together and add the light's behaviours to the aggregator.
After everything is done succesfull, it will return a list of connected Bridges and the module is ready to use.

### Adding a Philips Hue Bridge

To add a bridge to the module there are three ways.

- By a config format
- By Ip Address
- By Bridge Id

#### By a config format

In case you already have certain information of the bridge you can create a bridge with that information, in order to do this, call:

```
await crownstoneHue.addBridge(configFormat);
```

The format is as follows:

```
interface BridgeFormat {
  name: string;
  username: string;
  clientKey: string;
  macAddress: string;
  ipAddress: string;
  bridgeId: string;
  lights?: [uniqueId:string]: {
	  name: string;
	  id: number;
	  behaviours: HueBehaviourWrapper[];
	};
}
```

Based on the information passed with the format, it will create a bridge.
If any of the keys are missing or undefined, it will pass an empty string on creation of the object.

The most important parts of the format is the username, bridgeId and ip address as the bridge object relies on these and will attempt to find them itself if any or a combination of those are missing.
When there is/are...

- No username: The bridge's linking procedure will be started and the physical
  link button has to be pressed or it will throw an error.
- No ip address: The bridge's (re)discovery procedure will be started and it tries to find an ip address linked to the bridge id.
- No bridge id: The bridge has 1 attempt to find the bridge id with the given ip address, in case of failure it throws an error.
- No bridge id and no ip address: The function will returns an uninitialized bridge object because the object cannot function without those.

On a successfull initialization, it then adds the lights and wraps them with their behaviours if they are defined.
Afterwards it will return the Bridge object.

#### By Ip address

In order to add a Bridge to the module by Ip address, call:

```
await crownstoneHue.addBridgeByIpAddress(ipAddress);
```

The given ip address should be of type string and only IPv4 is supported.

After calling the function, it will create a Bridge object with only an IP address defined and initiliazes it. This will make the bridge object try to connect to the Philips Hue Bridge and attempt to create an user. Note that the link button on the physical bridge has to be pressed to make this work.

On success, it will fill update itself with all needed information and return the bridge object.
On failure, it throws an error when link button isn't pressed or when IP Address is wrong as it cannot discover itself without a BridgeId.

#### By Bridge Id

In order to add a Bridge to the module by Bridge Id, call:

```
await crownstoneHue.addBridgeByBridgeId(bridgeId);
```

This will attempt to find the Philips Hue Bridge in the network through a discovery call.
Upon a successfull discovery call it will create a bridge object with a IP address and bridge id filled in and initiliazes it.
The bridge object then tries to connect to the Philips Hue Bridge and attempts to create an user. Note that the link button on the physical bridge has to be pressed to make this work.

On success, it will fill update itself with all needed information and return the bridge object.
On failure, It will throw an error when no Bridge is found in the network or when the link button isn't pressed.

### Removing a Philips Hue Bridge

In order to remove a bridge from the module, call:

```
await crownstoneHue.removeBridge(bridgeId);
```

This will remove the bridge, its light's and the behaviours of those lights from the module.
After the bridge is removed, the configuration file will be updated.

### Adding/Removing Philips Hue Lights

#### Adding a light

In order to add a light, call:

```
await crownstoneHue.addLight(bridgeId,idOnBridge);
```

The id that is used, is the light id on the bridge itself and not the light's unique id.
This will retrieve the information of the light from the given bridge and creates and initializes the light object and wraps it together with a behaviour aggregator.
After the light is added to the module, the configuration file will be updated and a LightBehaviourAggregator object containing the light and the aggregator will be returned.

#### Removing a light

In order to remove a light, you call:

```
await crownstoneHue.removeLight(lightId);
```

The id that is used, is the light's unique id.
After the light is removed, the configuration file will be updated.

### Adding/Updating/Removing Behaviours

#### Adding a Behaviour

In order to add a behaviour to the module, call:

```
await crownstoneHue.addBehaviour(behaviour:HueBehaviourWrapper);
```

See HueBehaviourWrapper for the format.

This function will add the behaviour to the light that is defined in the `lightId` variable inside the given object.
Afterwards it saves the configuration file.

#### Updating a Behaviour

In order to update a behaviour to the module, call:

```
await crownstoneHue.addBehaviour(behaviour:HueBehaviourWrapper);
```

See HueBehaviourWrapper for the format.

This function will update the behaviour based on the `cloudId` and `lightId` variable inside the object.
Afterwards it saves the configuration file.

#### Removing a Behaviour

In order to remove a behaviour from the module, call:

```
await crownstoneHue.removeBehaviour(lightId,cloudId);
```

This will search for the light on the bridges and then if found, it will try to remove the behaviour from the light based on the `cloudId`.

Afterwards it updates the configuration file.

### Updating user presence

If a user enters or leaves a room or a sphere, call:

```
crownstoneHue.presenceChange(data:PresenceEvent);
```

This will send an event call with the presence event data to all the behaviours
The format for the PresenceEvent is build with the following interfaces:

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

An event for user with id 0 entering a sphere is as follows:

```
{
	type:"ENTER",
	data: {
		type:"SPHERE",
		profileIdx: 0
		}
}
```

An event for user with id 1 leaving location with id 4 is as follows:

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

### Switching Dumb house mode

To switch dumb house mode on or off, call:

```
crownstoneHue.setDumbHouseMode(on:boolean);
```

On function call, it emits an event call to all BehaviourAggregators with the given value.
When value is true, behaviours do not manipulate the light's state.

### Stopping the module.

In order to stop the module, call:

```
await crownstoneHue.stop();
```

This will stop all timers and cleanup the eventbus.

### Obtaining Lights and Bridges

There are some extra functions to obtain lights and bridges.
`getAllWrappedLights()` will return a list of LightAggregatorWrapper objects.
`getAllConnectedLights()` will return only all Lights as Light objects.
`getConfiguredBridges()()` will return all bridges that are configured.
