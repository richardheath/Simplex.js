(function() {
    QUnit.module('Commands');

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

    test('add', function() {
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

        // Check if commands are created
        ok(!!cmd.addUser);
        ok(!!cmd.getUser);

        // Check inherited properties
        ok(cmd.addUser.parent === cmd);
        ok(cmd.addUser.url === '/cmd');
        ok(cmd.addUser.mode === 'ajax');
    });

    asyncTest('run', function(assert) {
        var successCtr = 0, errorCtr = 0;

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

        // Test validation error
        cmd.run({
            addUser: {
                data: {
                    name: '',
                    balance: 'X'
                }
            },
            getUser: {
                data: { id: 1 }
            }
        },
        {
            success: function() {
                assert.ok(false, 'Should fail');
            },
            error: function() {
                assert.ok(true);
            }
        });

        // Test validation success
        cmd.run({
            addUser: {
                data: {
                    name: 'Richard',
                    balance: 1
                }
            },
            getUser: {
                data: { id: 1 }
            }
        },
        {
            success: function() {
                assert.ok(true);
                QUnit.start();
            },
            error: function() {
                assert.ok(false, 'Should succeed');
            }
        });
    });

    test('remove', function() {
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

        ok(!!cmd.addUser);
        ok(!!cmd.getUser);

        cmd.remove('addUser');
        equal(!!cmd.addUser, false);
        ok(!!cmd.getUser);

        cmd.remove('getUser');
        equal(!!cmd.addUser, false);
        equal(!!cmd.getUser, false);
    });

    test('_dispatchEvents', function() {
        ok(true);
    });

    test('delayedRun', function() {
        ok(true);
    });


})();