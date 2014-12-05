# Simplex.js 0.0.1

Simplex.js is my attempt to simplify the development of JavaScript (Especially SPA) applications.
It is based on the ideas of Backbone.js, Marionette.js, and other libraries simplified to satisfy my
development needs.

My personal website is already using this library:
http://richardheath.me

# Requirements

 * jQuery - Only tested in v2.1.1
 * lodash - v2.4.1

# Documentation

## Events

Simplified events module that handles attaching and triggering events. Target is an optional field. If target is
not specified then target will be the current object. eventName can be a string for single event or an array of
strings for multiple events.

### - when ([target], eventName, callback, [context])

Bind an event to a callback function.

```
car.when('doorOpened', openLights);
car.when(remoteStart, 'startPressed', startEngine);
```

### - once  ([target], eventName, callback, [context])

Bind an event that will only be triggered once

### - stopListening ([target], [eventName], [callback], [context])

### - trigger (eventName)

## Model

## Collection

## Views

## Region

## Command

## Commands
