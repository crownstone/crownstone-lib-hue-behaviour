# Crownstone Hue module
# Work in Progress
Module is still a W.I.P., thus imports aren't correctly specified yet and some parts are prone to change.

## Documentation
### Overview 
 - [Crownstone Hue](/documentation/CrownstoneHue.md)
 - [Discovery](/documentation/Discovery.md)
 - [Bridge](/documentation/Bridge.md)
 - [Light](/documentation/Light.md)
 - [Errors](/documentation/Errors.md)
 - [Event calls](/documentation/EventCalls.md) 
 - [LightBehaviourWrapper](/documentation/LightBehaviourWrapper.md)
 - [Behaviour Aggregator](/documentation/BehaviourAggregator.md)
 - [SwitchBehaviour- & Twilight Prioritizer](/documentation/Prioritizer.md)
 - [Behaviours](/documentation/Behaviours.md)

### Installation

### Import
```import {CrownstoneHue} from {.}```

### Usage
The CrownstoneHue class is the front of the module, this should be used for every operation needed on the module. (See [CrownstoneHue](/documentation/CrownstoneHue.md) for all it's functions)
With the only exceptions as of retrieving information of certain Bridges/Lights, this can done by calling their respective get functions.

#### Examples
In the following piece of code we give some broad examples of how the module can be used.  
```
... Init ...
const crownstoneHue = new CrownstoneHue({latitude: 51.916064, longitude: 4.472683})
await crownstoneHue.init([{
                  name: "Philips Hue Bridge",  
                  username: "Fx2lvBYflb", 
                  clientKey: "Msvh8y4zOc", 
                  macAddress: "FD:83:......", 
                  ipAddress: "xx.xx.xx.xx",
                  bridgeId: "FD83......", 
                  lights: [ 
                      {uniqueId: "AS:FD:52...." , 
                      id: 4,
                      behaviours: []
                      }, 
                      {uniqueId: "GD:F6:51...." , 
                      id: 2, 
                      behaviours: [{
				    type: "BEHAVIOUR",
				    data:{...},
				    activeDays: {...},
				    lightId: "GD:F6:51....",
				    cloudId:"GNt03PZqyOVb7xkJCC5v"
				    }]
                      }
		    ]
		  }
		])

..or..
await crownstoneHue.init(); 
... Adding a bridge ...
const bridge = await crownstoneHue.addBridge([{
                  name: "Philips Hue Bridge",  
                  username: "Fx2lvBYflb", 
                  clientKey: "Msvh8y4zOc", 
                  macAddress: "FD:83:......", 
                  ipAddress: "xx.xx.xx.xx",
                  bridgeId: "FD83......", 
                  lights: [ 
                      {uniqueId: "AS:FD:52...." , 
                      id: 4,
                      behaviours: []
                      }, 
                      {uniqueId: "GD:F6:51...." , 
                      id: 2, 
                      behaviours: [{
				    type: "BEHAVIOUR",
				    data:{...},
				    activeDays: {...},
				    lightId: "GD:F6:51....",
				    cloudId:"GNt03PZqyOVb7xkJCC5v"
				    }]
                      }
		    ]
		  }
		])              
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

 


