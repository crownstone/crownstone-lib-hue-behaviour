# Crownstone Hue module
Philips Hue module... text here...

# Work in Progress
Module is still a W.I.P., thus imports aren't correctly specified yet and some parts are prone to change.

## Documentation
The documentation is split up in several parts.

Extra information regarding objects or the functionality of those can be read on their respective pages.  
### Overview 
 - Crownstone Hue
 - Discovery 
 - Bridge
 - Light 
 - Errors
 - Event calls
 - LightBehaviourAggregator
 - Behaviour Aggregator 
 - Behaviour & Twilight Prioritizer 
 - Behavior/Twilight 
 - Persistence 

## Installation

## Import
```import {CrownstoneHue} from {.}```

## Usage
The CrownstoneHue class is the front of the module, this should be used for every operation needed on the module. (See CrownstoneHue for all it's functions)
With the only exceptions as of retrieving information of certain Bridges/Lights, such as if it is reachable or not. This is done by calling their respective get functions.

### Examples
In the following piece of code we give some broad examples of how the module can be used.  
```
... Init ...
const crownstoneHue = new CrownstoneHue({latitude: 51.916064, longitude: 4.472683})
await crownstoneHue.init(); 
... Adding a bridge ...
const bridge = await crownstoneHue.addBridge({
                  name: "Philips Hue Bridge",  
                  username: "Fx2lvBYflb", 
                  clientKey: "Msvh8y4zOc", 
                  macAddress: "FD:83:......", 
                  ipAddress: "xx.xx.xx.xx",
                  bridgeId: "FD83......", 
                  lights: {
                    "AS:FD:52....": 
                      {name: "Color light" , 
                      id: 4,
                      behaviours: []
                      },
                      "GD:F6:51....": 
                      {name: "Dimmable light" , 
                      id: 2, 
                      behaviours: [{
								type: "BEHAVIOUR",
								data:{...},
								activeDays: {...},
								lightId: "GD:F6:51....",
								cloudId:"GNt03PZqyOVb7xkJCC5v"
								}]
                      }
                    }
                  }
                })              
... Some time passes and a new behaviour is made ... 
await crownstoneHue.addBehaviour({
								type: "BEHAVIOUR",
								data:{...},
								activeDays: {...},
								lightId: "AS:FD:52....",
								cloudId:"ygD9z3FyKWqyOVb7xkJCC5v"
								})

... User enters/leaves a room ...
crownstoneHue.presenceChange(...)

... Bridge connection check...
bridge.isReachable();
```

 


