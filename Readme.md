# crownstone-lib-hue-behaviour
This module handles all parts related for activation of a behaviour and supports any device that follows the compatibility guidelines.
## Documentation
### Overview 
 - [Crownstone Hue Behaviour](/documentation/CrownstoneHueBehaviour.md)  
 - [Device compatibility](/documentation/DeviceSupport.md)
 - [Errors](/documentation/Errors.md)
 - [Event calls](/documentation/EventCalls.md) 
 - [DeviceAggregatorWrapper](/documentation/DeviceBehaviourWrapper.md)
 - [Behaviour Aggregator](/documentation/BehaviourAggregator.md)
 - [SwitchBehaviour- & Twilight Prioritizer](/documentation/Prioritizer.md)
 - [Behaviours](/documentation/Behaviours.md)


### Installation

### Import
```import {CrownstoneHueBehaviour} from {crownstone-lib-hue-behaviour}```

### Usage
#### Getting Started 
To get started with the module, construct the CrownstoneHueBehaviour class. This can be done as followed:
```
const crownstoneHueBehaviour = new CrownstoneHueBehaviour({latitude: 51.916064, longitude: 4.472683})  
..or..
const crownstoneHueBehaviour = new CrownstoneHueBehaviour()  
```
With no location data given, it defaults to Crownstone's office location.

Next up is to add a compatible device to the system, this can be done by calling:
```
crownstoneHueBehaviour.addDevice(device:DeviceBehaviourSupport)
``` 
When a device is added, an aggregator will be wrapped with the device and, the aggregator is ready to send data to- and receive data from the device.


The only thing that remains is adding a behaviour to the system, this is done by calling:
```crownstoneHueBehaviour.setBehaviour(deviceId:string,behaviour:HueBehaviourWrapper)```
The deviceId should be the uniqueId of the device you'd like to add.

Example:
```
crownstoneHueBehaviour.setBehaviour("AS:FD:52....",{
				  "type": "BEHAVIOUR",
                    "data": {
                      "action": {"type": "BE_COLOR", "data": {
                                "type": "COLOR"    
                                "brightness": 100,
                                "hue": 241,
                                "saturation": 50
                                }
                      },
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
				  cloudId:"ygD9z3FyKWqyOVb7xkJCC5v"
				  })
```

Repeat the above adding operation if a device has multiple behaviours.

After a behaviour is added, the system is ready and will act based on time and data given.

For more information, see [CrownstoneHueBehaviour](/documentation/CrownstoneHueBehaviour.md) and see [Device compatibility](/documentation/DeviceSupport.md) on which data to expect and on how to make a device compatible.


#### Passing data
The module has a few functions you can call for passing data.

##### presenceChange(presenceEvent:PresenceEvent):void

#### setSphereLocation(sphereLocation:SphereLocation):void

#### setDumbHouseMode(on:boolean):void


 


