(function() {
    QUnit.module('Model');

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

    test('constructor: fields default values', function() {
        var User = Simplex.Model.extend({
            fields: {
                id: new intType(),
                name: ''
            }
        });

        var user = new User();
        equal(user.id, 0);
        equal(user.name, '');
    });

    test('set and has', function() {
        var obj = new Simplex.Model({ message: 'hello' });
        obj.counter = 0;

        console.log(obj.toObject());
        obj.set('reply', 'hi');
        equal(obj.get('reply'), 'hi');

        obj.set({
            reply: 'Yo',
            message: 'Hey'
        });

        equal(obj.get('message'), 'Hey');
        equal(obj.has('message'), true);
    });

    test('set silent', function() {
        var obj = new Simplex.Model({ message: 'hello' });
        var triggered = 0;

        obj.when('update', function() {
            triggered += 1;
        });

        obj.set('reply', 'hi', true);
        equal(triggered, 0);

        obj.set({
            reply: 'Yo',
            message: 'Hey'
        }, true);
        equal(triggered, 0);

        equal(obj.get('message'), 'Hey');
        equal(obj.has('message'), true);
    });

    test('get', function() {
        var obj = new Simplex.Model({ message: 'hello' });
        obj.counter = 0;

        equal(obj.get('message'), 'hello');
        obj.set('reply', 'hi');
        equal(obj.get('reply'), 'hi');

        obj.when('update', function() {
            this.counter += 1;
        });

        obj.set({
            reply: 'Yo',
            message: 'Hey'
        });

        equal(obj.counter, 1);
        equal(obj.get('message'), 'Hey');
        equal(obj.has('message'), true);
    });

    test('get with fields', function() {
        // Escaped
        var UserName = Simplex.Type.extend({});
        // Not Escaped
        var UserDescription = Simplex.Type.extend({ escaped: false });
        // Parse
        var Money = Simplex.Type.extend({
            parse: function(val) {
                return '$' + val;
            }
        });

        var User = Simplex.Model.extend({
            fields: {
                name: new UserName(),
                description: new UserDescription(),
                balance: new Money()
            }
        });

        var user = new User({
            name: 'Richard <strong>Heath</strong>',
            description: '<h1>Developer</h1>',
            balance: 99999999
        });

        equal(user.get('name'), 'Richard &lt;strong&gt;Heath&lt;/strong&gt;');
        equal(user.get('description'), '<h1>Developer</h1>');
        equal(user.get('balance'), '$99999999');
    });

    test('unset and clear', function() {
        var obj = new Simplex.Model({
            field1: 1,
            field2: 2,
            field3: 3,
            field4: 4,
            triggered: 0
        });

        obj.when('update', function() {
            this.triggered += 1;
        });

        obj.unset('field1');
        equal(obj.triggered, 1);
        obj.unset('field2');
        equal(obj.triggered, 2);
        equal(obj.has('field1'), false);

        obj.clear();
        ok(obj.field3 === undefined);
        ok(obj.field4 === undefined);
        ok(obj.triggered === undefined);
    });

    test('unset and clear silent', function() {
        var obj = new Simplex.Model({
            field1: 1,
            field2: 2,
            field3: 3,
            field4: 4
        });
        var triggered = 0;

        obj.when('update', function() {
            triggered += 1;
        });

        obj.unset('field1', true);
        equal(triggered, 0);
        obj.unset('field2', true);
        equal(triggered, 0);
        equal(obj.has('field1'), false);

        obj.clear();
        ok(obj.field3 === undefined);
        ok(obj.field4 === undefined);
        equal(triggered, 0);
    });

    test('raw and escaped', function() {
        var obj = new Simplex.Model({ message: '<span>Hello</span>' });

        equal(obj.raw('message'), '<span>Hello</span>');
        equal(obj.escaped('message'), '&lt;span&gt;Hello&lt;/span&gt;');
    });

    test('event triggers', function() {
        var obj = new Simplex.Model({ message: 'hello' });
        obj.counter = 0;

        obj.when('update', function() {
            this.counter += 1;
        });

        obj.set({
            reply: 'Yo',
            message: 'Hey'
        });
        equal(obj.counter, 1);
    });

    test('trigger collection event', function() {
        ok(true);
    });

    test('toObject and toJSON', function() {
        var obj = new Simplex.Model({ name: 'Simplex' });

        var res = obj.toObject();
        equal(res.name, 'Simplex');
        ok(res._sid === undefined);
        res = obj.toJSON();
        equal(res, '{"name":"Simplex"}');
    });

    asyncTest('run: map UserId to id', function(assert) {
        var cmd = new Simplex.Commands({
            url: '/cmd'
        });
        cmd.add('addUser', {
            name: { required: true },
            balance: new intType()
        });
        cmd.add('getUser', {
            id: new intType()
        });

        var User = Simplex.Model.extend({
            commands: {
                sync: {
                    command: cmd.getUser,
                    map: {
                        UserId: 'id'
                    },
                    success: function() {
                        assert.ok(true);
                        QUnit.start();
                    },
                    error: function() { assert.ok(false, 'Should fail.'); }
                }
            }
        });

        var model = new User({
            UserId: 1
        });

        model.run('sync');
    });

    asyncTest('run: multiple commands', function(assert) {
        var cmd = new Simplex.Commands({
            url: '/cmd'
        });
        cmd.add('addUser', {
            name: { required: true },
            balance: new intType()
        });
        cmd.add('getUser', {
            id: new intType()
        });

        var User = Simplex.Model.extend({
            commands: {
                sync: {
                    command: cmd.getUser,
                    success: function() { assert.ok(true); },
                    error: function() { assert.ok(false, 'Should fail.'); }
                },
                add: {
                    command: cmd.addUser,
                    success: function() {
                        assert.ok(true);
                        QUnit.start();
                    },
                    error: function() { assert.ok(false, 'Should fail.'); }
                }
            }
        });

        var model = new User({
            id: 1,
            name: 'Richard',
            balance: 2000
        });

        model.run({
            add: {},
            sync: {}
        });
    });
})();