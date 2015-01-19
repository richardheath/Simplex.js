(function() {
    QUnit.module('Collection');

    var dataSet1 = [
        { id: 2, note: 'two', message: 'hi', number: 3 },
        { id: 1, note: 'one', message: 'hello', number: 1 },
        { id: 3, note: 'three', message: 'hi', number: 3 },
        { id: 4, note: 'four', message: 'aha', number: 1 },
        { id: 5, note: 'five', message: 'hi', number: 2 },
        { id: 6, note: 'six', message: 'aha', number: 1 }
    ];

    test('constructor', function() {
        var col = new Simplex.Collection({
            uniqueId: 'id'
        });

        equal(col.uniqueId, 'id', 'models is optional');
    });

    test('set', function() {
        var col = new Simplex.Collection(dataSet1, {
            uniqueId: 'id'
        });

        equal(col.length, 6);

        col.set([
            { id: 7, note: 'seven', message: 'yay', number: 1 }
        ]);

        equal(col.length, 7);

        // This should update the models
        col.set(dataSet1);
        equal(col.length, 7);

        // Update model
        col.set([
            { id: 7, note: 'seven', message: 'wow', number: 2 }
        ]);
        equal(col.length, 7);
        var item = col.get(7);
        equal(item.message, 'wow');
        equal(item.number, 2);
    });

    test('set silent', function() {
        var col = new Simplex.Collection(dataSet1, {
            uniqueId: 'id'
        });
        var triggered = 0;

        col.when('change', function() {
            triggered += 1;
        });

        equal(col.length, 6);

        // First is not silent to test the event is being triggered
        col.set([
            { id: 7, note: 'seven', message: 'yay', number: 1 }
        ]);

        equal(triggered, 1);
        equal(col.length, 7);

        // This should update the models
        col.set(dataSet1, true);
        equal(triggered, 1);
        equal(col.length, 7);

        // Update model
        col.set([
            { id: 7, note: 'seven', message: 'wow', number: 2 }
        ], true);
        equal(triggered, 1);
        equal(col.length, 7);

        var item = col.get(7);
        equal(item.message, 'wow');
        equal(item.number, 2);
    });

    test('remove', function() {
        var col = new Simplex.Collection(dataSet1, {
            uniqueId: 'id'
        });

        // Remove 1 item
        var res = col.remove(3);
        equal(res.length, 1);
        equal(res[0].id, 3);

        // Remove array of models
        res = col.remove([1, 2]);
        equal(res.length, 2);
        equal(res[0].id, 1);
        equal(res[1].id, 2);

        // Remove by model
        var model = col.get(5);
        res = col.remove(model);
        equal(res.length, 1);
        equal(res[0].id, 5);
    });

    test('remove silent', function() {
        var col = new Simplex.Collection(dataSet1, {
            uniqueId: 'id'
        });

        var triggered = 0;

        col.when('change', function() {
            triggered += 1;
        });

        // Remove 1 item
        var res = col.remove(3);
        equal(triggered, 1);
        equal(res.length, 1);
        equal(res[0].id, 3);

        // Remove array of models
        res = col.remove([1, 2], true);
        equal(triggered, 1);
        equal(res.length, 2);
        equal(res[0].id, 1);
        equal(res[1].id, 2);

        // Remove by model
        var model = col.get(5);
        res = col.remove(model, true);
        equal(triggered, 1);
        equal(res.length, 1);
        equal(res[0].id, 5);
    });

    test('get', function() {
        var col = new Simplex.Collection(dataSet1, {
            uniqueId: 'id'
        });

        var res = col.get(1);
        equal(res.id, 1);

        res = col.get(6);
        equal(res.id, 6);

        res = col.get(10);
        ok(res === null);
    });

    test('clear', function() {
        var col = new Simplex.Collection(dataSet1, {
            uniqueId: 'id'
        });

        equal(col.length, 6);
        col.clear();
        equal(col.length, 0);
    });

    test('clear silent', function() {
        var col = new Simplex.Collection(dataSet1, {
            uniqueId: 'id'
        });
        var triggered = 0;

        col.when('change', function() {
            triggered += 1;
        });

        equal(col.length, 6);
        // Trigger change
        col.clear();
        equal(triggered, 1);
        // Silent
        col.clear(true);
        equal(triggered, 1);
    });

    test('at', function() {
        var col = new Simplex.Collection(dataSet1, {
            uniqueId: 'id'
        });

        var res = col.at(3);
        equal(res.id, 4);
    });

    test('select', function() {
        var col = new Simplex.Collection(dataSet1, {
            uniqueId: 'id'
        });
        var res;

        // Test get by range
        res = col.select([1, 4]);
        equal(res.length, 4);
        // - Should return id 2 to 5
        equal(res[0].id, 2);
        equal(res[3].id, 5);
        // - to max
        res = col.select([3]);
        equal(res.length, 3);
        // - overflow will default to max
        res = col.select([3, 999]);
        equal(res.length, 3);
        
        // Select by object filter
        // - filter by message hi
        res = col.select({ message: 'hi'});
        _.forEach(res, function (item) {
            equal(item.message, 'hi');
        });

        // Select by function
        // - filter by number less than 3
        res = col.select(function (item) {
            return item.number < 3;
        });
        _.forEach(res, function (item) {
            ok(item.number < 3);
        });

        // Test Select All
        res = col.select();
        equal(res.length, 6);

        res = col.select('*', 'message');
        equal(res.length, 6);
        equal(res[0].message, 'aha');
        equal(res[2].message, 'hello');

        // Test sort
        res = col.select({ number: 1}, 'message');
        equal(res.length, 3);
        equal(res[0].message, 'aha');
        equal(res[1].message, 'aha');
        equal(res[2].message, 'hello');

        res = col.select({ number: 1}, 'message', 'desc');
        equal(res.length, 3);
        equal(res[0].message, 'hello');
        equal(res[1].message, 'aha');
        equal(res[2].message, 'aha');
    });

    test('lodash methods', function() {
        var col = new Simplex.Collection(dataSet1, {
            uniqueId: 'id'
        });
        var index = 1;
        col.forEach(function (item) {
            equal(item.id, index);
            index += 1;
        });
    });
})();