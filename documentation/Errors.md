# Documentation - Errors

## Overview

- [Crownstone Hue Behaviour](/documentation/CrownstoneHueBehaviour.md)
- [Device compatibility](/documentation/DeviceSupport.md) 
- **Errors**
- [Event calls](/documentation/EventCalls.md) 
- [DeviceAggregatorWrapper](/documentation/DeviceBehaviourWrapper.md)
- [Behaviour Aggregator](/documentation/BehaviourAggregator.md)
- [SwitchBehaviour- & Twilight Prioritizer](/documentation/Prioritizer.md)
- [Behaviours](/documentation/Behaviours.md)

## About

In case of something happened the module can throw an error, these errors are defined in [CrownstoneHueError.ts](/src/util/CrownstoneHueError.ts) as well as a copy below.

## Errors

The errors are of type CrownstoneHueError and have a `code`, `message` and an optional `description`.
See below for the codes with some extra description for possible reasons.

### Codes
- 433: "Device does not support given behaviour."
- 500: "Device id already in use"
- 999: "Unknown Error, see description." - This one will most likely be thrown if an error from the external library is not specifically converted and/or something unexpected happened.
