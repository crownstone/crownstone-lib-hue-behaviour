# Hue module
Philips Hue module...

# WORK IN PROGRESS
Currently this is still a work in progress and will be updated regularly.

# Getting started 
## Philips Hue Framework
The framework is a wrapper for the Node-hue-api and handles the calls for the Philips Hue Lights and Bridges.

The overall framework consists of three objects:
- Framework
- Bridges
- Lights

### Framework
The framework itself is needed for the basic functions such as saving and importing the configuration files which contains the bridges and lights.
#### Import
```  
import {Framework} from {./framework}
``` 
#### Initialization
This should be the first thing to do before moving further.
The framework is initializated with. 
``` 
const framework = new Framework();
await framework.init();
``` 
Upon initialization it will load the configuration settings from the configuration file.
After loading the configuration file it will gather the Bridges from the settings and return them as Bridge objects in an array. 
Note: These bridges aren't initializated yet, for this see [Bridge initialization]()

#### Discovery
In case a Philips Hue Bridge has to be added you'll be able to call
```  
await framework.discoverBridges();
``` 
This will return a list of uninitializated bridges, containing a name and an IP Address.
#### Manually adding a bridge to the config
In case you already have all the bridge information you can manually add a bridge to the configuration with
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
                      }
                    }
                  }
                }
await framework.addBridgeToConfig(bridge);
```
In case the username and clientkey are still unknown, it may be an empty string.
Lights are optional. The lights are of format ```"unqiueId": {name: string, id: number} ```

The function does not return a Bridge, in order to get the Bridge call [createBridgeFromConfig(bridgeId)]()


#### Creating a Bridge object from the configuration
In case you need to create a Bridge from the configuration, for instance after just added one. You are able to call the following function:
```framework.createBridgeFromConfig(bridgeId); ```
This will create an uninitializated bridge object with the information provided from the configuration settings. 
After creation it will add bridge to the ```connectedBridges``` list and return the object it.

#### Saving Bridges
Normally you do not need function, because a Bridge saves itself on linking or rediscovery.
Yet for any other reason you will be able to save a bridge with:
``` await framework.saveBridgeInformation(bridge);```
Where bridge is a Bridge object.
This calls the updateConfigFile() function afterwards.

To only change it's ip address call
``` await framework.updateBridgeIpAddress(bridgeId,ipAddress);```
This also calls the updateConfigFile();



#### Loading and Updating the config file
In order to load the config file into the configSettings variable, you simply call.
```await framework.loadConfigSettings();```
Note: This will be done on init() aswell.

In case you need to update the configuration file you simply call.
```await framework.updateConfigFile()```
This will add the current configuration settings into the configuration file.


#### Saving Lights

#### Removing Lights

#### Getting bridges

### Bridge
TODO

#### Import

#### Initialization

##### Linking

##### Connecting

##### Rediscovery

#### Add lights

#### Remove lights

### Light
TODO

#### Setting states

#### Renewing states
