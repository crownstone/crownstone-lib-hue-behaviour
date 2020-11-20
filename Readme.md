# Crownstone Hue module
This is the behaviour part of the Crownstone Hue module, it will handle all the behaviour related calls. Currently, the module is semi-independent from the Hue side as it still needs the light objects to send and receive light state info.
# Work in Progress
Module is still a W.I.P., thus imports aren't correctly specified yet and some parts are prone to change.

## Documentation
### Overview 
 - [Crownstone Hue Behaviour](/documentation/CrownstoneHueBehaviour.md) 
 - [Errors](/documentation/Errors.md)
 - [Event calls](/documentation/EventCalls.md) 
 - [LightBehaviourWrapper](/documentation/LightBehaviourWrapper.md)
 - [Behaviour Aggregator](/documentation/BehaviourAggregator.md)
 - [SwitchBehaviour- & Twilight Prioritizer](/documentation/Prioritizer.md)
 - [Behaviours](/documentation/Behaviours.md)

### Installation

### Import
```import {CrownstoneHueBehaviour} from {crownstone-lib-hue-behaviour}```

### Usage
#### Dependancy
CrownstoneHueBehaviour is currently dependent on a Light from the CrownstoneHue module. 

#### Getting Started 
Note that you should have the CrownstoneHue module set-up, as it will need its lights to work. See its documentation here...(todo link)

To get started with the module, construct the CrownstoneHueBehaviour class. This can be done as followed:
```
const crownstoneHueBehaviour = new CrownstoneHueBehaviour({latitude: 51.916064, longitude: 4.472683})  
..or..
const crownstoneHueBehaviour = new CrownstoneHueBehaviour()  
```
With no location data given, it defaults to Crownstone's office location.

Next up is to add lights to the system, this can be done by calling:
```
await crownstoneHueBehaviour.addLight(light:Light)
```
As of writing, the system only supports light objects from the CrownstoneHue module.

Next in line is adding a behaviour to the system, this is done by calling:
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
The lightId should be the uniqueId of the light you'd like to add.

Repeat the above adding operation if a light has multiple behaviours.


When a behaviour is added, the behaviour and light are linked with each other and it is ready to send data to- and receive data from the light.

For more information, see [CrownstoneHueBehaviour](/documentation/CrownstoneHueBehaviour.md)

#### Passing data
The module has a few functions you can call for passing data.

##### presenceChange(presenceEvent:PresenceEvent):void

#### setSphereLocation(sphereLocation:SphereLocation):void

#### setDumbHouseMode(on:boolean):void


 


