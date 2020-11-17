
# Documentation - LightAggregatorWrapper
## Overview
 - [Crownstone Hue](/documentation/CrownstoneHue.md)
 - [Discovery](/documentation/Discovery.md)
 - [Bridge](/documentation/Bridge.md)
 - [Light](/documentation/Light.md)
 - [Errors](/documentation/Errors.md)
 - [Event calls](/documentation/EventCalls.md) 
 - **LightBehaviourWrapper**
	 - [Constructing](#constructing)
	 - [Initialization](#initialization)
	 - [Cleanup](#cleanup)
 - [Behaviour Aggregator](/documentation/BehaviourAggregator.md)
 - [SwitchBehaviour- & Twilight Prioritizer](/documentation/Prioritizer.md)
 - [Behaviours](/documentation/Behaviours.md)

## About
This is just a wrapper used to connect a Behaviour Aggregator with a Light object.

## Usage
### Import
```import {Discovery} from {.}```
### Constructing
`new LightBehaviourWrapper(light:Light)`

On constructing it creates a BehaviourAggregator with a callback for the light's setState function.

### Initialization
To initialize the object, call:

`LightBehaviourWrapper.init()`

This initializes the BehaviourAggregator and the Light object and sets the state change callback of the light object.

### Cleanup
To cleanup, call:

`LightBehaviourWrapper.cleanup()`

This calls `behaviourAgggregator.cleanup()` and `light.cleanup()`.
