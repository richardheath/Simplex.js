# Collection

Handler for collection of models. A "change" event will be triggered when a model has been added, updated,
or removed from the collection.

## Options

### model
Specify the model to use when adding new objects. Default is Simplex.Model.

### uniqueId

Used to test the uniqueness of the model. Default is ‘_sid’

### commands

Specify the commands that the collection can use.

## Constructor ([models] [,options])

Both models and options are optional. Models must be an array and options must be
an object.

```js
var both = new Simplex.Collection([...], {
    model: Car,
    uniqueId: 'vin' 
}

var justModels = new Simplex.Collection([...]);
var JustOptions = Simplex.Collection.extend({ uniqueId: 'vin' });
var empty = new Simplex.Collection();
```

## - set (models [, silent])

Insert or update models in a collection. Using the uniqueId it will determine if the model needs to
be added or updated. "models" can be an array (Multiple), object, or model. Silent is false by default.

```js
// You can mix model and uniqueId in an array
cars.set([outback, { name: 'Impala' }]);
cars.set(p85d, true); // silent
```

## - remove (models [, silent])

Remove models from the collection using uniqueId or actual model object. "models" can be an array
(multiple), object (uniqueId), or model. Removed models will be returned as an array;

```js
cars.remove([
    outback, // using model
    'Impala' // using uniqueId
]);

var removed = cars.remove(p85d, true); // silent
removed.length; // 1
```

## - get (uniqueId)

Get a model using uniqueId.

```js
var impala = cars.get('Impala');
```

## - clear ()

Clear a collection;

## - at (index)

Returns a model at specified index.

```js
var aCar = cars.at(1);
```

## - select (filter, sort, dir)

Returns an array of models that matches filter.

### Array [startIndex, length]
Filter by range. "startIndex" is required. "length" is the number of items to retrieve. If "length" is
not specified then it will retrieve until the end of collection. The sort will determine the order of
the model which affects the range filter.

```js
cars.select([0, 10]); // 0 - 10
cars.select([10]); // 10*
```

### Object
This will use lodash [where](https://lodash.com/docs#where) method to filter the collection.

```js
cars.select({ name: 'Impala' });
```

### Function
Used for more complex queries. It uses lodash [filter](https://lodash.com/docs#filter)
method to filter the collection. The function must return a truthy value to be included 
on the result.

```js
cars.select(function(value, index, collection) {
    return value.name = 'Impala';
});
```
### All
Just leave the parameters blank or "*" if you want to specify a sort.

```js
cars.select(); // all
cars.select('*', 'name'); // with sort
cars.select('*', 'name', 'desc'); // with sort desc
```

## - run (command, options)

Executes a command assigned to a collection.

```js
var getCars = new Simplex.Command({
    url: '/cmd',
    name: 'getCars',
    parameters: {}
});

var Cars = new Simplex.Collection({
    commands: {
        sync: {
            command: getCars,
            map: {},
            success: function() { console.log('Sync'); },
            error: function() { console.log('Failed'); }
        }
    }
});

var carsList = new Cars();
carsList.run('sync');
```