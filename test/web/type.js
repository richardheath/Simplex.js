(function() {
    QUnit.module('Type');

    test('constructor: Test validation combine behavior on extend', function() {
        var type1 = Simplex.Type.extend({
            validation: {
                pass: function() { console.log('pass'); },
                fail: function() { console.log('fail'); }
            }
        });
        var type2 = type1.extend({
            validation: {
                test: function() { console.log('test'); }
            }
        });
        var val = new type2();

        ok(_.isFunction(val.validation.pass));
        ok(_.isFunction(val.validation.fail));
        ok(_.isFunction(val.validation.test));
    });

    test('constructor: Test validation combine behavior on declare', function() {
        var type1 = Simplex.Type.extend({
            validation: {
                pass: function() { console.log('pass'); },
                fail: function() { console.log('fail'); }
            }
        });
        var val = new type1({
            validation: {
                test: function() { console.log('test'); }
            }
        });

        ok(_.isFunction(val.validation.pass));
        ok(_.isFunction(val.validation.fail));
        ok(_.isFunction(val.validation.test));
    });
})();