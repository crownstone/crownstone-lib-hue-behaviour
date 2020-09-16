# Hue module
Philips Hue module...

# WORK IN PROGRESS
Currently this is still a work in progress and will be updated regularly.
Behaviours aren't implemented yet.

# Getting started 
## Philips Hue Framework
The framework is a wrapper for the Node-hue-api and handles the calls for the Philips Hue Lights and Bridges.

The overall framework consists of three objects:
- [Framework](#framework) 
- [Bridge](#bridge) 
- [Light](#light) 

### Framework
The framework itself is needed for the basic functions, saving and importing the configuration files which contains the bridges and lights. The framework is also used to help create the bridges.
 
#### Import
```  
import {Framework} from {./framework}
``` 
#### Initialization
This should be the first thing to do before moving further.
The framework is initializated with: 
``` 
const framework = new Framework();
await framework.init();
``` 
Upon initialization it will load the configuration settings from the configuration file.
After loading the configuration file it will gather the Bridges from the settings and returns them as type Bridge[]. 

Note: These bridges aren't initializated yet, for this see [Bridge initialization](#initialization-1) 

#### Discovery
In case a Philips Hue Bridge has to be added you'll be able to call
```  
await framework.discoverBridges();
``` 
This will return a list of uninitializated bridges of type Bridge[], containing a name and an IP Address or an empty list if none is found.

#### Manually adding a bridge to the config
In case you already have all the bridge information you can manually add a bridge to the configuration with:
```
const bridge =  {
                  name: "Philips Hue Bridge",  
                  username: "", 
                  clientKey: "", 
                  macAddress: "FD:83:......", 
                  ipAddress: "xx.xx.xx.xx",
                  bridgeId: "FD83......", 
                  lights: {
                    "AS:FD:52....": 
                      {name: "Color light" , 
                      id: 4 
                      },
                      "GD:F6:51....": 
                      {name: "Dimmable light" , 
                      id: 2 
                      }
                    }
                  }
                }
await framework.addBridgeToConfig(bridge);
``` 
In case the username and clientkey are still unknown, it may be an empty string.
Lights are optional. The lights are of format ```"uniqueId": {name: string, id: number} ```

The function does not return a Bridge, in order to get the Bridge, call ```framework.createBridgeFromConfig(bridgeId)```


#### Creating a Bridge object from the configuration settings
In case you need to create a Bridge object from the configuration settings, for example you just manually added one. You are able to call the following function:
```
framework.createBridgeFromConfig(bridgeId); 
```
This will create an uninitializated bridge object with the information provided from the configuration settings. 
After creation it will add the bridge to a list of connected bridges and returns the Bridge object.  

#### Saving Bridges
This function is used by a Bridge itself on linking or rediscovery.
Yet for any other reason you are also able to save a bridge with:
``` 
await framework.saveBridgeInformation(bridge);
```
Where bridge is a Bridge object.
This will save the bridge and it's lights, afterwards it will call  ```updateConfigFile()```. 
 
To only change it's ip address call
``` 
await framework.updateBridgeIpAddress(bridgeId,ipAddress);
```
This also calls the ```updateConfigFile()```



#### Loading and Updating the configuration file
In order to load the config file into the configuration settings variable, you simply call.
```
await framework.loadConfigSettings();
```
Note: This will be done on init() aswell.

In case you need to update the configuration file you simply call.
```
await framework.updateConfigFile()
```
This will save the current configuration settings into the configuration file.


#### Saving Lights
To save lights you have two options
```
await framework.saveAllLightsFromConnectedBridges();
```
This will save all the lights from the connected bridges and call ```updateConfigFile()``` afterwards.

To save a single individual light, you can call
```
await framework.addLightInfo(bridgeId,Light)
``` 
Then you will only need to call ```updateConfigFile()``` afterwards.
This is so because addLightInfo is mainly used by other functions.

#### Removing Lights
To remove a light from the configuration, you can call 
```
await removeLightFromConfig(bridge,uniqueLightId)
```
This will call ```updateConfigFile()``` afterwards.

#### Getting bridges
To obtain bridges you have two options.
```
getConnectedBridges()
```
This will return Bridge[] from the list of connected bridges.
```
getConfiguredBridges()
```
This will return Bridge[] that originates from the configuration file. 

### Bridge
This object represents a Philips Hue Bridge. In order to use it, you have to initialize it.

#### Import
```  
import {Bridge} from {./bridge}
``` 

#### Initialization
To initialize the Bridge object, call
```
await bridge.init()
```
Upon initialiaztion it will either start the linking proccess or attempt to the connect to the bridge, this depends on wether a username is present or not. 
If a username was already present it attempt will add the lights from the configuration.

Note: If this is the first time the bridge is getting initialized and does not have a username yet, the link button on the Philips Hue Bridge should be pressed else it will throw an error.

###### Linking
On ```init()``` it will call the linking function ```await bridge.link()``` if no username is present.
The Bridge will whitelist itself and save the username and clientkey credentials.
Note:Before this is called the link button on the Philips Hue Bridge should be pressed else it will throw an Error.

###### User creation
During the linking process it will call ```await bridge.createNewUser()```, this is used to whitelist itself on the Philips Hue Bridge and will throw an error when the link button is not pressed. In case of authentication problems such as unauthorized user errors, this also can be used to reauthenticate the object with the Philips Hue Bridge.

###### Connecting
On ```init()``` it will call the connect function ```await bridge.connect()``` if a username is present.
The bridge attempts to connect to the bridge and create a connection Api. 
On failure to connect it will start to rediscover itself.

###### Rediscovery
After a failed connection, the rediscovery of a bridge will take place. This will happen automatically and no external involvement is needed, yet it may throw an error if the bridge is not found or cannot connect after a second attempt.

#### Adding lights
You will be able to configure a light to the bridge by simply calling
```
await bridge.configureLight(id)
``` 

Note that this id is not the uniqueId of the light but the id of the light on the Bridge itself.

There is another way, this will add ALL the lights from the Bridge and this is done by
```
await bridge.populateLights()
```
#### Removing lights
To remove a light from the Bridge object, call 
```
await bridge.removeLight(uniqueId)
```
This will also remove the light from the configuration file.

Note that this will NOT remove the light from the actual Bridge.

#### Obtaining lights
To obtain lights you can call
```
bridge.getLightById(uniqueId)
```
This will return a single Light from the lights list in the Bridge object.

Or you can call
```
await bridge.getAllLightsFromBridge()
```
This will return all the Lights that are present on the Philips Hue Bridge itself as Lights[].


#### Other 

```getInfo()``` - Dumps the bridge's info into an object.


### Light 
A light object that represents a Philips Hue Light and that can be used to keep track of it's state or manipulate the state. 

#### Import
```  
import {Light} from {./light}
``` 

#### Setting states - Manipulating the light.
To manipulate the light in order to change color or something else:
```
await light.setState(state)
```
```state``` is of format ```StateUpdate``` which represents the following structure:
```
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
```

#### Renewing states
To renew the state from current data of the Light on the bridge, you can call ```await light.renewState()```

#### Other
```getState()``` - To get the state.

```getSupportedStates()``` - To get the supported states, as this can vary from Light.

```isReachable()``` - To quickly see if the state is reachable.

```getInfo()``` - Dumps the light's info into an object.


## Examples

### Manipulating lights
```
const framework = new Framework();
const bridges = await framework.init();

await bridges[0].init()
const light = bridges[0].getLightById(1);

await light.setState({on: true, bri: 200});
```

