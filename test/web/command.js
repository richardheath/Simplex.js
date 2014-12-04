(function() {
    QUnit.module('Command');

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

    var cmdAddUser = new Simplex.Command({
        url: '/cmd',
        name: 'addUser',
        parameters: {
            name: { required: true },
            balance: new intType()
        }
    });

    test('run: wrong data', function() {
        var successFn = function () {
                ok(false, 'Should fail');
            },
            errorFn = function () {
                ok(true);
            };

        cmdAddUser.when('success', successFn);
        cmdAddUser.when('error', errorFn);

        var user = new Simplex.Model({
            name: '',
            balance: 'X'
        });

        // Validation should fail
        cmdAddUser.run({
            data: user,
            success: successFn,
            error: errorFn
        });

        cmdAddUser.stopListening();
    });

    asyncTest('run: correct data', function(assert) {
        var successFn = function () {
                assert.ok(true);
                cmdAddUser.stopListening();

            },
            errorFn = function () {
                ok(false, 'Should fail');
            };

        cmdAddUser.when('success', successFn);
        cmdAddUser.when('error', errorFn);

        var user = new Simplex.Model({
            name: 'Rihnoja',
            balance: 9000
        });

        cmdAddUser.run({
            data: user,
            success: function () { assert.ok(true); QUnit.start(); },
            error: errorFn
        });

    });

    test('validate', function() {
        // Test wrong data
        var result = cmdAddUser.validate({
            name: '',
            balance: 'X'
        });

        equal(result.valid, false);
        equal(result.errors.name.required, 'Required.');
        equal(result.errors.balance.isInt, 'Invalid number.');

        // Test correct data
        result = cmdAddUser.validate({
            name: 'Rihnoja',
            balance: 9000
        });

        ok(result.valid);
    });

    test('buildArguments', function() {
        var result;

        // Build arguments basic
        result = cmdAddUser.buildArguments({
            data: {
                name: 'Richard',
                balance: 1
            }
        });

        equal(result.name, 'Richard');
        equal(result.balance, 1);

        // Build arguments with map
        result = cmdAddUser.buildArguments({
            data: {
                userName: 'Richard',
                balance: 2
            },
            map: {
                userName: 'name'
            }
        });

        equal(result.name, 'Richard');
        equal(result.balance, 2);

        // Use model basic
        var user = new Simplex.Model({
            name: 'Richard',
            balance: 3
        });

        result = cmdAddUser.buildArguments({
            data: user
        });

        equal(result.name, 'Richard');
        equal(result.balance, 3);

        // Use model with map
        user = new Simplex.Model({
            userName: 'Richard',
            balance: 4
        });

        result = cmdAddUser.buildArguments({
            data: user,
            map: {
                userName: 'name'
            }
        });

        equal(result.name, 'Richard');
        equal(result.balance, 4);
    });

    test('map', function() {
        var result = cmdAddUser.map(
            {
                userName: 'Richard',
                balance: 1
            },
            {
                userName: 'name'
            }
        );

        equal(result.name, 'Richard');
        equal(result.balance, 1);
    });

    asyncTest('handlers', function(assert) {
        var successCtr = 0, errorCtr = 0;

        // Test that handlers can be overridden
        var addUser = new Simplex.Command({
            url: '/cmd',
            name: 'addUser',
            parameters: {
                name: { required: true },
                balance: new intType()
            },
            successHandler: function (data, options) {
                successCtr += 1;
                options.success({});
            },
            errorHandler: function (err, options) {
                errorCtr += 1;
                options.error({});
            }
        });

        // Test Error
        addUser.run({
            data: {
                name: '',
                balance: 'X'
            },
            success: function () {
                assert.ok(false, 'Should fail.');
            },
            error: function() {
                assert.equal(errorCtr, 1);
            }
        });

        // Test success
        addUser.run({
            data: {
                name: 'Richard',
                balance: 1
            },
            success: function () {
                assert.equal(successCtr, 1);
                QUnit.start();
            },
            error: function() {
                assert.ok(false, 'Should fail.');
            }
        });
    });
})();