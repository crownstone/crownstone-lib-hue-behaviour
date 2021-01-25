# Documentation - Prioritizers
## Overview
 - [Crownstone Hue Behaviour](/documentation/CrownstoneHueBehaviour.md)
 - [Device compatibility](/documentation/DeviceSupport.md)
 - [Errors](/documentation/Errors.md)
 - [Event calls](/documentation/EventCalls.md)
 - [Persistence](/documentation/Persistence.md)
 - [DeviceAggregatorWrapper](/documentation/DeviceBehaviourWrapper.md)
 - [Behaviour Aggregator](/documentation/BehaviourAggregator.md)
 - **SwitchBehaviour- & Twilight Prioritizer**
   - [Constructing](#constructing)
   - [Adding/Updating/Removing behaviours](#addingupdatingremoving-behaviours)
   - [Prioritizing](#prioritizing)
   - [Cleanup](#cleanup)
   - [Getting the prioritized behaviour](#getting-the-prioritized-behaviour)
   - [Getting the composed state](#getting-the-composed-state)
 - [Behaviours](/documentation/Behaviours.md)

## About
The SwitchBehaviourPrioritizer and TwilightPrioritizer is the part of the module that prioritizes their respective behaviours according to a set of rules to determine which should be activated/prioritized and which not. It does this every time  `tick(timestamp: number)` is called.

## Usage
The following is only for documentation purposes, with normal usage everything is handled by the module.
### Constructing
`const switchBehaviourPrioritizer = new SwitchBehaviourPrioritizer()`

`const twilightPrioritizer = new TwilightPrioritizer()`

### Adding/Updating/Removing behaviours
To add, update or remove a twilight or behaviour, use one of the following functions:

`setBehaviour(behaviour: HueBehaviourWrapper, sphereLocation: SphereLocation): number` - This updates or creates a new behaviour and returns the behaviour's index position in the array.

`removeBehaviour(cloudId: string): void` 

### Prioritizing
To prioritize the behaviours, call:

`*.tick(timestamp: number)`

This will update all of its behaviours with the timestamp and when one or more are active, it prioritizes them to get the best behaviour according to a set of rules.
   
### Cleanup
Only a SwitchBehaviourPrioritizer has to be cleaned up before stopping to use it, call:

`switchBehaviourPrioritizer.cleanup()`

This will send a cleanup call to its behaviours.

### Getting the prioritized behaviour
The prioritized behaviour is accessible as variable `prioritizedBehaviour`, this either returns a SwitchBehaviour if it is a SwitchBehaviourAggregator, a Twilight if it's a TwilightAggregator or undefined when there are no active behaviours. 

### Getting the composed state
To get the composed state, call:

`*.getComposedState()`

This returns the supposed composed state as a `BehaviourState`.