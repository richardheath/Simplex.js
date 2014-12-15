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

> Model properties that must be specified when extending a model. These will be inherited on objects derived from model.
>
> #### - fields
>
> Specify a Simplex type for model fields. Non Simplex type will be treated as a default value.

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

> #### - commands
>
> Specify commands that the model can use.
>

```
var getCarSpecs = new Simplex.Command({
    url: '/cmd',
    name: 'getCarSpecs',
    parameters: {
        make: { required: true }
        model: { required: true }
    }
});

var Car = new Simplex.Model({
    getSpecs: getCarSpecs,
    map: {},
    success: function() { console.log('Specs'); },
    error: function() { console.log('Failed'); }
});

var impala = new Car({
    make: 'Impala',
    model: 'Chevy'
});

impala.run('getSpecs');
```

### - get(attr)

Get the current value of an attribute. All strings are escaped by default. 
Use raw to get an unescaped version of a string. This behavior can be 
changed through setting the escaped property of Type to false.

### - set(key, val, silent) / (attributes, silent)

Set the attributes of a model. This will trigger a change event to the model 
and collection if model is in a collection. Set silent to true to prevent events
from triggering.

### - has (attr)

Returns true if the attribute is set to a non-null or non-undefined value.

### - raw(attr)

Returns unescaped value of an attribute.

### - escaped(attr)

Returns escaped value of an attribute.

### - clear ([silent])

Removes all attributes.

### - unset (attr[, silent])

Remove an attribute.

### - toJSON()

Returns a JSON string representation of the model attributes.

### - toObject()

Similar to toJSON method but it will return an object instead of a JSON string.

###  run (command[, options])

Executes a command assigned to a model.

## Collection

Handler for collection of models. A "change" event will be triggered when a model has been added, updated,
or removed from the collection.

### - Options

> #### model
> Specify the model to use when adding new objects. Default is Simplex.Model.
>
> #### uniqueId
> Used to test the uniqueness of the model. Default is ‘_sid’
> #### commands
> Specify the commands that the collection can use.

### - set(models, silent)

Insert or update models in a collection. Using the uniqueId this will determine if the model needs to
be added or updated. "models" can be an array (Multiple), object, or model. Silent is false by default.

```
cars.set([outback, { name: 'Impala' }]);
cars.set(p85d, true); // silent
```

### - remove(models, silent)

Remove models from the collection using uniqueId or actual model object. "models" can be an array
(multiple), object (uniqueId), or model. Removed models will be returned as an array;

```
cars.remove([
    outback, // using model
    'Impala' // using uniqueId
]);

var removed = cars.remove(p85d, true); // silent
removed.length; // 1
```

### - get(uniqueId)

Get a model using uniqueId.

```
var impala = cars.get('Impala');
```

### - clear ()

Clear a collection;

### - at (index)

Returns a model at specified index.

```
var aCar = cars.at(1);
```

### - select (filter, sort, dir)

Returns an array of models that matches filter.

> #### - Array [startIndex, length]
> Filter by range. "startIndex" is required. "length" is the number of items to retrieve. If "length" is
> not specified then it will retrieve until the end of collection. The sort will determine the order of
> the model which affects the range filter.
>
```
cars.select([0, 10]); // 0 - 10
cars.select([10]); // 10*
```

> #### - Object
> This will use lodash [where](https://lodash.com/docs#where) method to filter the collection.
```
cars.select({ name: 'Impala' });
```

> #### - Function
> Used for more complex queries. It uses lodash [filter](https://lodash.com/docs#filter)
> method to filter the collection. The function must return a truthy value to be included on the result.
>
```
cars.select(function(value, index, collection) {
    return value.name = 'Impala';
});
```
> #### - All
> Just leave the parameters blank or "*" if you want to specify a sort.
>
```
cars.select(); // all
cars.select('*',
```

## Views

## Region

## Command

## Commands
