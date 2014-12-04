(function() {
    QUnit.module('View');

    var region = new Simplex.Region('#qunit-fixture');

    test('Bind id', function() {
        var view = new Simplex.View({
            template: $('#bindId').html()
        });

        region.show(view);
        ok(view.user instanceof jQuery, 'Must be a jQuery instance');
    });

    test('Bind region', function() {
        var view = new Simplex.View({
            template: $('#bindRegion').html()
        });

        region.show(view);
        ok(view.subView instanceof Simplex.Region);
    });

    test('Bind value', function() {
        var view = new Simplex.View({
            template: $('#bindValue').html(),
            userName: 'Richard'
        });

        region.show(view);
        equal(view.label.html(), 'Richard');
        equal(view.input.val(), 'Richard');
    });

    test('Bind attribute', function() {
        var view = new Simplex.View({
            template: $('#bindAttribute').html(),
            className: 'text-info'
        });

        region.show(view);
        ok(view.label.hasClass('text-info'));
    });

    test('Bind html event', function() {
        var ctr = 0;

        var view = new Simplex.View({
            template: $('#bindHtmlEvent').html(),
            viewClick: function (ev) {
                equal(view, this, 'Context must be the view');
                ok(!!ev.target);
                ctr += 1;
            },
            viewEnter: function () {
                ctr += 2;
            }
        });

        region.show(view);
        view.button.trigger('click');
        equal(ctr, 1);
        view.button.trigger('mouseover');
        equal(ctr, 3);
    });

    test('Bind source', function() {
        var user = { name: 'Richard' },
            orders = [];

        var view = new Simplex.View({
            template: $('#bindSource').html(),
            user: user,
            orders: orders
        });

        region.show(view);
        equal(view.user, user);
        equal(view.orders, orders);
        equal(view.label.html(), user.name);
    });

    test('Bind source model value', function() {
        var user = new Simplex.Model({
            name: 'Richard'
        });

        var view = new Simplex.View({
            template: $('#bindSourceModelValue').html(),
            user: user
        });

        region.show(view);
        equal(view.user, user);
        equal(view.label.html(), user.name);
        equal(view.input.val(), user.name);

        user.set('name', 'Richard Heath');
        equal(view.label.html(), user.name);
        equal(view.input.val(), user.name);
    });

    test('Bind source model attribute', function() {
        var user = new Simplex.Model({
            name: 'Richard',
            class: 'text-info'
        });

        var view = new Simplex.View({
            template: $('#bindSourceModelAttribute').html(),
            user: user
        });

        region.show(view);
        ok(view.label.hasClass('text-info'));

        user.set('class', 'text-primary');
        ok(!view.label.hasClass('text-info'));
        ok(view.label.hasClass('text-primary'));
    });

    test('Bind items: array', function() {
        var items = [
            { name: 'Richard' },
            { name: 'Jona' },
            { name: 'Rihnoja' }
        ];

        var view = new Simplex.View({
            template: $('#bindItemsArray').html(),
            users: items
        });

        region.show(view);
        equal(view.ul.find(':eq(0)').html(), items[0].name);
        equal(view.ul.find(':eq(1)').html(), items[1].name);
        equal(view.ul.find(':eq(2)').html(), items[2].name);
    });

    test('Bind items: collection', function() {
        var items = new Simplex.Collection([
            { name: 'Richard' },
            { name: 'Jona' },
            { name: 'Rihnoja' }
        ]);

        var view = new Simplex.View({
            template: $('#bindItemsCollection').html(),
            users: items
        });

        region.show(view);
        equal(view.ul.find(':eq(0)').html(), items.at(0).name);
        equal(view.ul.find(':eq(1)').html(), items.at(1).name);
        equal(view.ul.find(':eq(2)').html(), items.at(2).name);
    });

    test('Bind items: collection with event', function() {
        var items = new Simplex.Collection([
            { name: 'Richard' },
            { name: 'Jona' },
            { name: 'Rihnoja' }
        ]);

        var ctr = 0;
        var view = new Simplex.View({
            template: $('#bindItemsCollectionWithEvent').html(),
            clickHandler: function() {
                ctr += 1;
            },
            users: items
        });

        region.show(view);
        view.ul.find(':eq(0)').trigger('click');
        equal(ctr, 1);
    });

    test('Update items when collection is updated', function() {
        var items = new Simplex.Collection([
            { name: 'Richard' },
            { name: 'Jona' }
        ]);

        var view = new Simplex.View({
            template: $('#ViewItemsCollectionUpdate').html(),
            users: items
        });

        region.show(view);
        equal(view.ul.find(':eq(0)').html(), items.at(0).name);
        equal(view.ul.find(':eq(1)').html(), items.at(1).name);
        equal(view.ul.find(':eq(2)').html(), null);

        items.set({ name: 'Rihnoja' });
        equal(view.ul.find(':eq(2)').html(), 'Rihnoja');
    });

    test('Bind sub region with view', function() {
        var view = new Simplex.View({
                template: $('#bindRegionWithView').html()
            }),
            subView = new Simplex.View({
                template: $('#bindRegionSubView').html()
            });

        region.show(view);
        ok(view.subView instanceof Simplex.Region);

        view.subView.show(subView);
        var span = view.$('span');
        equal(span.html(), 'Hello World!');
    });

    test('bind???', function() {
        ok(true);
    });

    test('Events triggered', function() {
        var lastEvent = '';

        var view = new Simplex.View({
            template: $('#bindRegion').html(),
            onShow: function () {
                equal(lastEvent, 'onShow:trigger');
                lastEvent = 'onShow:fn';
            },
            showed: function () {
                equal(lastEvent, 'showed:trigger');
                lastEvent = 'showed:fn';
            },
            onClose: function() {
                equal(lastEvent, 'onClose:trigger');
                lastEvent = 'onClose:fn';
            },
            closed: function () {
                equal(lastEvent, 'closed:trigger');
                lastEvent = 'closed:fn';
            }
        });

        view.when('onShow', function() {
            equal(lastEvent, '');
            lastEvent = 'onShow:trigger';
        });
        view.when('showed', function() {
            equal(lastEvent, 'onShow:fn');
            lastEvent = 'showed:trigger';
        });
        view.when('onClose', function() {
            equal(lastEvent, 'showed:fn');
            lastEvent = 'onClose:trigger';
        });
        view.when('closed', function() {
            equal(lastEvent, 'onClose:fn');
            lastEvent = 'closed:trigger';
        });

        region.show(view);
        region.close();

        equal(lastEvent, 'closed:fn');
    });

    test('Bind items: array with options', function() {
        var items = [
            { name: 'Richard' },
            { name: 'Jona' },
            { name: 'Rihnoja' }
        ];

        var view = new Simplex.View({
            template: $('#bindItemsArrayWithSort').html(),
            users: items,
            usersOptions: {
                sort: 'name'
            }
        });

        region.show(view);
        equal(view.ul.find(':eq(0)').html(), 'Jona');
        equal(view.ul.find(':eq(1)').html(), 'Richard');
        equal(view.ul.find(':eq(2)').html(), 'Rihnoja');
    });

    test('Bind items: array with model options', function() {
        var items = [
            { name: 'Richard' },
            { name: 'Jona' },
            { name: 'Rihnoja' }
        ];

        var options = new Simplex.Model({
            sort: 'name'
        });

        var view = new Simplex.View({
            template: $('#bindItemsArrayWithFilter').html(),
            users: items,
            usersOptions: options
        });

        region.show(view);
        equal(view.ul.find(':eq(0)').html(), 'Jona');
        equal(view.ul.find(':eq(1)').html(), 'Richard');
        equal(view.ul.find(':eq(2)').html(), 'Rihnoja');

        options.set('filter', { name: 'Richard' });
        equal(view.ul.find(':eq(0)').html(), 'Richard');
        equal(view.ul.find('li').length, 1);
    });

    test('Bind items: collection with options', function() {
        var items = new Simplex.Collection([
            { name: 'Richard' },
            { name: 'Jona' },
            { name: 'Rihnoja' }
        ]);

        var view = new Simplex.View({
            template: $('#bindItemsCollectionWithOptions').html(),
            users: items,
            usersOptions: {
                filter: { name: 'Richard' }
            }
        });

        region.show(view);
        equal(view.ul.find(':eq(0)').html(), 'Richard');
        equal(view.ul.find('li').length, 1);
    });

    test('Bind items: collection with model options', function() {
        var items = new Simplex.Collection([
            { name: 'Richard' },
            { name: 'Jona' },
            { name: 'Rihnoja' }
        ]);
        var options = new Simplex.Model({
            sort: 'name'
        });

        var view = new Simplex.View({
            template: $('#bindItemsCollectionWithOptions').html(),
            users: items,
            usersOptions: options
        });

        region.show(view);
        equal(view.ul.find(':eq(0)').html(), 'Jona');
        equal(view.ul.find(':eq(1)').html(), 'Richard');
        equal(view.ul.find(':eq(2)').html(), 'Rihnoja');

        options.set('filter', { name: 'Richard' });
        equal(view.ul.find(':eq(0)').html(), 'Richard');
        equal(view.ul.find('li').length, 1);
    });
})();