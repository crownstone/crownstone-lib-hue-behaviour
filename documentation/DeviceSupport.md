
# Documentation - Device compatibility
## Overview
 - [Crownstone Hue Behaviour](/documentation/CrownstoneHueBehaviour.md) 
 - **Device compatibility**
 - [Errors](/documentation/Errors.md)
 - [Event calls](/documentation/EventCalls.md)
 - [DeviceAggregatorWrapper](/documentation/DeviceBehaviourWrapper.md)
 - [Behaviour Aggregator](/documentation/BehaviourAggregator.md)
 - [SwitchBehaviour- & Twilight Prioritizer](/documentation/Prioritizer.md)
 - [Behaviours](/documentation/Behaviours.md)

## About
This section is here to inform on how to make a device compatible with the library. Based on this information, you should be able to convert data to your format if needed.
### Mandatory functions 
The aggregator needs several functions of a device for information passing and receiving, these are as followed:
#### `getUniqueId():string`
Returns uniqueId of a device. This uniqueId will be used by a behaviour for identification, make sure there is no overlap with other devices. 

#### `getState():DeviceState`
Should return the device's current state. This is used for initialization of a behaviour aggregator.
See the subsection Device State under each Device type for all the formats.

#### `receiveStateUpdate(state:StateUpdate):void`
This will function as an interface for passing state updates to your device, see the subsection Receiving Updates under each device type for all the expected data types.

#### `setStateUpdateCallback(callback:((state:StateUpdate) => void)):void`

Used for setting a callback for state updates by the device. This is the interface to the behaviour aggregator for state updates.

