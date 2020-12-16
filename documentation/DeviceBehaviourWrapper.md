
# Documentation - DeviceAggregatorWrapper
## Overview
 - [Crownstone Hue Behaviour](/documentation/CrownstoneHueBehaviour.md)
 - [Device compatibility](/documentation/DeviceSupport.md)
 - [Errors](/documentation/Errors.md)
 - [Event calls](/documentation/EventCalls.md) 
 - **DeviceBehaviourWrapper**
	 - [Constructing](#constructing)
	 - [Initialization](#initialization)
	 - [Cleanup](#cleanup)
 - [Behaviour Aggregator](/documentation/BehaviourAggregator.md)
 - [SwitchBehaviour- & Twilight Prioritizer](/documentation/Prioritizer.md)
 - [Behaviours](/documentation/Behaviours.md)


## About
This is just a wrapper used to connect a Behaviour Aggregator with an object that implemented `DeviceBehaviourSupport`.
See [Device compatibility](/documentation/DeviceSupport.md) for information about device support.

## Usage
The following is only for documentation purposes, with normal usage everything is handled by the module.
### Constructing
`const deviceBehaviourWrapper = new DeviceBehaviourSupport(device:DeviceBehaviourSupport)`

On constructing it creates a BehaviourAggregator with a callback for the device's receiveStateUpdate function.

### Initialization
To initialize the object, call:

`deviceBehaviourWrapper.init()`

This initializes the BehaviourAggregator sets the state change callback of the device object.

### Cleanup
To cleanup, call:

`deviceBehaviourWrapper.cleanup()`

This calls `behaviourAgggregator.cleanup()`.
