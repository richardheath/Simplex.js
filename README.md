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

Unbinds callbacks to target object. The parameters serves as filters. If no parameters are supplied then all callbacks are removed.

```
car.stopListening(remoteStart, 'lockClicked'); // stop listening to one event
car.stopListening(remoteStart); // stop listening to one event
car.stopListening(); // remove all callbacks
```

### - trigger (eventName, [*args])

Trigger one or many events.

```
car.trigger('doorOpened'); // Single event
car.trigger(['doorOpened', 'startPressed']); // Multiple events
```

## Model

Encapsulate the main logic surrounding the model it represents. It handles validation, conversions, properties etc.
It also uses types to easily reuse type options (like validation, conversions, and options).
Models are also responsible on communicating data with server through the use of commands.

The key values of a model are direct property of the object model. This makes it possible to read property directly
from the object. Just watch out of inherited properties when using the dot notation ('car.color').
Using get will ensure that it only retrieves own properties.

```
var car = New Car({
    color: 'red'
});

// Return both red
car.color;
car.get('color');
```

### Special Properties

Model properties that must be specified when extending a model. These will be inherited on objects derived from model.

#### - fields

Specify a Simplex type for model fields. Non Simplex type will be treated as a default value.

```
var intType = Simplex.Type.extend({
    default: 0,
    validation: {
        isInt: function(val) {
            if(_.isNumber(val) === false) {
                return 'Invalid number.';
            }
        }
    }
});

var Car = Simplex.Model.extend({
    fields: {
        horsePower: intType,
        color: 'red'
    }
});

var car = new Car();
car.horsePower; // 0
car.color; // red
```

#### - commands



### - get

## Collection

## Views

## Region

## Command

## Commands
