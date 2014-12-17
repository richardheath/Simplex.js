# Model

Encapsulate the main logic surrounding the model it represents. It handles validation, conversions, properties etc.
It also uses types to easily reuse type options (like validation, conversions, and options).
Models are also responsible on communicating data with server through the use of commands.

The key values of a model are direct property of the object model. This makes it possible to read property directly
from the object. Just watch out of inherited properties when using the dot notation ('car.color').
Using get will ensure that it only retrieves model attributes.

```js
var car = New Car({
    color: 'red'
});

// Return both red
car.color;
car.get('color');
```

## Special Properties

Model properties that must be specified when extending a model. These will be inherited 
on objects derived from model.

### - fields

Specify a Simplex type for model fields. Non Simplex type will be treated as default value.

```js
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

### - commands

Specify server commands that the model can use.

```js
var getCarSpecs = new Simplex.Command({
    url: '/cmd',
    name: 'getCarSpecs',
    parameters: {
        make: { required: true }
        model: { required: true }
    }
});

var Car = Simplex.Model.extend({
    commands: {
        sync: {
            command: getCarSpecs,
            map: {},
            success: function() { console.log('Specs'); },
            error: function() { console.log('Failed'); }
        }
    }
});

var impala = new Car({
    make: 'Impala',
    model: 'Chevy'
});

impala.run('sync');
```

## - get(attr)

Get the current value of an attribute. For security purpose the default behavior 
is to escape values. This behavior can be changed through setting the escaped 
property of Type to false. Use raw to get the actual value of the attribute.

## - raw(attr)

Returns unescaped value of an attribute.

## - escaped(attr)

Returns escaped value of an attribute.

```js
var car = new Simplex.Model({
    color: 'red &'
});

car.get('color'); // 'red &amp;'
car.escaped('color'); // 'red &amp;'
car.raw('color'); // 'red &'
```

## - set(key, val, silent) / (attributes, silent)

Set the attributes of a model. This will trigger a change event to the model 
and collection if model is in a collection. Set silent to true to prevent events
from triggering.

```js
var car = new Simplex.Model();

car.set({
    make: 'Tesla',
    model: 'P85D'
});

car.set('color': 'black');
car.get('make'); // Tesla
```

## - has (attr)

Returns true if the attribute is set to a non-null or non-undefined value.

```js
car.set({
    make: 'Tesla',
});

car.has('make'); // true
car.has('color'); // false
```


## - clear ([silent])

Removes all attributes.

## - unset (attr[, silent])

Remove an attribute.

```js
car.set({
    make: 'Tesla',
});

car.make; // Tesla
car.unset('make');
car.make; // undefined

```

## - toJSON()

Returns a JSON string representation of the model attributes.

```js
var car = new Simplex.Model({ 
    make: 'Tesla',
    model: 'P85D'
});

car.toJSON(); // "{"make":"Tesla","model":"P85D"}" 
```

## - toObject()

Similar to toJSON method but it will return an object instead of a JSON string.

```js
var car = new Simplex.Model({ 
    make: 'Tesla',
    model: 'P85D'
});

car.toObject(); // { make: "Tesla", model: "P85D" }
```

## - run (command[, options])

Executes a command assigned to a model.

```js
var getCarSpecs = new Simplex.Command({
    url: '/cmd',
    name: 'getCarSpecs',
    parameters: {
        make: { required: true }
        model: { required: true }
    }
});

var Car = Simplex.Model.extend({
    commands: {
        sync: {
            command: getCarSpecs,
            map: {},
            success: function() { console.log('Specs'); },
            error: function() { console.log('Failed'); }
        }
    }
});

var impala = new Car({
    make: 'Impala',
    model: 'Chevy'
});

impala.run('sync');
```