### Device types
There are 4 device types defined: `SWITCHABLE`, `DIMMABLE`, `COLORABLE` and `COLORABLE_TEMPERATURE`.`
These types define what kind of device it is and helps the behaviour aggregator know which type of state updates can be send/received and which not. 
There are two states formats, one for sending and receiving state updates and one for sending the full (initial) of the device.

### Switch devices
A switch device is a device that can only turn on/off. These are devices of type `SWITCHABLE` and support the following states:
#### Receiving Updates
The behaviour aggregator will send out state updates of the following format:
```
{
    type: "SWITCH",
    value: boolean
}
```
#### Sending Update
The behaviour aggregator is able to receive state updates of the following format:
```
{
    type: "SWITCH",
    value: boolean
}
```
#### Device State
```
{
    type: "SWITCHABLE",
    on: boolean
}
```

### Dimming devices
a Dimming device is a device that can dim or interact based on the value it receives, a light is used as point of reference. These are devices of type `DIMMABLE` and support the following states:

#### Receiving Updates
The behaviour aggregator will send out state updates of the following format:
```
{
    type: "DIMMING",
    value: number
}
```
`value` is a value between `0` and `100` and represents the value in percentages, 0 equals off.
#### Sending Update
The behaviour aggregator is able to receive state updates of the following format:

**Switch:**
```
{
    type: "SWITCH",
    value: boolean
}
```
**Dimming:**
```
{
    type: "DIMMING",
    value: number
}
```
`value` is a value between `0` and `100` and represents the value in percentage, 0 equals off.
#### Device State
```
{
    type: "DIMMABLE",
    on: boolean,
    brightness: number 
}
```
`brightness` is a value between `1` and `100` and represents the brightness in percentages.

### Color devices
a Color device is a device that can react on color based values, like lights. These are devices of type `COLORABLE` and support the following states:
#### Receiving Updates
The behaviour aggregator will send out state updates of the following formats:

**Dimming:**
```
{
    type: "DIMMING",
    value: number
}
```
`value` is a value between `0` and `100` and represents the value in percentage, 0 equals off.
This is used when there is only a brightness update needed, for example the device should be off or there are only dimming behaviours.

Note that this does not change the color, so if the color is blue it will lower the brightness of the blue color.

**Color:**
```
{
    type: "COLOR",
    hue: number,
    saturation: number,
    brightness: number
}
```
`hue` is a value between `0` and `360` and represents the value as a 360 hue arch.

`saturation` is a value between `0` and `100` and represents the saturation in percentages.

`brightness` is a value between `0` and `100` and represents the brightness in percentages, 0 equals off.

**Color temperature:**
```
{
    type: "COLOR_TEMPERATURE", 
    brightness: number,
    temperature: number
}
```
`brightness` is a value between `0` and `100` and represents the brightness in percentages, 0 equals off.

`temperature` is the light temperature in kelvin and has no predefined maximum and minimum values.

#### Sending Update
The behaviour aggregator is able to receive state updates of the following format:

**Switch:**
```
{
    type: "SWITCH",
    value: boolean
}
```
**Dimming:**
```
{
    type: "DIMMING",
    value: number
}
```
`value` is a value between `0` and `100` and represents the brightness in percentages, 0 equals off.

**Color:**
```
{
    type: "COLOR",
    hue: number,
    saturation: number,
    brightness: number
}
```
`hue` is a value between `0` and `360` and represents the value as a 360 hue arch.

`saturation` is a value between `0` and `100` and represents the saturation in percentages.

`brightness` is a value between `0` and `100` and represents the brightness in percentages, 0 equals off.

**Color temperature:**
```
{
    type: "COLOR_TEMPERATURE", 
    brightness: number,
    temperature: number
}
```
`brightness` is a value between `0` and `100` and represents the brightness in percentages, 0 equals off.

`temperature` is the light temperature in kelvin and has no predefined maximum and minimum values.

#### Device State
```
{
    type: "COLORABLE",
    on: boolean,
    hue: number,
    saturation: number,
    brightness: number, 
    temperature: number 
}
```
`on` is a boolean value that represents if the device is on or off.

`hue` is a value between `0` and `360` and represents the value as a 360 hue arch.

`saturation` is a value between `0` and `100` and represents the saturation in percentages.

`brightness` is a value between `1` and `100` and represents the brightness in percentages

`temperature` is the light temperature in kelvin and has no predefined maximum and minimum values.

### Color temperature devices
a Color temperature device is a device that can react on temperature based values, like temperature lights. These are devices of type `COLORABLE_TEMPERATURE` and support the following states:
#### Receiving Updates
The behaviour aggregator will send out state updates of the following formats:

**Dimming:**
```
{
    type: "DIMMING",
    value: number
}
```
`value` is a value between `0` and `100` and represents the value in percentage, 0 equals off.

This is used when there is only a brightness update needed, for example the device should be off or there are only dimming behaviours.
Note that this does not change the temperature color, it will only lower the brightness.

**Color temperature:**
```
{
    type: "COLOR_TEMPERATURE", 
    brightness: number,
    temperature: number
}
```
`brightness` is a value between `0` and `100` and represents the brightness in percentages, 0 equals off.

`temperature` is the light temperature in kelvin and has no predefined maximum and minimum values.

#### Sending Update
The behaviour aggregator is able to receive state updates of the following format:

**Switch:**
```
{
    type: "SWITCH",
    value: boolean
}
```
**Dimming:**
```
{
    type: "DIMMING",
    value: number
}
```
`value` is a value between `0` and `100` and represents the brightness in percentages, 0 equals off.

**Color temperature:**
```
{
    type: "COLOR_TEMPERATURE", 
    brightness: number,
    temperature: number
}
```
`brightness` is a value between `0` and `100` and represents the brightness in percentages, 0 equals off.

`temperature` is the light temperature in kelvin and has no predefined maximum and minimum values.

#### Device State
```
{
    type: "COLORABLE_TEMPERATURE",
    on: boolean, 
    brightness: number, 
    temperature: number 
}
```
`on` is a boolean value that represents if the device is on or off.

`brightness` is a value between `1` and `100` and represents the brightness in percentages.

`temperature` is the light temperature in kelvin and has no predefined maximum and minimum values.
