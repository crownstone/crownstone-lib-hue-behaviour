# Documentation - Behaviours

## Overview

- [Crownstone Hue](/documentation/CrownstoneHue.md)
- [Discovery](/documentation/Discovery.md)
- [Bridge](/documentation/Bridge.md)
- [Light](/documentation/Light.md)
- [Errors](/documentation/Errors.md)
- [Event calls](/documentation/EventCalls.md)
- [Persistence](/documentation/Persistence.md)
- [LightAggregatorWrapper](/documentation/LightAggregatorWrapper.md)
- [Behaviour Aggregator](/documentation/BehaviourAggregator.md)
- [SwitchBehaviour- & Twilight Prioritizer](/documentation/Prioritizer.md)
- **Behaviours**
  - [Constructing](#constructing)
  - [Tick](#tick)
  - [Presence Change](#presence-change)
  - [Checking if the behaviour is active](#checking-if-the-behaviour-is-active)
  - [Getting The composed state](#getting-the-composed-state)
  - [Cleanup](#cleanup) 

## About

Behaviours are a fundamental part of the module, these contain the set of behaviour rules for light to determine when to activate and how to act. Each behaviour is independent and is separated as `Twilight` and `SwitchBehaviour`, representing their type. A behaviour's active state is based on a check. This check is done by comparing the current data with the data of the behaviour rules.

## Usage

### Import

`import {Twilight} from {.}`  

`import {SwitchBehaviour} from {.}`

### Constructing

`const twilight = new Twilight(behaviour: HueBehaviourWrapperTwilight, sphereLocation: SphereLocation)`

`const switchBehaviour = new SwitchBehaviour(behaviour: HueBehaviourWrapperBehaviour, sphereLocation: SphereLocation)`

Format data about `HueBehaviourWrapperBehaviour` and `HueBehaviourWrapperTwilight` can be found at [behaviourTypes.d.ts](/src/declarations/behaviourTypes.d.ts). These are the set of rules that defines whether the behaviour should be active and what it should do.

### Tick

The behaviour will check whether or not it has to be active by calling:

`*.tick(timestamp:number)`

In the module, this is done by the prioritizers.

### Presence Change

This is only supported on a SwitchBehaviour object, in case a user enters/leaves a sphere/location, the presence event data can be passed by calling:

`switchBehaviour.onPresenceDetect(presenceEvent: PresenceEvent)`

Only behaviours that have a behaviour ruleset that includes location or sphere presence will act on this.

In the module, a presence is passed with an `ON_PRESENCE_CHANGE` event call.

### Checking if the behaviour is active

A Behaviour uses a variable boolean to show that itself is active.

Use `*.isActive` to check whether or not the behaviour is active.

### Getting the composed state

To get the composed state based on the behaviour rules and active state, call:

`*.getComposedState()`

### Cleanup

Only needed for a SwitchBehaviour as it cleans up the eventbus subscription, to do this call:

`switchBehaviour.cleanup()`