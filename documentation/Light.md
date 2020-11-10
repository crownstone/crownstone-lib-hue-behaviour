# Documentation - Light
## Overview
 - Crownstone Hue  
 - Discovery
 - Bridge
 - **Light** 
		 - Constructing
		 - Initialization
		 - Polling/Renew state
		 - Setting the callback for a lightstate change
		 - Setting a new light state
		 - Retrieving the current known state
		 - Cleanup
		 - Remaining functions
 - LightBehaviourAggregator
 - Behaviour Aggregator 
 - Behaviour & Twilight Prioritizer 
 - Behavior/Twilight 
 - Persistence 
 - Event calls
 - Errors

## Introduction
The Light object represents a single Philips Hue Light and is dependend on a Bridge object for the usage of it's api.

## Usage
### Import
```import {Light} from {.}```
### Constructing
`const light = new Light(name: string, uniqueId: string, state: HueFullState, id: number, bridgeId: string, capabilities: object, supportedStates: [], api: any)`

`capabilities` and `supportedStates` is only used for extra information and the light object isn't depended on this.

In the module, this is done by the Bridge. This looks something like this:
`new Light(result.name, result.uniqueid, result.state, result.id, this.bridgeId, result.capabilities.control, result.getSupportedStates(), this._useApi.bind(this))`
### Initialization
To initialize a light, call:
`light.init()`
This will start the polling of the light every 500ms, checking if the light's state has changed.
The polling rate is defined in HueConstants.ts[Todo link] as `LIGHT_POLLING_RATE`

### Polling/Renew state
To renew the light's state, call:
`await light.renewState()` 
This is automatically done every 500ms when the light object is initialized.

It obtains the latest lightstate of the actual Philips Hue Light and when there is a state difference, the new state will be passed with the defined callback. The data passed is of type `HueFullState`.

### Setting the callback for a lightstate change
To set the callback for when there is a lightstate change, call: 
`light.setCallback(callback)`

In the module a callback to the aggregator is used, passing the new state. 

### Setting a new light state
To set the state of the actual Philips Hue Light, call:
`await light.setState(state: StateUpdate)`
The `state` variable is an object supporting the following fields: 
 - on: boolean - Represents if the light should be on or off
 - bri: number -  Represents the brightness and has a range between `1` and `254`
 - hue: number -  Represents the hue of the light and has a range between `0` and `65535`
 - sat: number - Represents the saturation of the light and has a range between `0` and `254`
 - xy: [number, number] - Represents the x and y coordinates of a color in CIE color space and has a range between `[0.0, 0.0]` and `[1.0, 1.0]` 
 - ct: number - Represents the Mired color temperature and has a range between `153` and `500`
 - effect: string - Can be `“none”` or `“colorloop”`, When using `"colorloop"` it fades through all hues using the current saturation and brightness settings. It keeps going until `"none"` is given.
 - alert: string - Represents an alert animation and  supports the following: `"none"` the light is not performing an alert effect, `"select"`the light performs one breathe cycle or `"lselect"` the light performs a breathe cycles for 15 seconds or until an `"alert": "none"` command is received.
 - transitiontime: number - Represents the duration of the transition between the current and new state, with steps of 100ms per number, defaults to 4 (400ms).

Note when on is false, it can't change any other states, when done so it throws an error. 
When exceeding the maximum or minimum values of a field, the maximum or minimum will be used instead.
 
### Retrieving the current known state
To retrieve the current known state, call:
`light.getState()`
This will return the state as a HueFullLightState object as format:
`
{
  on: boolean , 
  bri?: number,  
  hue?: number,  
  sat?: number,  
  xy?: [number, number],  
  ct?: number,    
  effect?: string,  
  alert?: string,  
  colormode?: string,  
  mode?: string,  
  reachable: boolean
  }
  `
Depending the type of light, the fields can vary because a multiple color light has more options than a single color light.


### Cleanup
To stop the interval, call:
`light.cleanup()`
Which will stop the polling.


### Remaining functions
`isReachable():boolean` - Returns if the light is reachable or not. (Might have a slight delay as it depends on actual Bridge providing this data after a poll) 
`getInfo():lightInfo` - Returns all information fields of the light.
`getSupportedStates():[]` - Returns an array of supported states