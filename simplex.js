// Simplex 0.0.1

(function(){
    'use strict';

    // Save reference to global object
    var root = this;

    // The top-level namespace
    var Simplex;

    if(typeof exports !== 'undefined') {
        Simplex = exports;
    } else {
        Simplex = root.Simplex = {};
    }

    // Current Version
    Simplex.version = '0.0.1';

    var array = [],
        slice = array.slice,
        regxSimplexPrefix = /^sx-/,
        trim = function (val) {
            return val.replace(/^\s+|\s+$/g, '');
        };

    // Require lodash on server or if it's not already present.
    var _ = root._;

    if (typeof require !== 'undefined' && !_) {
        _ = require('lodash');
    }

    var Events = Simplex.Events = {
        // Bind an event to a callback function.
        //  ([obj], eventName, callback, [context])
        when: function(obj, eventName, callback, context) {
            // Shift parameters when obj is not defined
            if(_.isString(obj) || _.isArray(obj)) {
                context = callback;
                callback = eventName;
                eventName = obj;
                obj = this;
            }

            if(!callback) {
                return;
            }

            context = context || this;

            // Attach target and source to each other
            attach(this, obj);

            var root = this;
            if(_.isArray(eventName)) {
                _.forEach(eventName, function (name) {
                    addEvent(root, obj, name, callback, context);
                });
            }
            else {
                addEvent(root, obj, eventName, callback, context);
            }

            return this;
        },
        // Bind an event that will only be triggered once
        once: function(obj, eventName, callback, context) {
            // Shift parameters when obj is not defined
            if(_.isString(obj) || _.isArray(obj)) {
                context = callback;
                callback = eventName;
                eventName = obj;
                obj = this;
            }

            if(!callback) {
                return;
            }

            context = context || this;

            // Attach target and source to each other
            attach(this, obj);

            var onceWrapper = function(name, callback, context) {

                var onceCallback = function() {
                    callback.call(this, arguments);
                    stopCallback();
                };
                var stopCallback = function() {
                    obj.stopListening(name, onceCallback, context);
                };
                return onceCallback;
            };

            var root = this;
            if(_.isArray(eventName)) {
                _.forEach(eventName, function (name) {
                    addEvent(root, obj, name, onceWrapper(name, callback, context), context);
                });
            } else {
                addEvent(root, obj, eventName, onceWrapper(eventName, callback, context), context);
            }

            return this;
        },
        // Unbind callbacks. If obj is null then it will unbind the callbacks
        // from source. The callbacks that will removed is matched with supplied
        // eventName, callback, and context. If these are null then all is removed.
        stopListening: function(obj, eventName, callback, context) {
            var root = this;

            // Remove all
            if(!obj && !eventName && !callback && !context) {
                this._events = {};

                if(this._attachedTo) {
                    _(this._attachedTo).forEach(function(target) {
                        removeEvent(target, null, null, null, root._sid);
                    });
                }
                return this;
            }

            // Shift parameters when obj is not defined
            if(_.isString(obj) || _.isArray(obj)) {
                context = callback;
                callback = eventName;
                eventName = obj;
                obj = this; // Set target to current object
            }

            // Shift parameters when no eventName
            if((_.isString(eventName) || _.isArray(eventName)) === false) {
                context = callback;
                callback = eventName;
                eventName = null;
            }

            // Shift parameters when no callback or sid
            if((_.isFunction(callback) || _.isString(callback)) === false) {
                context = callback;
                callback = null;
            }

            if(_.isArray(eventName)) {
                _.forEach(eventName, function (name) {
                    removeEvent(obj, name, callback, context);
                });
            } else {
                removeEvent(obj, eventName, callback, context);
            }

            return this;
        },
        // Trigger one or many events.
        trigger: function(name) {
            if(!this._events) {
                return this;
            }

            var args = _.rest(arguments, 1),
                root = this;
            if(_.isArray(name)) {
                _.forEach(name, function (name) {
                    triggerEvent(root, name, args);
                });
            }
            else {
                triggerEvent(this, name, args);
            }

            return this;
        }
    };

    function addEvent(source, obj, eventName, callback, context) {
        obj._events || (obj._events = {});
        var events = obj._events[eventName] || (obj._events[eventName] = []);
        events.push({callback: callback, context: context, sid: source._sid });
    }
    function removeEvent(obj, name, callback, context, sid) {
        var i, events;

        if(name) {
            events = obj._events[name];
            if(!events) {
                return;
            }

            for(i = 0; i < events.length; ++i) {
                if(sid && sid === events[i].sid) {
                    events[i] = false;
                } else if(callback && context && (callback === events[i].callback) && (context === events[i].context)) {
                    events[i] = false;
                } else if(callback && !context && (callback === events[i].callback)) {
                    events[i] = false;
                } else if(context && !callback && context === events[i].context) {
                    events[i] = false;
                } else if(!callback && !context) {
                    events[i] = false;
                }
            }
            events = _.compact(events);

            if(events.length === 0) {
                delete obj._events[name]; // Delete event container if there are no events
            }
        }
        else {
            _(obj._events).forEach(function(events, name) {
                for(i = 0; i < events.length; ++i) {
                    if(sid && sid === events[i].sid) {
                        events[i] = false;
                    } else if(callback && context && (callback === events[i].callback) && (context === events[i].context)) {
                        events[i] = false;
                    } else if(callback && !context && (callback === events[i].callback)) {
                        events[i] = false;
                    } else if(context && !callback && context === events[i].context) {
                        events[i] = false;
                    } else if(!callback && !context) {
                        events[i] = false;
                    }
                }
                events = _.compact(events);

                if(events.length === 0) {
                    delete obj._events[name]; // Delete event container if there are no events
                }
            });
        }
    }
    function triggerEvent(obj, name, args) {
        if(!obj._events[name]) {
            return;
        }

        var events = obj._events[name],
            i = -1, l = events.length, ev,
            a1 = args[0], a2 = args[1], a3 = args[2];

        switch (args.length) {
            case 0:
                while (++i < l) {
                    (ev = events[i]).callback.call(ev.context);
                }
                return;
            case 1:
                while (++i < l) {
                    (ev = events[i]).callback.call(ev.context, a1);
                }
                return;
            case 2:
                while (++i < l) {
                    (ev = events[i]).callback.call(ev.context, a1, a2);
                }
                return;
            case 3:
                while (++i < l) {
                    (ev = events[i]).callback.call(ev.context, a1, a2, a3);
                }
                return;
            default:
                while (++i < l) {
                    (ev = events[i]).callback.apply(ev.context, args);
                }
                return;
        }
    }
    function attach(source, target) {
        // Don't attach to itself
        if(source === target) {
            return;
        }

        source._attachedTo || (source._attachedTo = {});
        source._attachedTo[target._sid] = target;
        target._attachedTo || (target._attachedTo = {});
        target._attachedTo[source._sid] = source;
    }

    var Model = Simplex.Model = function(attributes) {
        attributes ||  (attributes = {});

        // Apply default values
        if(this.fields) {
            _.forEach(this.fields, function(field, key) {
                // Retain supplied value
                if(attributes[key]) {
                    return;
                }

                // Apply default value
                if(field instanceof  Type && _.isUndefined(field.default) === false) {
                    attributes[key] = field.default;
                } else {
                    attributes[key] = field;
                }
            });
        }

        this._sid = _.uniqueId('s');
        this.set(attributes, { silent: true });
        this.initialize.apply(this, arguments);
    };
    // Attach all inheritable methods to the Model prototype.
    _.assign(Model.prototype, Events);
    _.assign(Model.prototype, {
        initialize: function() {},
        get: function(attr) {
            if(this.fields && this.fields[attr]) {
                var field = this.fields[attr];
                if(field.parse) {
                    return field.parse(this[attr]);
                }

                if(field.escaped === false) {
                    return this[attr];
                }
            }

            return _.escape(this[attr]);
        },
        set: function(key, val, silent) {
            if(key == null) {
                return this;
            }

            var attrs, attr;

            // set attrs based on parameters
            if (typeof key === 'object') {
                attrs = key;
                silent = val;
            } else {
                (attrs = {})[key] = val;
            }

            for (attr in attrs) {
                this[attr] = attrs[attr];
            }

            if(silent !== true) {
                this.trigger('update');
                this._triggerCollection('change');
            }
            return this;
        },
        has: function(attr) {
            return this[attr] != null;
        },
        unset: function(attr, silent) {
            // Only unset attributes that exists and non-inherited
            if(!this[attr] || !this.hasOwnProperty(attr)) {
                return;
            }

            delete this[attr];
            if(silent !== true) {
                this.trigger('update');
                this._triggerCollection('change');
            }

            return this;
        },
        clear: function(silent) {
            var attr;

            for (attr in this) {
                if(!this.hasOwnProperty(attr)) {
                    continue;
                }

                delete this[attr];
            }

            if(silent !== true) {
                this.trigger('update');
                this._triggerCollection('change');
            }

            return this;
        },
        raw: function(attr) {
            return this[attr];
        },
        escaped: function(attr) {
            return _.escape(this[attr]);
        },
        run: function(command, options) {
            var cmd, modelCmd, data,
                commands = command;

            options = options || {};
            if(typeof command === 'string') {
                commands = {};
                commands[command] = options;
            }

            for(cmd in commands) {
                modelCmd = this.commands[cmd]; // TODO: Use Parent
                data = { data: this.toObject() };
                modelCmd.command.run(_.assign(data, _.assign( modelCmd, commands[cmd] )));
            }
        },
        toJSON: function () {
            return JSON.stringify(this.toObject());
        },
        toObject: function() {
            var key, obj = {};
            for(key in this) {
                if(!this.hasOwnProperty(key) || key === '_sid' || key === '_events') {
                    continue;
                }

                obj[key] = this[key];
            }
            return obj;
        },
        _triggerCollection: function(event) {
            if(!this.collection) {
                return;
            }

            if(_.isArray(this.collection)) {
                _.each(this.collection, function (col) {
                    col.trigger(event);
                });
            } else {
                this.collection.trigger(event);
            }
        }
    });

    var Collection = Simplex.Collection = function(models, options) {
        console.log(_.isObject(models));
        console.log(models);
        if(models && _.isArray(models) === false) {
            options = models;
            models = null;
        }

        options || (options = {});
        this.Model = options.Model ? options.Model : Model;
        this.uniqueId = options.uniqueId || '_sid';

        if(options.commands) {
            this.commands = options.commands;
        }

        this.clear();
        this.initialize.apply(this, arguments);
        if (models) {
            this.set(models, {silent: true});
        }
    };
    _.assign(Collection.prototype, Events);
    _.assign(Collection.prototype, {
        initialize: function() {},
        set: function(models, silent) {
            if(!models) { return; }

            var col = this,
                uniqueId = this.uniqueId;

            if(_.isArray(models)) {
                _.forEach(models, function(model) {
                    if(model instanceof Model) {
                        col._addItem(model);
                    } else { // If not model expect plain object
                        col._addItem(new col.Model(model));
                    }
                });
            }
            else {
                if(models instanceof Model) {
                    col._addItem(models);
                } else { // If not model expect plain object
                    col._addItem(new this.Model(models));
                }
            }

            // Sort the models by uniqueId
            this.models.sort(function(a, b) {
                if(a[uniqueId] > b[uniqueId]) {
                    return 1;
                }
                if(a[uniqueId] < b[uniqueId]) {
                    return -1;
                }
                return 0;
            });

            if(silent !== true) {
                this.trigger('change');
            }
        },
        remove: function(models, silent) {
            if(!models) {
                models = this.models;
                this.clear();
                return models;
            }

            var removed = [], col = this;
            if(_.isArray(models)) {
                _.forEach(models, function(model) {
                    removed.push(col._removeItem(model));
                });
            }
            else {
                removed.push(col._removeItem(models));
            }

            if(silent !== true) {
                this.trigger('change');
            }

            return removed;
        },
        clear: function(silent) {
            this.length = 0;
            this.models = [];

            if(silent !== true) {
                this.trigger('change');
            }
        },
        get: function(id) {
            var low = 0, high = this.length - 1,
                i, itemId, uniqueId = this.uniqueId;

            while (low <= high) {
                i = Math.floor((low + high) / 2);
                itemId = this.models[i][uniqueId];
                if (id > itemId) {
                    low = i + 1; continue;
                }
                if (id < itemId) {
                    high = i - 1; continue;
                }
                if(id === itemId) {
                    return this.models[i];
                }
            }
            return null;
        },
        at: function (index) {
            if(index >= this.length) {
                return null;
            }

            return this.models[index];
        },
        select: function(filter, sort, dir) {
            // Set sort direction
            if(dir) {
                dir = dir.toUpperCase() === 'DESC' ? 1 : 0;
            } else { // Default ASC
                dir = 0;
            }

            var result;
            // use default if sort is not defined
            if(sort) {
                result = _.sortBy(this.models, sort);
            } else {
                result = this.models;
            }

            // Reverse array if descending
            if(dir === 1) {// Descending
                result.reverse();
            }

            if(_.isArray(filter)) {
                // Filter by range
                if(filter.length === 1) {
                    filter.push(result.length - 1);
                } else if(filter[1] > result.length -1) {
                    filter[1] = result.length - 1;
                }

                return result.slice(filter[0], filter[1] + 1);
            } else if(_.isObject(filter)) {
                return _.where(result, filter);
            } else if(_.isFunction(filter)) {
                return _.filter(result, filter);
            } else if(_.isUndefined(filter) || filter === '*') {
                // Return all items if filter is undefined or null
                return result;
            }

            return [];
        },
        run: function(command, options) {
            var cmd, colCmd, data,
                commands = command;

            options = options || {};
            if(typeof command === 'string') {
                commands = {};
                commands[command] = options;
            }

            for(cmd in commands) {
                colCmd = this.commands[cmd];
                data = { data: this.toObject() };
                colCmd.command.run(_.assign(data, _.assign( colCmd, commands[cmd] )));
            }
        },
        _addItem: function(model) {
            var item = this.get(model[this.uniqueId]);
            if(item) {
                item.clear();
                item.set(model.toObject());
                return;
            }

            model.collection = this;
            this.models.push(model);
            this.length += 1;
        },
        _removeItem: function (model) {
            var key;
            if(model instanceof Model) {
                key = model[this.uniqueId];
            } else {
                key = model; // Expect value
            }

            var item = this.get(key);
            var index = this.models.indexOf(item);

            this.models.splice(index, 1);
            return item;
        }
    });

    // Add Lo-Dash functions to Collection
    var methods = ['forEach', 'map', 'difference', 'findIndex', 'findLastIndex', 'first',
        'indexOf', 'initial', 'intersection', 'last', 'lastIndexOf', 'rest', 'union',
        'uniq', 'contains', 'countBy', 'every', 'filter', 'find', 'findLast', 'forEachRight',
        'groupBy', 'indexBy', 'invoke', 'max', 'min', 'pluck', 'reduce', 'reduceRight',
        'reject', 'sample', 'shuffle', 'some', 'sortBy', 'toArray', 'where'];
    _.forEach(methods, function(method) {
        Collection.prototype[method] = function() {
            var args = slice.call(arguments);
            args.unshift(this.models);
            return _[method].apply(_, args);
        };
    });

    // View needs to be in a constructor for items to inherit. Can this be changed???
    var View = Simplex.View = function(options) {
        this._sid = _.uniqueId('s');
        options || (options = {});
        _.assign(this, options);
        // Used to save initial options. Used for item views to inherit parent options
        this._options = options;

        // Set defaults
        //this.retainState || (this.retainState = false);
        this.initialize.apply(this, arguments);
    };
    _.assign(View.prototype, Events);
    _.assign(View.prototype, {
        initialize: function() {},
        $: function(selector) {
            return this.$el.find(selector);
        },
        renderToRegion: function(region) {
            if(this.template.charAt(0) === '#') {
                this.template = region.$(this.template).html();
            }

            this.trigger('onShow', this);
            if(this.onShow) {
                this.onShow();
            }

            this.region = region;
            this.$el = region.$el;
            this.$el.html(this.template);

            this._processDataBindings();

            this.trigger('showed', this);
            if(this.showed) {
                this.showed();
            }
        },
        renderViewItems: function($el, items) {
            var view = this, region;
            // Check if sx-region is defined on template
            if(!!$el.attr('sx-region')) {
                var regionName = $el.attr('sx-region');

                if(!view[regionName]) {
                    view[regionName] = new Simplex.Region($el, view.region.$);
                }
                region = view[regionName];
            } else {
                region = new Simplex.Region($el, view.region.$);
            }

            var options = view._getSortOrFilterParam($el.attr('sx-items-options'));

            var template = $el.html();
            $el.html('');

            var inheritedParentViewOption = _.assign(view._options, {
                parent: view,
                template: template
            });

            var ItemView = Simplex.View.extend(inheritedParentViewOption);

            // Now sort and filter before rendering
            if(items instanceof Simplex.Collection) {
                bindViewCollectionChange(view, region, items, ItemView, options);
            }
            else {
                bindViewArrayChange(view, region, items, ItemView, options);
            }
        },
        appendToRegion: function(region) {
            this.trigger('onShow', this);
            if(this.onShow) {
                this.onShow();
            }

            this.region = region;
            this.$el = region.$(this.template);
            region.$el.append(this.$el);
            this._processDataBindings(true);

            this.trigger('showed', this);
            if(this.showed) {
                this.showed();
            }
        },
        _processDataBindings: function() {
            var view = this;
            // addBack will include top level elements
            var elWithData = view.$el.find('*').addBack('*');
            // Remove elements that is under a data-items element
            elWithData = elWithData.not(view.$el.find('[sx-items] *'));

            _.forEach(elWithData, function(el) {
                var attr, attrCtr, source, value, key, split, splitCtr, splitLen,
                    attrLen = el.attributes.length,
                    $el = view.region.$(el);

                // TODO: Refactor the priority attr
                if($el.attr('sx-id')) {
                    value = $el.attr('sx-id');
                    split = value.split('.');
                    source = view;

                    if(split.length === 1) {
                        key = split[0];
                    }
                    else {
                        splitLen = split.length - 1; // Skip last. Use as key

                        for(splitCtr = 0; splitCtr < splitLen; splitCtr += 1) {
                            source = source[split[splitCtr]];
                        }

                        key = split[splitLen];
                    }

                    source[key] = $el;
                }
                if($el.attr('sx-region')) {
                    value = $el.attr('sx-region');
                    split = value.split('.');
                    source = view;

                    if(split.length === 1) {
                        key = split[0];
                    }
                    else {
                        splitLen = split.length - 1; // Skip last. Use as key

                        for(splitCtr = 0; splitCtr < splitLen; splitCtr += 1) {
                            source = source[split[splitCtr]];
                        }

                        key = split[splitLen];
                    }

                    source[key] = new Simplex.Region($el, view.region.$);;
                }

                for(attrCtr = 0; attrCtr < attrLen; ++attrCtr) {
                    if(!regxSimplexPrefix.test(el.attributes[attrCtr].name)) {
                        continue;
                    }

                    attr = el.attributes[attrCtr].name.substr(3);
                    value = el.attributes[attrCtr].value;
                    split = value.split('.');
                    source = view;

                    if(split.length === 1) {
                        key = split[0];
                    }
                    else {
                        splitLen = split.length - 1; // Skip last. Use as key

                        for(splitCtr = 0; splitCtr < splitLen; splitCtr += 1) {
                            source = source[split[splitCtr]];
                        }

                        key = split[splitLen];
                    }

                    // If priority attr then continue
                    if(attr === 'id' || attr === 'region') {
                        continue;
                    }

                    // Do nothing if source does not exist
                    if(source === undefined) { continue; }
                    // Get source value
                    value = source instanceof Model ? source.get(key) : source[key];

                    switch (attr) {
                        case 'value':
                            if(_.isFunction(value)) {
                                value = value.call(view);
                            }

                            if(el.nodeName === 'INPUT') {
                                $el.val(value);
                                if(source instanceof Model) {
                                    domBindWrapper_val(view, $el, source, key);
                                }
                            }
                            else {
                                $el.html(value);
                                if(source instanceof Model) {
                                    domBindWrapper_html(view, $el, source, key);
                                }
                            }
                            break;
                        case 'items':
                            view.renderViewItems($el, value);
                            break;
                        case 'items-options': break;
                        default:
                            if(isHtmlEvent(attr)) {
                                // Set DOM event
                                $el.on(attr.substr(2), domEventWrapper(view, value));
                            } else {
                                if(_.isFunction(value)) {
                                    value = value.call(view);
                                }

                                // Set element attribute
                                $el.attr(attr, value);
                                if(source instanceof Model) {
                                    domBindWrapper_attr(view, $el, source, key, attr);
                                }
                            }
                            break;
                    }
                }
            });
        },
        _getSortOrFilterParam: function(value) {
            if(!value) {
                return null;
            }

            if(value.substr(0, 5) === 'item.') {
                return value.substr(5);
            }

            var key, splitLen, splitCtr,
                source = this,
                split = value.split('.');

            if(split.length === 1) {
                key = split[0];
            }
            else {
                splitLen = split.length - 1; // Skip last. Use as key

                for(splitCtr = 0; splitCtr < splitLen; splitCtr += 1) {
                    source = source[split[splitCtr]];
                }

                key = split[splitLen];
            }

            // Return null if source or target value does not exist
            if(!source || !source[key]) {
                return null;
            }

            return source[key];
        },
        _close: function() {
            this.trigger('onClose', this);
            if(this.onClose) {
                this.onClose();
            }

            // TODO: view cleanup here

            this.trigger('closed', this);
            if(this.closed) {
                this.closed();
            }

            this.stopListening();
        }
    });

    function bindViewCollectionChange(view, region, collection, ItemView, options) {
        renderCollectionItems(region, collection, ItemView, options);

        if(options) {
            view.when(options, 'update', function() {
                renderCollectionItems(region, collection, ItemView, options);
            });
        }

        view.when(collection, 'change', function() {
            renderCollectionItems(region, collection, ItemView, options);
        });
    }
    function bindViewArrayChange(view, region, items, ItemView, options) {
        renderArrayItems(region, items, ItemView, options);

        if(options) {
            view.when(options, 'update', function() {
                renderArrayItems(region, items, ItemView, options);
            });
        }
    }
    function renderCollectionItems(region, collection, ItemView, options) {
        var items;

        if(options) {
            items = collection.select(options.filter, options.sort, options.dir);
        } else {
            items = collection.models;
        }

        region.$el.html('');

        _.forEach(items, function (item) {
            var itemView = new ItemView({ item: item });
            region.append(itemView);
        });
    }
    function renderArrayItems(region, items, ItemView, options) {
        if(options) {
            if(options.sort) {
                items = _.sortBy(items, options.sort);
            }

            if(options.filter) {
                items = _.where(items, options.filter);
            }
        }

        region.$el.html('');

        _.forEach(items, function (item) {
            var itemView = new ItemView({ item: item });
            region.append(itemView);
        });
    }
    function domEventWrapper(context, callback) {
        return function(jQueryEvent) {
            callback.call(context, jQueryEvent);
        };
    }
    function domBindWrapper_val(view, $el, model, key) {
        view.when(model, 'update', function() {
            $el.val(model.get(key));
        });
    }
    function domBindWrapper_html(view, $el, model, key) {
        view.when(model, 'update', function() {
            $el.html(model.get(key));
        });
    }
    function domBindWrapper_attr(view, $el, model, key, attr) {
        view.when(model, 'update', function() {
            $el.attr(attr, model.get(key));
        });
    }

    var Region = Simplex.Region = function(el, jQuery) {
        this._sid = _.uniqueId('s');
        this.views = [];
        this.$ = jQuery || $; // Use var jQuery if supplied

        // Convert el string to jQuery else expect jQuery object
        if(_.isString(el)) {
            this.$el = this.$(el);
        } else {
            this.$el = el;
        }
    };
    _.assign(Region.prototype, Events);
    _.assign(Region.prototype, {
        show: function(view) {
            this.trigger('onShow', view);
            if(this.onShow) {
                this.onShow();
            }

            view.renderToRegion(this);
            this.views.push(view);

            this.trigger('showed', view);
            if(this.showed) {
                this.showed();
            }
        },
        close: function(view) {
            this.trigger('onClose');
            if(this.onClose) {
                this.onClose();
            }

            if(view) {
                if(_.isString(view)) {
                    view = this.get(view);
                }

                view._close();
                _.remove(this.views, function(item) { return item === view; });
            } else {
                var len = this.views.length;
                while(len > 0) {
                    len -= 1;
                    this.views[len]._close();
                }
                this.$el.empty();
                this.views = [];
            }

            this.trigger('closed');
            if(this.closed) {
                this.closed();
            }
        },
        append: function(view) {
            view.appendToRegion(this);
            this.views.push(view);
        },
        get: function(sid) {
            var views = this.views, i, len = views.length;
            for(i = 0; i < len; ++i) {
                if(views[i]._sid === sid) {
                    return views[i];
                }
            }
            return null;
        }
    });

    var Type = Simplex.Type = function(options) {
        options || (options = {});

        if(options.validation) {
            _.assign(options.validation, this.constructor.prototype.validation);
        }

        _.assign(this, options);
    };
    _.assign(Type.prototype, {
        escaped: true,
        validate: function(val) {
            var err = {};
            if(!this.validation) {
                return {};
            }

            _.forEach(this.validation, function(fn, key) {
                var res = fn(val);
                // Add error message to err
                if(res !== true && res !== undefined) {
                    err[key] = res;
                }
            });

            if(_.isEmpty(err) === false) {
                return { valid: false, errors: err };
            }

            return { valid: true };
        }
    });

    var Command = Simplex.Command = function(options) {
        options || (options = {});

        // Default mode
        if(!options.mode) {
            options.mode = 'ajax';
        }

        _.assign(this, options);
    };
    _.assign(Command.prototype, Events);
    _.assign(Command.prototype, {
        run: function(options) {
            var reqType = 'POST',
                data = this.buildArguments(options),
                self = this;

            var result = this.validate(data);
            if(result.valid === false) {
                var validationError = {};
                validationError[this.name] = {
                    error: true,
                    type: 'validation',
                    fields: result.errors
                };
                this.errorHandler(validationError, options);

                return;
            }

            var req = {};
            req[this.name] = data;

            // TODO: Check if there is a way to determine the limit
            // Determine if request can be safely made with GET else use POST
            /*if(jsonReq.length < 255) {
             var temp = encodeURIComponent(jsonReq);
             if(temp.length <= 255) {
             jsonReq = temp;
             reqType = 'GET';
             }
             }*/

            $.ajax({
                type: reqType,
                url: this.url,
                data: JSON.stringify(req),
                contentType: 'application/json',
                dataType: 'json',
                success: function(data) {
                    self.successHandler(data, options);
                },
                failure: function(err) {
                    self.errorHandler(err);
                }
            });
        },
        validate: function (data) {
            var errors = {},
                addError = function(field, validationName, message) {
                    if(!errors[field]) {
                        errors[field] = {};
                    }

                    errors[field][validationName] = message;
                };

            _.forEach(this.parameters, function(param, key) {
                var val = data[key];

                if(param.required && (_.isUndefined(val) || trim(val) === '')) {
                    addError(key, 'required', 'Required.');
                }
                if(param instanceof  Type) {
                    var result = param.validate(val);

                    if(result.valid === false) {
                        _.forEach(result.errors, function(err, validationName) {
                            addError(key, validationName, err);
                        });
                    }
                }
            });

            if(_.isEmpty(errors) === false) {
                return { valid: false, errors: errors };
            }

            return { valid: true };
        },
        buildArguments: function (options) {
            if(!options || !options.data) {
                return {};
            }

            var args;

            if(options.map) {
                // Map data to command parameters
                if(options.data instanceof Model) {
                    args = this.map(options.data.toObject(), options.map);
                } else {
                    args = this.map(options.data, options.map);
                }
            }
            else {
                // Get raw values
                if(options.data instanceof Model) {
                    args = options.data.toObject();
                } else {
                    args = options.data;
                }
            }

            return args;
        },
        map: function(data, map) {
            var attr, obj = {};
            for(attr in data) {
                if(map[attr]) {
                    obj[map[attr]] = data[attr]; // change to map name
                } else {
                    obj[attr] = data[attr];
                }
            }
            return obj;
        },
        successHandler: function(data, options) {
            if(options.success) {
                options.success(data[this.name]);
            }

            // Trigger events
            if(this.parent) { // Server added commands will be communicated by commands collection
                this.parent._dispatchEvents(data);
            } else {
                this.trigger('success', data[this.name]);
            }

        },
        errorHandler: function(err, options) {
            // TODO: Figure out how to differentiate server and network error
            if(options.error) {
                options.error(err[this.name]);
            }

            // Trigger error events
            if(this.parent) {
                this.parent._dispatchEvents(err);
            } else {
                this.trigger('error', err[this.name]);
            }
        }
    });

    var Commands = Simplex.Commands = function(options) {
        options || (options = {});

        // Default mode
        if(!options.mode) {
            options.mode = 'ajax';
        }

        _.assign(this, options);

        var cmdOptions = {
            parent: this,
            url: this.url,
            mode: options.mode
        };

        if(options.successHandler) {
            cmdOptions.successHandler = options.successHandler;
        }
        if(options.errorHandler) {
            cmdOptions.errorHandler = options.errorHandler;
        }

        this.Command = Command.extend(cmdOptions);
    };
    _.assign(Commands.prototype, Events);
    _.assign(Commands.prototype, {
        add: function(name, url, params) {
            // Shift params if url is not defined
            if(_.isObject(url)) {
                params = url;
                url = null;
            }

            var cmd = {
                parameters: params,
                name: name
            };

            if(url) {
                cmd.url = url;
            }

            this[name] = new this.Command(cmd);
        },
        remove: function(name) {
            // Only remove commands that exists and non-inherited
            if(!this[name] || !this.hasOwnProperty(name)) {
                return;
            }

            delete this[name];
            return this;
        },
        run: function(commands, options) {
            var cmdName,
                cmd,
                cmdOptions,
                req = {},
                valid,
                validationError = {};

            // Build request
            for(cmdName in commands) {
                cmdOptions = commands[cmdName];
                cmd = this[cmdName];
                valid = cmd.validate(cmdOptions.data);
                if(valid.valid === false) {
                    validationError[cmd.name] = {
                        error: true,
                        type: 'validation',
                        fields: valid.errors
                    };
                }
                else {
                    req[cmd.name] = cmd.buildArguments(cmdOptions);
                }
            }

            if(_.isEmpty(validationError) === false) {
                this.errorHandler(validationError, commands, options);
                return;
            }

            var reqType = 'POST',
                self = this;

            $.ajax({
                type: reqType,
                url: this.url,
                data: JSON.stringify(req),
                contentType: 'application/json',
                dataType: 'json',
                success: function(data) {
                    self.successHandler(data, commands, options);
                },
                failure: function(err) {
                    self.errorHandler(err, commands, options);
                }
            });
        },
        delayedRun: function(commands, options) {

        },
        _dispatchEvents: function (data) {
            var key, event;

            for(key in data) {
                // Make sure command exist
                if(!this[key] || this[key] instanceof Command === false) {
                    continue;
                }

                if(data[key].error === true) {
                    event = 'error';
                } else {
                    event = 'success';
                }

                // Trigger command event
                this[key].trigger(event, data[key]);
                // Trigger commands events
                this.trigger(event, data[key], key);
                this.trigger(event + ':' + key, data[key]);
            }
            this.trigger('all' + key, data);
        },
        successHandler: function(data, commands, options) {
            if(options.success) {
                options.success(data);
            }

            // Call success of command options
            var key;
            for(key in data) {
                if(data[key].error === true) {
                    if (commands[key] && commands[key].error) {
                        commands[key].error(data[key]);
                    }
                }
                else {
                    if (commands[key] && commands[key].success) {
                        commands[key].success(data[key]);
                    }
                }
            }

            this._dispatchEvents(data);
        },
        errorHandler: function(err, commands, options) {
            // TODO: Figure out how to differentiate server and network error
            if(options.error) {
                options.error(err);
            }

            // Call success of command options
            var key;
            for(key in err) {
                if(commands[key] && commands[key].error) {
                    commands[key].error(err[key]);
                }
            }

            // Trigger error events
            this._dispatchEvents(err);
        }
    });

    // Helper function to correctly set up the prototype chain, for subclasses.
    // Similar to `goog.inherits`, but uses a hash of prototype properties and
    // class properties to be extended.
    var extend = function(protoProps, staticProps) {
        var parent = this;
        var child;

        // The constructor function for the new subclass is either defined by you
        // (the 'constructor' property in your `extend` definition), or defaulted
        // by us to simply call the parent's constructor.
        if (protoProps && _.has(protoProps, 'constructor')) {
            child = protoProps.constructor;
        } else {
            child = function(){ return parent.apply(this, arguments); };
        }

        // Add static properties to the constructor function, if supplied.
        _.assign(child, _.assign(parent, staticProps));

        // Set the prototype chain to inherit from `parent`, without calling
        // `parent`'s constructor function.
        var Surrogate = function(){ this.constructor = child; };
        Surrogate.prototype = parent.prototype;
        child.prototype = new Surrogate;

        // Add prototype properties (instance properties) to the subclass,
        // if supplied.
        if (protoProps) {
            _.assign(child.prototype, protoProps);
        }

        // Set a convenience property in case the parent's prototype is needed
        // later.
        child.__super__ = parent.prototype;

        return child;
    };

    Model.extend = Collection.extend = View.extend = Region.extend = Command.extend = extend;

    // Handle for Type to combine parent validation with supplied validation
    Type.extend = function(protoProps, staticProps) {
        if(protoProps.validation) {
            _.assign(protoProps.validation, this.prototype.validation);
        }

        return extend.call(this, protoProps, staticProps);
    };

    function isHtmlEvent(name) {
        switch (name) {
            case 'onkeydown':
            case 'onkeypress':
            case 'onkeyup':
            // -- Form Events
            case 'onblur':
            case 'onchange':
            case 'oncontextmenu':   // HTML5
            case 'onfocus':
            case 'onformchange':
            case 'onforminput':
            case 'oninput':
            case 'oninvalid':
            case 'onselect':
            case 'onsubmit':
            // -- Mouse Events
            case 'onclick':
            case 'ondblclick':
            case 'ondrag':
            case 'ondragend':
            case 'ondragenter':
            case 'ondragleave':
            case 'ondragover':
            case 'ondragstart':
            case 'ondrop':
            case 'onmousedown':
            case 'onmousemove':
            case 'onmouseout':
            case 'onmouseover':
            case 'onmousewheel':
            case 'onscroll':
            // Media Events
            case 'onabort':
            case 'oncanplay':
            case 'oncanplaythrough':
            case 'ondurationchange':
            case 'onemptied':
            case 'onended':
            case 'onerror':
            case 'onloadeddata':
            case 'onloadedmetadata':
            case 'onloadstart':
            case 'onpause':
            case 'onplay':
            case 'onplaying':
            case 'onprogress':
            case 'onratechange':
            case 'onreadystatechange':
            case 'onseeked':
            case 'onseeking':
            case 'onstalled':
            case 'onsuspend':
            case 'ontimeupdate':
            case 'onvolumechange':
            case 'onwaiting':
                return true;
        }
        return false;
    }
}).call(this);