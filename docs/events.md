# Events

Simplified events module that handles attaching and triggering events. Target is an optional field. If target is
not specified then target will be the current object. eventName can be a string for single event or an array of
strings for multiple events.

```js
var car = {};
_.assign(car, Simplex.Events);

car.when('start', funtion() {
    console.log('starting');
});

car.trigger('start');
```

## - when ([target], eventName, callback, [context])

Bind an event to a callback function.

```js
car.when('doorOpened', openLights);
car.when(remoteStart, 'startPressed', startEngine);
```

## - once  ([target], eventName, callback, [context])

Bind an event that will only be triggered once

## - stopListening ([target], [eventName], [callback], [context])

Unbinds callbacks to target object. The parameters serves as filters. If no parameters are supplied then all callbacks are removed.

```js
car.stopListening(remoteStart, 'lockClicked'); // stop listening to one event
car.stopListening(remoteStart); // stop listening to one event
car.stopListening(); // remove all callbacks
```

## - trigger (eventName, [*args])

Trigger one or many events.

```js
car.trigger('doorOpened'); // Single event
car.trigger(['doorOpened', 'startPressed']); // Multiple events
```