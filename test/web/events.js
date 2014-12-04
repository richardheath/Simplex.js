(function() {
    QUnit.module('Events');

    test('when and trigger: self', function() {
        var obj = new Simplex.Model();
        obj.counter = 0;

        obj.when('change', function() {});
        ok(!!obj._events.change);

        // TODO Attach to self check

        obj.when('event', function() { obj.counter += 1; });
        obj.trigger('event');
        equal(obj.counter, 1);

        obj.trigger('event');
        obj.trigger('event');
        obj.trigger('event');
        obj.trigger('event');
        equal(obj.counter, 5);
    });

    test('when and stopListening', function() {
        var a = new Simplex.Model();
        var b = new Simplex.Model();
        a.counter = 0;
        b.counter = 0;

        a.when(b, 'event', function() {
            this.counter += 1;
        });
        b.trigger('event');
        equal(a.counter, 1);

        // Stop listening to event
        a.stopListening();
        b.trigger('event');
        equal(a.counter, 1);

        // Test removing by event name
        a.when(b, 'event1', function() { });
        a.when(b, 'event2', function() { });
        a.when(b, 'event3', function() { });

        a.stopListening(b, 'event1');
        ok(b._events.event1 === undefined);

        // Test removing by target
        a.stopListening(b);
        ok(b._events.event2 === undefined);
        ok(b._events.event3 === undefined);

        var increment = function() { this.counter += 1; };
        var decrement = function() { this.counter -= 1; };
        a.counter = 0;
        b.counter = 0;

        a.when(b, 'inc_a', increment, a);
        a.when(b, 'inc_b', increment, b);
        a.when(b, 'dec_a', decrement, a);
        a.when(b, 'dec_b', decrement, b);

        // Test incrementing context
        b.trigger('inc_a');
        equal(a.counter, 1);

        b.trigger('inc_b');
        equal(a.counter, 1);
        equal(b.counter, 1);

        // Stop listening by callback and context
        a.stopListening(b, increment, a);
        ok(b._events.inc_a === undefined);
        ok(!!b._events.inc_b);

        // Stop listening by callback
        a.stopListening(b, decrement);
        ok(!!b._events.inc_b);
        ok(b._events.dec_a === undefined);
        ok(b._events.dec_b === undefined);

        // Stop listening by context
        a.stopListening(b, b);
        ok(b._events.inc_b === undefined);
    });

    test('when and trigger multiple events', function() {
        var obj = new Simplex.Model();
        obj.counter = 0;

        obj.when(['a', 'b', 'c'], function() { obj.counter += 1; });

        obj.trigger('a');
        equal(obj.counter, 1);

        obj.trigger(['a', 'b']);
        equal(obj.counter, 3);

        obj.trigger('c');
        equal(obj.counter, 4);
        obj.stopListening(['a', 'c']);
        obj.trigger(['a', 'b', 'c']);
        equal(obj.counter, 5);
    });

    test('once', function() {
        var a = new Simplex.Model();
        var b = new Simplex.Model();
        a.counter = 0;
        b.counter = 0;

        a.once('event', function() { this.counter += 1; });
        a.trigger('event');
        a.trigger('event');
        equal(a.counter, 1);

        a.once(b, 'event', function() { this.counter += 1; }, b);
        b.trigger('event');
        b.trigger('event');
        equal(b.counter, 1);
    });
})();