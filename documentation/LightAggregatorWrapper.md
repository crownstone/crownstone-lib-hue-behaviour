
# Documentation - LightAggregatorWrapper
## Overview
 - Crownstone Hue  
 - Discovery
 - Bridge
 - Light 
 - **LightAggregatorWrapper**
	 - Constructing
	 - Initialization
	 - Cleanup
 - Behaviour Aggregator 
 - Behaviour & Twilight Prioritizer 
 - Behavior/Twilight 
 - Persistence 
 - Event calls
 - Errors

## About
This is just a wrapper used to connect a Behaviour Aggregator with a Light object.

## Usage
### Import
```import {Discovery} from {.}```
### Constructing
`new LightAggregatorWrapper(light:Light)`
On constructing it creates a BehaviourAggregator with a callback for the light's setState function.

### Initialization
To initialize the object, call:
`lightAggregatorWrapper.init()`
This initializes the BehaviourAggregator and the Light object and sets the state change callback of the light object.

### Cleanup
To cleanup, call:
`lightAggregatorWrapper.cleanup()`
This calls `behaviourAgggregator.cleanup()` and `light.cleanup()`.
