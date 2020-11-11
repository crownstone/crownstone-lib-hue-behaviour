# Documentation - Behaviour Aggregator
## Overview
 - Crownstone Hue  
 - Discovery
 - Bridge
 - Light 
 - LightAggregatorWrapper
 - **Behaviour Aggregator** 
 - Behaviour & Twilight Prioritizer 
 - Behavior/Twilight 
 - Persistence 
 - Event calls
 - Errors

## About
The behaviour aggregator is the part of the module that sends the new state to the light through a callback when a new behaviour activates, it also handles the overrides and conflicts between a prioritized behaviour and a prioritized twilight.

When initialized, every 500ms a timestamp is sent to its `twilightPrioritizer` and `switchBehaviourPrioritizer`, a call is made to the behaviour handler and when dumbhouse mode is activated, an override handler is being called.
The behaviour handler chooses the aggregated behaviour between a twilight and switchbehaviour and updates the lightstate based on a set of rules.

When it receives a lightstate change calls, it checks for overrides.
  
## Usage
Everything is handled by the module itself, though its public functionalities are defined below.
### Constructing
`const behaviourAggregator = new BehaviourAggergator(callback, state)`
`callback` is used to pass the new state when a behaviour activates.
`State` is the current state of the light on initialization.
**Example:**
`new BehaviourAggregator(async (value:StateUpdate)=>{ await light.setState(value)},light.getState())`

### Initialization
To initialize the aggregator, call:
`behaviourAggregator.init()`
This will start an interval that calls every 500ms a loop function.
The rate is defined as `AGGREGATOR_POLLING_RATE` and exists in BehaviourAggregatorUtil.ts[to do link]
 
### On Light state change
When a light state has changed and it has to be passed to the aggregator, call:
`await behaviourAggregator.lightStateChanged(state: HueFullState)`

In the module this is used as the lightstate changed callback for the Light object.

### Dumb house mode
The dumb house mode is switched on or off by event call `ON_DUMB_HOUSE_MODE_SWITCH`.
When activated, behaviours won't send a new state to the light when activating.
 
### Cleanup
To clean up the behaviourAggregator, call:
`behaviourAggrgator.cleanup()`
This removes the subscription from the event bus, stops the interval and calls the cleanup function of `switchBehaviourAggregator`

### Adding/Updating/Removing behaviours.
The BehaviourAggregator do not keep track of the behaviours and twilight itself, but pass them to their respective prioritizers.
This is done by using one of the following functions:
`addBehaviour(behaviour: HueBehaviourWrapper, sphereLocation: SphereLocation): number` - This returns the behaviour's index position in the array.
`removeBehaviour(cloudId: string): void`
`updateBehaviour(behaviour: HueBehaviourWrapper): void`

### Getting the composed state
To get the composed state, call:
`behaviourAggregator.getComposedState()`
This will return the state of what the aggregator thinks the light state has to be according to the behaviour rules, ignoring overrides.
