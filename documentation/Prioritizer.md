# Documentation - Prioritizers
## Overview
 - Crownstone Hue  
 - Discovery
 - Bridge
 - Light 
 - LightAggregatorWrapper
 - Behaviour Aggregator
 - **Behaviour & Twilight Prioritizer** 
 - Behavior/Twilight 
 - Persistence 
 - Event calls
 - Errors

## About
The SwitchBehaviourPrioritizer and TwilightPrioritizer is the part of the module that prioritizes their respective behaviours according to a set of rules to determine which should be activated/prioritized and which not. It does this every time  `tick(timestamp: number)` is called.

## Usage
Everything is handled by the module itself, though its public functionalities are defined below.
### Constructing
`const switchBehaviourPrioritizer = new SwitchBehaviourPrioritizer()`
`const twilightPrioritizer = new TwilightPrioritizer()`

### Adding/Updating/Removing behaviours.
To add, update or remove a twilight or behaviour, use one of the following functions:
`addBehaviour(behaviour: HueBehaviourWrapper, sphereLocation: SphereLocation): number` - This returns the behaviour's index position in the array.
`removeBehaviour(cloudId: string): void`
`updateBehaviour(behaviour: HueBehaviourWrapper): void`

### Prioritizing
To prioritize the behaviours, call
`*.tick(timestamp: number)`
This will update all of it's behaviours with the timestamp and when one or more are active, it prioritizes them to get the best behaviour according to a set of rules.
   
### Cleanup
Only a SwitchBehaviourPrioritzer has to be cleaned up before stopping to use it, call
`switchBehaviourPrioritizer.cleanup()`
This will send a cleanup call to its behaviours.

### Getting the prioritized behaviour
The prioritized behaviour is accessable as variable `prioritizedBehaviour`, this either returns a SwitchBehaviour if its a SwitchBehaviourAggregator, a Twilight if its a TwilightAggregator or undefined when there are no active behaviours. 

### Getting the composed state
To get the composed state, call:
`*.getComposedState()`
This will return the state of the prioritized behaviour as type `HueLightState`.
