(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * This file is part of the Nodium core package
 *
 * (c) Niko van Meurs & Sid Mijnders
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/**
 * @author Niko van Meurs <nikovanmeurs@gmail.com>
 * @author Sid Mijnders
 */
 (function (window, undefined) {

    window.Nodium = require('./nodium');
    
}(window));
},{"./nodium":2}],2:[function(require,module,exports){
(function (global){
module.exports = (function (context) {
    var _      = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null),
        d3     = (typeof window !== "undefined" ? window.d3 : typeof global !== "undefined" ? global.d3 : null),
        jQuery = (typeof window !== "undefined" ? window.$ : typeof global !== "undefined" ? global.$ : null);

    this.app = {
        context: {
            _:      _,
            d3:     d3,
            jQuery: jQuery
        }
    };

/**
 * This file is part of the Nodium core package
 *
 * (c) Niko van Meurs & Sid Mijnders
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/**
 * @author Niko van Meurs <nikovanmeurs@gmail.com>
 */
 (function (context, undefined) {

    /**
     * Sets the current namespace
     * @param string namespace
     * @return object
     */
    context.setNamespace = function (namespace) {

        // declare variables
        var namespaceCompenents = namespace.split("."),
            parent              = context,
            component,
            i,
            length;

        // loop through namespaceComponents and create new sub-objects for each component
        for (i = 0, length = namespaceCompenents.length; i < length; i++) {

            component           = namespaceCompenents[i];
            parent[component]   = parent[component] || {};
            parent              = parent[component];
        }

        // return the namespace object
        return parent;
    };

}(this));


/**
 * This file is part of the Nodium core package
 *
 * (c) Niko van Meurs & Sid Mijnders
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/**
 * @author Niko van Meurs <nikovanmeurs@gmail.com>
 */
 (function (context, undefined) {

    /**
     * Returns an object based on a fully qualified classname
     * @param string fullyQualifiedClassName
     * @return mixed
     */
    context.use = function (fullyQualifiedClassName) {

        var components = fullyQualifiedClassName.split('.'),
            parent = context,
            child;

        while (child = components.shift()) {

            parent = parent[child] || {};
        }

        return parent;
    };
}(this));


/**
 * This file is part of the Nodium core package
 *
 * (c) Niko van Meurs & Sid Mijnders
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/**
 * @author Niko van Meurs <nikovanmeurs@gmail.com>
 */
(function (context, undefined) {

var app                 = context.setNamespace('app');

	// check if window
	if (context.window) {
	    app.clearTimeout    = window.clearTimeout.bind(context),
	    app.setTimeout      = window.setTimeout.bind(context),
	    app.open            = window.open.bind(context);
	}

}(this));
/**
 * This file is part of the Nodium core package
 *
 * (c) Niko van Meurs & Sid Mijnders
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/**
 * @author Niko van Meurs <nikovanmeurs@gmail.com>
 */
(function (context, undefined) {

    var util = context.setNamespace('app.util');

    /**
     * Used to retrieve a function with name functionName from a superClass's prototype object
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/getPrototypeOf|Object.getPrototypeOf()}
     * @param {String} functionName
     * @returns {Function}
     */
    util.super = function (functionName) {

        var prototype = Object.getPrototypeOf(Object.getPrototypeOf(this)),
            functionName,
            args;

        args = [].slice.call(arguments, 1);

        if (prototype.hasOwnProperty(functionName)) {
            return prototype[functionName].apply(this, args);
        }
    };
}(this));

/**
 * This file is part of the Nodium core package
 *
 * (c) Niko van Meurs & Sid Mijnders
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/**
 * @author Niko van Meurs <nikovanmeurs@gmail.com>
 * @author Sid Mijnders
 */
 (function (context, undefined) {

    var util    = context.setNamespace('app.util'),
        app     = context.use('app'),
        superFn = context.use('app.util.super');

    var _shouldConstructSuper = false;

    /**
     * Creates a class constructor
     * @param {Function} [SuperClass]
     * @param {Object} prototype
     */
    app.createClass = function () {

        var Constructor,
            SuperClass,
            prototype,
            props,
            p,
            args;

        args = [].slice.call(arguments, 0);

        if (typeof args[0] === 'function') {
            SuperClass = args.shift();
        }

        props = args.shift();

        /**
         * The class constructor
         * @constructor
         */
        Constructor = function () {
            
            if (false === (this instanceof Constructor)) {
                return new Constructor(arguments);
            }

            // Super constructor should be called if this class doesn't have its own construct function
            if (!Object.getPrototypeOf(this).hasOwnProperty('construct')) {
                _shouldConstructSuper = true;
            }

            // Call construct throughout the prototype chain
            if (this.construct && typeof this.construct === 'function') {

                var args = [].slice.call(arguments, 0);

                args.unshift('construct');
                this.super.apply(this, args);

                if (!_shouldConstructSuper) {
                    this.construct.apply(this, args.slice(1));
                }
            }
            _shouldConstructSuper = false;
        };

        // Construct the prototype
        if (null != SuperClass) {
            _shouldConstructSuper = true;
            prototype = new SuperClass();

            for (p in props) {

                if (props.hasOwnProperty(p)) {
                    prototype[p] = props[p];
                }
            }
        } else {
            // Add super to the prototype chain if SuperClass is undefined
            props.super = superFn;
        }

        Constructor.prototype = prototype || props;

        return Constructor;
    };
}(this));


/**
 * This file is part of the Nodium core package
 *
 * (c) Niko van Meurs & Sid Mijnders
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/**
 * @author Niko van Meurs <nikovanmeurs@gmail.com>
 */
(function (context, undefined) {

    var util = context.setNamespace('app.util');

    /**
     * Returns a HTML string composed from the view's data-prototype and initialized with params
     * @param {jQuery} view
     * @param {Object} parameters
     * returns {String}
     */
    function createFromPrototype (view, parameters) {

        var prototype = view.data('prototype');

        return util.stringFromTemplate(prototype, parameters);
    }

    util.createFromPrototype = createFromPrototype;
}(this));
/**
 * This file is part of the Nodium Core package
 *
 * (c) StarApple B.V. <developers@starapple.nl>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/**
 * @author Sid Mijnders <sid@starapple.nl>
 */
 (function (context, undefined) {

    /**
     * Try to get a function from a namespace
     */
    context.getFunction = function (functionPath) {

        var components = functionPath.split('.'),
            parent = context,
            child;

        while (child = components.shift()) {
            if (!parent[child]) {
                return null;
            }

            parent = parent[child];
        }

        if (typeof(parent) === 'function') {
            return parent;
        } else {
            return null;
        }
    };
}(this));


/**
 * This file is part of the Nodium Core package
 *
 * (c) StarApple B.V. <developers@starapple.nl>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/**
 * @author Sid Mijnders <sid@starapple.nl>
 */
 (function (context, undefined) {

    /**
     */
    context.getObjectValueByPath = function (obj, path) {

        var array = context.getPathArray(path),
            key;

        while (array.length) {
            key = array.shift();
            if (key in obj) {
                obj = obj[key];
            } else {
                return;
            }
        }
        return obj;
    };

}(this));

/**
 * This file is part of the Nodium core package
 *
 * (c) Niko van Meurs & Sid Mijnders
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/**
 * @author Sid Mijnders <sid@starapple.nl>
 */
 (function (context, undefined) {

    /**
     * Note: if an array is passed, this returns a reference to this same array
     */
    context.getPathArray = function (path) {

        var array;

        if (typeof path === 'string') {
            // convert indexes to properties
            path = path.replace(/\[(\w+)\]/g, '.$1');

            // strip a leading dot
            path = path.replace(/^\./, '');

            array = path.split('.');
        } else {
            array = path;
        }

        return array;
    };
}(this));


/**
 * This file is part of the Nodium core package
 *
 * (c) Niko van Meurs & Sid Mijnders
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/**
 * @author Sid Mijnders <sid@starapple.nl>
 */
 (function (context, undefined) {

    /**
     * @deprecated
     */
    context.partial = function (fn, scope) {
        var slice  = Array.prototype.slice,
            concat = Array.prototype.concat,
            args;

        if (scope) {
            args = slice.call(arguments, 2);
        } else {
            args = slice.call(arguments, 1);
        }

        // flatten the arguments
        args = concat.apply([], args);

        scope = scope || context;
      
        return function () {
            return fn.apply(scope, args.concat(slice.call(arguments)));
        };
    };
}(this));


/**
 * This file is part of the Nodium core package
 *
 * (c) Niko van Meurs & Sid Mijnders
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/**
 * @author Sid Mijnders <sid@starapple.nl>
 */
 (function (context, undefined) {

    /**
     * there are several options:
     *   value is passed or undefined
     *   path points to an array or object
     *
     * If value is defined
     *   array: find the value in the array and splice
     *   object: ??? // throws error for now, maybe some sort of key-value check?
     *
     * If value is undefined
     *   array: path should end in an index; remove the element at index
     *   object: path should end in a key; delete the key
     */
    context.removeByPath = function (obj, path, value) {

        var array = context.getPathArray(path),
            key,
            depth = value === undefined ? array.length - 1 : array.length;

        for (;depth;depth--) {
            key = array.shift();
            if (key in obj) {
                obj = obj[key];
            } else {
                return false;
            }
        }

        if (value === undefined) {

            // array contains final key
            key = array.shift();

            if (Array.isArray(obj)) {

                // we need an int
                key = parseInt(key, 10);
                if (isNaN(key)) {
                    return false;
                }

                obj.splice(key, 1);
                return true;
            } else if (typeof obj === 'object') {
                delete obj[key];
                return true;
            } else {
                return false;
            }
        } else {
            if (Array.isArray(obj)) {
                key = obj.indexOf(value);

                if (key === -1) {
                    return false;
                } else {
                    obj.splice(key, 1);
                    return true;
                }
            } else if (typeof obj === 'object') {
                throw 'Cannot remove value from object';
                return false;
            } else {
                throw 'Cannot remove value from this type';
                return false;
            }
        }  
    };
}(this));

/**
 * This file is part of the Nodium core package
 *
 * (c) Niko van Meurs & Sid Mijnders
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/**
 * @author Niko van Meurs <nikovanmeurs@gmail.com>
 * @author Sid Mijnders <sid@starapple.nl>
 */
 (function (context, undefined) {

    /**
     * Path can be an array or a string
     * Array indices are expected as integers
     * If an index is given but the array doesn't exist, a subobject will be created
     * If the found subobject is an array, the value will be pushed onto it
     */
    context.setByPath = function (obj, path, value) {

        var array = context.getPathArray(path),
            key,
            newKey = false;

        while (array.length - 1) {
            key = array.shift();
            if (!(key in obj)) {
                newKey = true;
                obj[key] = {};
            }
            obj = obj[key];
        }

        key = array.shift();
        if (!(key in obj)) {
            newKey = true;
        }

        if (Array.isArray(obj)) {
            key = parseInt(key, 10);
            if (isNaN(key)) {
                return false;
            }

            if (key === -1) {
                obj.push(value);
            } else {
                obj.splice(key, 0, value);
            }
        } else if (typeof obj === 'object') {
            obj[key] = value;
        } else {
            throw 'Cannot remove value from this type';
            return false;
        }

        return newKey;
    };

}(this));

/**
 * This file is part of the Nodium core package
 *
 * (c) Niko van Meurs & Sid Mijnders
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/**
 * @author Niko van Meurs <nikovanmeurs@gmail.com>
 */
(function (context, _, undefined) {

    var util = context.setNamespace('app.util');

    /**
     * Creates a string by replacing the params in template
     * @param {String} template
     * @param {Object} params
     * returns {String}
     */
    function stringFromTemplate (template, params) {

        return _.reduce(params, replace, template);
    }

    /**
     * Replaces {needle} with value in haystack
     * @param {String} haystack
     * @param {*} value
     * @param {String} needle
     * @returns {String}
     */
    function replace (haystack, value, needle) {
        return haystack.replace(new RegExp('\{' + needle + '\}', 'g'), value);
    };

    util.stringFromTemplate = stringFromTemplate;
}(this, _));
/**
 * This file is part of the Nodium core package
 *
 * (c) Niko van Meurs & Sid Mijnders
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/**
 * @author Niko van Meurs <nikovanmeurs@gmail.com>
 */
(function (context, undefined) {

    var util = context.setNamespace('app.util');

    /**
     * @returns {String}
     */
    util.uuid = function () {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random()*16|0,
                v = c == 'x' ? r : (r&0x3|0x8);
            return v.toString(16);
        });
    };
}(this));

(function (context, undefined) {
	var event = context.setNamespace('app.event'),
		DragEvent;

	DragEvent = {
		START: 'drag-start',
		DRAG: 'drag',
		END: 'drag-end'
	};

	event.DragEvent = DragEvent;
}(this));

(function (context, undefined) {
	var event = context.setNamespace('app.event'),
		EdgeEvent;

	EdgeEvent = {
		CREATE: 'edge-create',
		REPLACE: 'edge-replace',
		UPDATE: 'edge-update',
		DESTROY: 'edge-delete',
		SELECT: 'edge-select',
		UNSELECT: 'edge-unselect',
		CREATED: 'edge-created',
		REPLACED: 'edge-replaced',
		UPDATED: 'edge-updated',
		DESTROYED: 'edge-destroyed',
		SELECTED: 'edge-selected',
		UNSELECTED: 'edge-unselected',
		DRAWN: 'edge-drawn',
		MODECHANGE: 'edge-mode-change',
		MODECHANGED: 'edge-mode-change'
	};

	event.EdgeEvent = EdgeEvent;
}(this));

(function (context, undefined) {

    // 'use strict';

    var event = context.setNamespace('app.event');

    const Event = {
        CHANGE:     'change',
        CLICK:      'click',
        FOCUS_OUT:  'focusout',
        INPUT:      'input',
        KEY_DOWN:   'keydown',
        KEY_UP:     'keyup',
        MOUSE_DOWN: 'mousedown',
        MOUSE_DRAG: 'mousedrag',
        MOUSE_MOVE: 'mousemove',
        MOUSE_UP:   'mouseup',
        PASTE:      'paste',
        POP_STATE:  'popstate',
        SCROLL:     'scroll',
        SUBMIT:     'submit'
    };

    event.Event = Event;

}(this));
(function (context, $, undefined){

var event   = context.setNamespace('app.event'),
    app     = context.use('app'),
    toCamelCase = function (dashedString) {
        return dashedString.replace(/-([a-z])/g, function (g) {
            return g[1].toUpperCase();
        });
    };

event.EventAware = app.createClass({

    construct: function () {

        this.events = [];
    },

    destroy: function () {

        var i;

        for (i = this.events.length; i > 0; i--) {

            this.off.apply(this, this.events[i - 1]);
        }
    },

    off: function () {

        var args     = Array.prototype.slice.call(arguments, 0),
            eventName,
            selector,
            target;

        if (args.length > 1) {
            selector    = args.shift();
        }

        target = this.resolveSelector();
        target.off.apply(target, args);

        index = this.events.indexOf(args);

        if (-1 !== index) {
            this.events = this.events.splice(index, 1);
        }

        return this;
    },

    on: function (callbackOwner) {
        var args        = Array.prototype.slice.call(arguments, 1),
            eventName,
            selector,
            target;

        if (args.length > 1) {
            selector = args.shift();
        }

        eventName = args[0];


        args.push(this.resolveEvent(eventName, callbackOwner));

        target = this.resolveSelector(selector);
        target.on.apply(target, args);

        this.events.push(args.unshift(selector));

        return this;
    },

    resolveEvent: function (eventName, target) {
        var fn,
            functionName = toCamelCase([
                'handle',
                eventName
            ].join('-'));

        fn = target[functionName];

        if (fn && 'function' === typeof fn) {
            return fn.bind(target);
        } else {
            throw new Error('Could not resolve ' + eventName + ' to function.');
        }
    },

    resolveSelector: function (selector) {

        return $(this);
    }
});

}(this, jQuery));

(function (context, undefined) {
	var event = context.setNamespace('app.event'),
		HoldEvent;

	HoldEvent = {
		NODE: 'holding-node',
		CANVAS: 'holding-canvas',
		DRAGDOWN: 'hold-drag-down',
		DRAGUP: 'hold-drag-up',
		DRAGLEFT: 'hold-drag-left',
		DRAGRIGHT: 'hold-drag-right'
	};

	event.HoldEvent = HoldEvent;
}(this));

(function (context, $, d3, _, undefined) {

'use strict';

var event       = context.setNamespace('app.event'),
    EventAware  = context.use('app.event.EventAware'),
    app         = context.use('app');

event.Kernel = app.createClass(EventAware, {

    /**
     * Register a module to the kernel
     */
    register: function (module, events) {

        module.kernel = this;

        if (events) {
            this.attachModuleEvents(module, events);
        }

        if (typeof module.initialize === "function") {
            module.initialize();
        }

        return this;
    },

    attachModuleEvents: function (module, events) {

        var e,
            key,
            value,
            func,
            args = [];

        for (var i = 0; i < events.length; i++) {
            e = events[i];
            key = e[0];

            if (!key) {
                continue;
            }

            value = e.slice(1);
            args = value.slice(1);
            value = value[0];

            if (!value) {
                continue;
            }

            // try to either get the function from the module or from the full name
            if (module[value] && typeof(module[value]) === "function") {
                func = module[value];
            } else {
                func = context.getFunction(value);
            }

            if (func) {
                $(this).on(key, context.partial(func, module, args));
            }
        }
    }
});

}(this, jQuery, d3, _));

(function (context, undefined) {
	var event = context.setNamespace('app.event');

	const KeyboardEvent = {
		ESCAPE: 'key-escape',
	};

	event.KeyboardEvent = KeyboardEvent;
}(this));

(function (context, undefined) {
	var event = context.setNamespace('app.event');

	const NodeEvent = {
		CREATE: 'node-create',
		UPDATE: 'node-update',
		UPDATEPROPERTY: 'node-update-property',
		UPDATELABEL: 'node-update-label',
		DESTROY: 'node-delete',
		SELECT: 'node-select',
		UNSELECT: 'node-unselect',
		CREATED: 'node-created',
		UPDATED: 'node-updated',
		UPDATEDPROPERTY: 'node-updated-property',
		UPDATEDLABEL: 'node-updated-label',
		DESTROYED: 'node-destroyed',
		SELECTED: 'node-selected',
		UNSELECTED: 'node-unselected',
		FILTER: 'node-filter',
		FILTERED: 'node-filtered',
		FILTER_UNSET: 'node-filter-unset',
		DRAWN: 'node-drawn',
		LOADED: 'graph-loaded'
	};

	event.NodeEvent = NodeEvent;
}(this));

(function (context, _, undefined) {
    var model = context.setNamespace('app.model');

    const
        idPath          = '_id',
        labelsPath      = '_labels',
        propertiesPath  = '_properties',
        shapePath       = '_shape';

    model.Node = {

        create: function (properties, labels, id) {

            var node = {};

            // TODO use setters from util for this
            node[propertiesPath] = properties || {};
            node[labelsPath] = labels || [];
            node[idPath] = id === undefined ? _.uniqueId() : id; // force id usage

            // console.log('CREATING NODE');
            // console.log(node);

            return node;
        },

        getId: function (data) {

            return context.getObjectValueByPath(data, idPath);
        },

        getIdPath: function () {

            return idPath;
        },

        getLabelsPath: function (index) {

            var path = labelsPath;

            if (index) {
                path += '.' + index;
            }

            return path;
        },

        getPropertiesPath: function (property) {

            var path = propertiesPath;

            if (property) {
                path += '.' + property;
            }

            return path;
        },

        /**
         * Return the labels array
         */
        getLabels: function (data) {

            return context.getObjectValueByPath(data, labelsPath);
        },

        /**
         * Return the properties object
         */
        getProperties: function (data) {

            return context.getObjectValueByPath(data, propertiesPath);
        },

        getPropertyValue: function (data, property) {

            var path = this.getPropertiesPath(property);

            return context.getObjectValueByPath(data, path);
        },

        /**
         * Filters this node's edges from the given array
         */
        filterEdges: function (data, edges) {

            var id = this.getId(data);

            return edges.filter(function (edge) {
                var sourceId = this.getId(edge.source);
                var targetId = this.getId(edge.target);
                return sourceId === id || targetId === id;
            }, this);
        },

        hasProperty: function (data, property) {

            var path = this.getPropertiesPath(property);

            return context.getObjectValueByPath(data, path) !== undefined;
        },

        hasPropertyWithValue: function (data, property, value) {

            var path = this.getPropertiesPath(property),
                propertyValue = context.getObjectValueByPath(data, path);

            return value === propertyValue;
        },

        hasLabel: function (data, label) {

            var labels = model.Node.getLabels(data);

            return labels.indexOf(label) !== -1;
        }
    };

}(this, _));
(function (context, _, undefined) {
	
	'use strict';

	var model  = context.setNamespace('app.model'),
		app    = context.use('app');
		
	/** fixed node properties
     *   id path          = '_id'
     *   labels path      = '_labels'
     *   properties path  = '_properties'
     *   mapped path      = '_mapped'
     */

	model.Node2 = app.createClass({

		construct: function (id, properties, mapped, labels, other) {

			// initialize the mandatory properties for Nodium
			this._id         = !id && id !== 0 ? _.uniqueId() : id;
			this._properties = properties || {};
			this._mapped     = mapped || {};
			this._labels     = labels || [];

			// add any other fields
			_.forOwn(other, function (value, key) {
				if (!this.hasOwnProperty(key)) {
					this[key] = value;
				} else {
					throw "node attribute conflict";
				}
			}, this);
		},

		addLabel: function (label) {

			if (!this.hasLabel(label)) {
				this._labels.push(label);
			}

			return this;
		},

		filterEdges: function (edges) {

            return edges.filter(function (edge) {
                var sourceId = edge.source.getId();
                var targetId = edge.target.getId();
                return sourceId === id || targetId === id;
            }, this);
        },

		getId: function () {
			return this._id;
		},

		getLabels: function () {
			return this._labels;
		},

		getProperties: function () {
			return this._properties;
		},

		getProperty: function (property) {
			return this._properties[property];
		},

		getMapped: function () {
			return this._mapped;
		},

		hasLabel: function (label) {
            return _.includes(this.getLabels(), label);
        },

		hasProperty: function (property) {
            return _.has(this.getProperties(), property);
        },

        hasPropertyWithValue: function (property, value) {
            return this.getProperty(property) === value;
        },

        removeLabel: function (label) {

        	return _.remove(this._labels, label);
        },

        /**
         * If value is set, only remove when it has the value
         * @param {String} property
         * @param {Any} value
         * @returns {Boolean}
         */
        removeProperty: function (property, value) {

        	if (value !== undefined && !this.hasPropertyWithValue(property, value)) {
        		return;
        	}

        	var propertyObject = _.pick(this._properties, property);

        	if (delete this._properties[property]) {
				return propertyObject;
			} else {
				return null;
			}
        },

        setLabels: function (labels) {

        	this._labels = labels;

        	return this;
        },

        setProperty: function (property, value) {

        	this._properties[property] = value;

        	return this;
        }
	});

})(this, _);
(function (context, _, undefined) {

'use strict';

var model = context.setNamespace('app.model'),
	Node  = context.use('app.model.Node');

model.Update = app.createClass({

	construct: function () {

		this._set = [];
		this._unset = [];

		// a map of the changes
		this.difference;

		// object with string representations of all (sub)paths
		// that are in the difference array
		this.paths;

		// the number of changes
		this.count;
	},

	/*
	 * Setting and unsetting
	 */

    set: function (path, value) {

    	this._set.push([path, value]);
    },

    unset: function (path, value) {

    	this._unset.push([path, value]);
    },

    /**
     * Replace all properties
     */
    setProperties: function (properties, value) {

    	this.set(Node.getPropertiesPath(), properties);
    },

    /**
     * Set a property value
     */
    setProperty: function (property, value) {

    	this.set(Node.getPropertiesPath(property), value);
    },

    unsetProperty: function (property) {

    	this.unset(Node.getPropertiesPath(property));
    },

    /**
     * Replace all labels
     */
    setLabels: function (labels) {

    	this.set(Node.getLabelsPath(), labels);
    },

    setLabel: function (label) {

    	// Pass index -1 to push
    	this.set(Node.getLabelsPath(-1), label);

    	console.log(this);
    },

    unsetLabel: function (label) {

    	this.unset(Node.getLabelsPath(), label);
    },


    /*
     * Processing and difference
     */


    /**
     * Updates the data with the update directives
     * The reason we use directives is that it allows for more
     * control in some cases. E.g. when you want to set a whole
     * sub-object at once.
     */
    process: function (data) {

        var set = this._set,
            unset = this._unset,
            i,
            directive,
            clone = _.cloneDeep(data),
            deepdiff;

        // we process unset first, so that at least
        // every property in set will be set

        if (unset) {

            for (i = 0; i < unset.length; i++) {
                directive = unset[i];
                context.removeByPath(data, directive[0], directive[1]);
            }
        }

        if (set) {

            for (i = 0; i < set.length; i++) {
                directive = set[i];
                context.setByPath(data, directive[0], directive[1]);
            }
        }

        deepdiff = DeepDiff.diff(clone, data);
        this.prepareDifference(deepdiff);
    },

    /**
     * Creates a difference object with the changes keyed by path
     */
    prepareDifference: function (deepdiff) {

    	var paths = {},
    		subpath,
    		diff,
    		count = 0,
    		i, j;

    	deepdiff = deepdiff || [];
    	this.difference = deepdiff;

    	if (!deepdiff) {
    		this.paths = paths;
    		this.count = 0;
    		return;
    	}

    	for (i = 0; i < deepdiff.length; i++) {

    		diff = deepdiff[i];

    		if (!diff.path) {
    			continue;
    		}

    		subpath = '';

    		for (j = 0; j < diff.path.length; j++) {

    			if (subpath !== '') {
    				subpath += '.';
    			}

    			subpath += diff.path[j];

    			paths[subpath] = 1;
    		}

    		count++;
    	}

    	this.paths = paths;
    	this.count = count;
    },

    /**
     * Checks the difference object for a path
     */
    changed: function (path) {

    	return this.paths.hasOwnProperty(path);
    }

});

}(this, _));
/**
 * This file is part of the Nodium core package
 *
 * (c) Niko van Meurs & Sid Mijnders
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/**
 * @author Niko van Meurs <nikovanmeurs@gmail.com>
 * @author Sid Mijnders
 */
(function (context, $, undefined) {

    'use strict';

    var api         = context.setNamespace('app.api'),
        app         = context.use('app'),
        model       = context.use('app.model'),
        NodeEvent   = context.use('app.event.NodeEvent'),
        EdgeEvent   = context.use('app.event.EdgeEvent');

    /**
     * Binds kernel events to api calls
     * @constructor
     */
    api.APIConsumer = app.createClass({

        construct: function (api) {

            this.api = api;
        },

        initialize: function () {

            // This should be done dynamically depending on which functionality the given api exposes
            $(this.kernel).on(NodeEvent.CREATED, this.handleNodeCreated.bind(this));
            $(this.kernel).on(NodeEvent.DESTROYED, this.handleNodeDeleted.bind(this));
            $(this.kernel).on(EdgeEvent.CREATED, this.handleEdgeCreated.bind(this));
            $(this.kernel).on(EdgeEvent.DESTROYED, this.handleEdgeDeleted.bind(this));
            $(this.kernel).on(NodeEvent.UPDATED, this.handleNodeUpdated.bind(this));
            $(this.kernel).on(NodeEvent.UPDATED, this.handleNodeLabelUpdated.bind(this));
        },

        executeIfExists: function (functionName) {

            var args,
                fn;

            fn = this.api[functionName];

            if ('function' !== typeof fn) {
                return;
            }

            args = arguments.slice(1);

            return fn.apply(this.api, args);
        },

        /**
         * Gets the normalized api content
         * @param {Function} callback
         */
        get: function (callback) {

            this.executeIfExists('getGraph').then(callback);
        },

        /**
         * Triggered by NodeEvent.CREATED
         * @param {Object} event
         * @param {Node} node
         * @param {Object} data
         */
        handleNodeCreated: function (event, node, data) {

            this.executeIfExists('createNode', data);
        },

        /**
         * Triggered by NodeEvent.DELETED
         * @param {Object} event
         * @param {Object} data
         */
        handleNodeDeleted: function (event, data) {

            this.executeIfExists('deleteNode', data);
        },

        /**
         * Triggered by EdgeEvent.CREATED
         * @param {Object} event
         * @param {Object} data
         * @param {Object} source
         * @param {target} target
         */
        handleEdgeCreated: function (event, data, source, target) {

            this.executeIfExists('createEdge', {
                from: source,
                to:   target
            }).then(function (id) {
                data._id = id;
            });
        },

        /**
         * Triggered by EdgeEvent.DELETED
         * @param {Object} event
         * @param {Object} data
         */
        handleEdgeDeleted: function (event, data) {

            this.executeIfExists('deleteEdge', { id: data.id });
        },

        /**
         * Triggered by NodeEvent.UPDATED
         * @param {Object} event
         * @param {Node} node
         * @param {Object} data
         * @param {Update} update
         */
        handleNodeUpdated: function (event, node, data, update) {

            // check if a property was updated
            if (!update.changed(model.Node.getPropertiesPath()) &&
                !update.changed('_style')) {
                
                return;
            }

            this.executeIfExists('updateNode', data);
        },

        /**
         * Triggered by NodeEvent.UPDATEDLABEL
         * @param {Object} event
         * @param {Node} node
         * @param {Object} data
         * @param {Update} update
         */
        handleNodeLabelUpdated: function (event, node, data, update) {

            // check if a label was added or removed
            if (!update.changed(model.Node.getLabelsPath())) {
                return;
            }

            this.executeIfExists('updateNodeLabels', data);
        }
    });

}(this, jQuery));

(function (context, undefined) {

    // 'use strict';

    var constants   = context.setNamespace('app.constants');

    const Drag = {
        LEFT: 1,
        RIGHT: 2,
        UP: 3,
        DOWN: 4
    };

    constants.Drag = Drag;

}(this));

(function (context, undefined) {

'use strict';

var constants   = context.setNamespace('app.constants');

constants.EvaluationStrategy = {
	LABEL: 'label',
	PROPERTY: 'property'
};

}(this));

(function (context, undefined) {

// 'use strict';

var constants   = context.setNamespace('app.constants');

const NodeStatus = {
	ACCEPTED: 'accepted',
	DENIED: 'denied',
	PENDING: 'pending'
};

constants.NodeStatus = NodeStatus;

}(this));

(function (context, $, d3, _, undefined) {

'use strict';

var graph       = context.setNamespace('app.graph'),
    event       = context.use('app.event'),
    app         = context.use('app'),
    Drag        = context.use('app.constants.Drag'),
    NodeEvent   = context.use('app.event.NodeEvent'),
    DragEvent   = context.use('app.event.DragEvent'),
    HoldEvent   = context.use('app.event.HoldEvent'),
    self;

graph.Graph = app.createClass({

    construct: function (selector, kernel) {

        // if (!selector) throw 'No selector passed to graph';
        this.selector = selector;

        this.kernel = kernel || new event.Kernel();

        // to distinguish between node and canvas drags e.a.
        // TODO to Draggable module
        this.draggedNode = null;
        this.dragging = false;
        this.dragDirection = 0;

        // the node that is being hovered
        // needed for drag starts
        // TODO try to move to hoverable?
        this.hoveredNode = null;

        this.visibleNodes = null;
        this.visibleEdges = null;

        this.options = {
            shapes: {
                generator: 'symbol'
            }
        }

        self = this;
    },

    /**
     * Register a module to this graph and its kernel
     */
    register: function (module, events) {

        module.graph = this;

        this.kernel.register(module, events);

        return this;
    },

    /*
     * Graph initialization and utility functions
     */

    /**
     * Get the data from the graph html and clear it
     */
    getGraphData: function () {

        var graphData = $(this.selector).data('graph');
        $(this.selector).attr('data-graph', null);

        this.handleGraphData(graphData);
    },

    /**
     * asynchronous callback function incase of database call
     * expects a graph object with nodes and edges properties
     */
    handleGraphData: function (graphData) {

        var tickHandler;

        this.nodes = graphData.nodes || [];
        this.edges = graphData.edges || [];

        // draw the graph
        this.force = this.createForce();
        this.force.start();
        this.drawLinks();
        this.drawNodes();

        // NOTE: handleTick currently is dependent on this.node initialized in drawNodes()
        tickHandler = _.bind(this.handleTick, this);
        this.force.on('tick', tickHandler);

        this.handleWindowResize();

        $(this.kernel).trigger(NodeEvent.LOADED, [this.nodes, this.edges]);
    },

    createForce: function () {

        var force,
            tickHandler;

        force = d3.layout.force()
        .charge(-2500)
        .linkDistance(function (data) {
            return self.getLinkDistance(data);
        })
        .size([10000, 10000])
        .nodes(this.nodes)
        .links(this.edges)
        .linkStrength(function (data) {
            return 1;
        })

        return force;
    },

    /**
     * Add event handlers in this method
     */
    initialize: function () {

        // put in resizable module?
        var windowResizeHandler = _.bind(this.handleWindowResize, this);
        $(context).on('resize', windowResizeHandler);

        // initialize the viewport translation and scale
        this.initializeViewport();

        this.getGraphData();
    },

    initializeViewport: function () {
        d3.select(this.selector + ' .graph-viewport')
            .attr('transform', function (data) {

                var scale = 0.2,
                    translate = "-220, -700",
                    prototype = 'translate(__translate__) scale(__scale__)',
                    transform = prototype
                        .replace(/__translate__/g, translate)
                        .replace(/__scale__/g, scale)
                ;

                return transform;
            });
    },

    getNodeRadius: function (data) {
        return 25;
    },

    getLinkDistance: function (linkData){
        var distance = 50,
            r1,
            r2;

        if(linkData.source.r && linkData.target.r) {
            distance += (linkData.source.r + linkData.target.r );
        } else {
            r1 = this.getNodeRadius(linkData.source);
            r2 = this.getNodeRadius(linkData.target);

            distance += (r1 + r2);
        }
        
        return distance;
    },

    /**
     * Example events object with all the events we've used so far
     */
    getEventsObject: function () {

        var eventsObject = {
            'dragstart': _.partial(this.handleNodeDragStart, this),
            'drag': _.partial(this.handleNodeDrag, this),
            'dragend': _.partial(this.handleNodeDragEnd, this),
            'mouseover': _.partial(this.handleMouseOver, this),
            'mouseout': _.partial(this.handleMouseOut, this),
            'click': _.partial(this.handleMouseClick, this),
            'mouseup': _.partial(this.handleMouseUp, this),
            'mousedown': _.partial(this.handleMouseDown, this)
        };

        return eventsObject;
    },

    getNodeClassValue: function (data) {
        return "node";
    },

    getLinkClassValue: function (data) {
        return "link";
    },


    /*
     * Drawing the graph
     */

    /*
     * Drawing the nodes
     */

    getVisibleNodes: function () {
        return this.nodes;
    },

    /**
     * Removes all nodes and redraws them
     */
    redrawNodes: function () {
        d3.select(this.selector + ' .nodes').selectAll('.node').remove();

        this.drawNodes();
    },

    /**
     * Remove and redraw one node
     */
    redrawNode: function (node, data) {

        if (!node && !data) {
            return;
        }

        if (!node && data !== undefined) {
            node = $('.node').get(data.index);
        }

        d3.select(node).remove();
        this.drawNodes();
    },

    drawNodes: function () {

        // in case you only want to draw a subset
        var nodes = this.getVisibleNodes(),
            node = d3.select(this.selector + ' .nodes').selectAll('.node')
                .data(nodes, function (d, i) { 
                    if (d.hasOwnProperty('_id')) {
                        return d._id;
                    } else {
                        return i;
                    }
                }),
            nodeEnter = node.enter().append('g');

        this.drawNodeExit(node.exit());
        this.attachNodeEvents(nodeEnter);
        this.drawNodeEnter(nodeEnter);

        this.node = node;

        return this;
    },

    attachNodeEvents: function (nodeEnter) {
        var eventsObject = this.getEventsObject();

        nodeEnter
            .on('click', eventsObject['click'])
            .on('mouseover', eventsObject['mouseover'])
            .on('mouseout', eventsObject['mouseout'])
            .on('mouseup', eventsObject['mouseup'])
            .on('mousedown', eventsObject['mousedown'])
            .call(d3.behavior.drag()
                .on('dragstart', eventsObject['dragstart'])
                .on('drag', eventsObject['drag'])
                .on('dragend', eventsObject['dragend']));
    },

    getNodeShapeGenerator: function () {

        var generator = this.options.shapes.generator;

        if (generator == 'symbol') {
            return d3.svg.symbol()
                .type('circle')
                .size(function (data) {
                    // note: size is set in square pixels, hence the pow
                    // note2: yeah the formula is nonsense
                    return Math.pow(self.getNodeRadius(data)*Math.PI, 2);
                });
        } else {
            return d3.superformula()
                .type('circle')
                .size(function (data) {
                    // note: size is set in square pixels, hence the pow
                    return Math.pow(self.getNodeRadius(data)*Math.PI, 2);
                })
                .segments(50);
        }
    },

    drawNodeEnter: function (nodeEnter) {

        var shapeGenerator = this.getNodeShapeGenerator();

        nodeEnter.attr('class', function (data) {
            return self.getNodeClassValue(data);
        });

        nodeEnter.append('path')
            .attr('d', function (data, i) {
                var path = shapeGenerator(data, i);

                // store path data in the node for scaling
                // or other transformations
                data._shape = {
                    path: path,
                    scale: {x: 1, y: 1},
                    shape: 'circle'
                };

                return path;
            })
            .attr('class', 'top-circle');

        this.drawNodeTexts(nodeEnter);

        $(this.kernel).trigger(NodeEvent.DRAWN, [nodeEnter]);
    },

    drawNodeExit: function (nodeExit) {
        nodeExit.remove();
    },

    splitNodeText: function (name, treshold) {

        var parts,
            part,
            half,
            halfLength = name.length / 2,
            diffLength;

        treshold = treshold || 10;

        if (!name || name.length < treshold || name === "") {
            return [name];
        }

        parts = name.split(' ');

        half = parts[0];

        for (var i = 1; i < parts.length; i++) {
            part = parts[i];

            // the current difference with half
            diffLength = Math.abs(halfLength - half.length);

            // check if adding the current part still decreases the difference
            if (Math.abs(halfLength - (half.length + part.length + 1)) < diffLength) {
                half += " " + part;
            } else {
                return [half, parts.slice(i).join(' ')];
            }
        }

        return [name];
    },

    getNodeTextDY: function (data, slices) {
        if (slices <= 1) {
            return 5;
        }

        return -3;
    },

    /**
     * Get the text that should be shown on the node from the data
     * Should return null when text not there
     */
    getNodeTitleKey: function (data) {
        return 'name';
    },

    getNodeText: function (data) {
        return data._properties[this.getNodeTitleKey()];
    },

    drawNodeTexts: function (nodeEnter) {

        var self = this,
            textNode = nodeEnter.append('text')
                .attr('text-anchor', 'middle');

        // var textDrawer = _.bind(this.drawNodeText, this);
        // textNode.each(textDrawer);
        textNode.each(function (data) {
            self.drawNodeText.apply(self, [this, data]);
        });
    },

    drawNodeText: function (node, data) {

        var text = this.getNodeText(data),
            textParts = [],
            element = d3.select(node);

        if (!text) {
            return;
        }

        // clear the element
        element.text('');

        textParts = this.splitNodeText(text);

        element.attr('dy', this.getNodeTextDY(data, textParts.length));

        // we have max. 2 text parts
        for (var i = 0; i < textParts.length; i++) {
            var tspan = element.append('tspan').text(textParts[i]);
            if (i > 0) {
                tspan.attr('x', 0).attr('dy', 20);
            }
        }
    },

    setNodeText: function (node, data) {

        var text = $('text', node).get(0);
        // this.drawNodeText.apply(text, [data]);
        this.drawNodeText(text, data);
    },

    /*
     * Drawing the links
     */

    getVisibleLinks: function () {
        return this.edges;
    },

    /**
     * Remove all links and draw everything
     */
    redrawLinks: function () {
        d3.select(this.selector + ' .links').selectAll('.link').remove();

        this.drawLinks();
    },

    drawLinks: function () {

        // in case you only want to draw a subset
        var links = this.getVisibleLinks(),
            link = d3.select(this.selector + ' .links').selectAll('.link')
                .data(links, function (data) {
                    // compute a unique hash to bind the data
                    return data.source.index + '#' + data.target.index + '#' + data.type;
                }),
                linkEnter = link.enter().append('polyline');
            
        this.drawLinkExit(link.exit());
        this.drawLinkEnter(linkEnter);

        this.link = link;

        return this;
    },

    drawLinkEnter: function (linkEnter) {
        linkEnter.attr('class', function (data) {
            return self.getLinkClassValue(data);
        });
    },

    drawLinkExit: function (linkExit) {
        linkExit.remove();
    },

    getNodeFromData: function (data) {

        var nodes;
        
        if (data) {
            // NOTE this won't work if not all nodes are drawn
            // return $('.node').get(data.index);
            return d3.selectAll('.node').filter(function (d) {
                return d.index == data.index;
            }).node();
        }

        return null;
    },

    resolveNode: function (node, data) {
        
        if (node) {
            return node;
        }

        return this.getNodeFromData(data);
    },

    getDataFromNode: function (node) {

        if (node) {
            return d3.select(node).datum();
        }

        return null;
    },

    resolveData: function (node, data) {

        if (data) {
            return data;
        }

        return this.getDataFromNode(node);
    },


    /*
     * Handlers
     */

    /*
     * Mousing
     */

    handleMouseOver: function (graph, data) {

        graph.hoveredNode = {
            data: data,
            node: this
        };
    },

    handleMouseOut: function (graph, data) {

        graph.hoveredNode = null;
    },

    handleMouseClick: function (graph, data) {

        // don't click after a drag event
        if (d3.event.defaultPrevented) {
            return;
        }

        $(graph.kernel).trigger('node-clicked', [this, data]);
    },

    handleMouseDown: function (graph, data) {

        $(graph.kernel).trigger('mouse-down', [this, data]);
    },  

    handleMouseUp: function (graph, data) {

        $(graph.kernel).trigger('mouse-up');
    },  

    /*
     * Dragging
     */

    /**
     * Keep track of data about the drag, such as direction and distance
     */
    updateDragData: function (x, y) {

        var xAbs,
            yAbs,
            distance;
        
        if (!this.draggedNode) {
            return;
        }

        this.xChange = this.xChange + x;
        this.yChange = this.yChange + y;
        xAbs = Math.abs(this.xChange);
        yAbs = Math.abs(this.yChange);
        this.dragDistance = Math.sqrt(Math.pow(xAbs, 2) + Math.pow(yAbs, 2));

        if (this.xChange > 0 && yAbs < xAbs) {
            this.dragDirection = Drag.RIGHT;
        } else if (this.xChange < 0 && yAbs < xAbs) {
            this.dragDirection = Drag.LEFT;
        } else if (this.yChange > 0 && xAbs < yAbs) {
            this.dragDirection = Drag.DOWN;
        } else if (this.yChange < 0 && xAbs < yAbs) {
            this.dragDirection = Drag.UP;
        }
    },

    handleNodeDrag: function (graph, data) {

        // update the distance and direction of the drag
        graph.updateDragData(d3.event.dx, d3.event.dy);

        $(graph.kernel).trigger(d3.event, [this, data]);

        // if (graph.dragging && !d3.event.sourceEvent.defaultPrevented) {
        if (graph.dragDistance != 0 && !graph.holding /* && !d3.event.sourceEvent.defaultPrevented*/) {

        	graph.dragging = true;

            this.style['pointerEvents'] = 'none';
            
            // node drag functionality

            data.px += d3.event.dx;
            data.py += d3.event.dy;

            data.x += d3.event.dx;
            data.y += d3.event.dy;

            // update the visuals while dragging
            graph.handleTick();
        }
    },

    handleNodeDragStart: function (graph, data) {

        console.log('node drag start');
        console.log(graph);
        console.log(this);

        // use d3 event?
        $(graph.kernel).trigger(DragEvent.START, [this, data]);

        // used to stop canvas from dragging too
        d3.event.sourceEvent.stopPropagation();

        graph.xChange = 0;
        graph.yChange = 0;

        // also log the start location of the node
        graph.draggedNode = {
            data: data,
            node: this
        };

        graph.force.stop();
    },

    handleNodeDragEnd: function (graph, data) {

        // use d3 event?
        $(graph.kernel).trigger(DragEvent.END, [this, data]);

        if (graph.dragDistance !== 0) {
            graph.force.resume();
        }

        // clean up
        graph.draggedNode.node.style['pointerEvents'] = 'auto';
        graph.draggedNode = null;
        graph.dragging = false;
        graph.dragDistance = 0;
    },


    /*
     * Other
     */

    handleWindowResize: function (event) {
        var width = $(context).width(),
            height = $(context).height();

        $(this.selector)
            .attr('width', width)
            .attr('height', height);
    },

    handleTick: function () {

        var link = this.link,
            node = this.node;
                
        node.attr('transform', function (data) {

            var translation = 'translate(__x__, __y__)',
                w = 10000,
                h = 10000,
                r = self.getNodeRadius(data) * 2,
                position = {
                    x: Math.max(r, Math.min(w - r, data.x)),
                    y: Math.max(r, Math.min(h - r, data.y))
                };

            data.x = position.x;
            data.y = position.y;

            return translation.replace(/__x__/g, position.x).replace(/__y__/g, position.y);
        });

        if (link) {
            link.attr("points", function (data) {
                return data.source.x + "," + data.source.y + " " + 
                    (data.source.x + data.target.x)/2 + "," +
                    (data.source.y + data.target.y)/2 + " " +
                    data.target.x + "," + data.target.y;
            });
        }
    }
});
}(this, jQuery, d3, _));

(function (context, $, d3, undefined) {

'use strict';

var graph       = context.setNamespace('app.graph'),
    graphics    = context.setNamespace('app.graph.graphics'),
    NodeStatus  = context.use('app.constants.NodeStatus');

graphics.scaleNode = function (scale, node, graph) {

    //
    // NOTE we may need the attrtween again later
    //
    // d3.select(node).select('.top-circle').transition()
    //     .duration(400)
    //     .attrTween("transform", function(data, index, a) {
    //         var baseScale = data._shape.scale,
    //             scaleX = baseScale.x*scale,
    //             scaleY = baseScale.y*scale;

    //         return d3.interpolateString(a, 'scale('+scaleX+','+scaleY+')');
    //     });

    var data = graph.resolveData(node, undefined);

    var baseScale = data._shape.scale,
        scaleX = baseScale.x*scale,
        scaleY = baseScale.y*scale;

    d3.select(node).selectAll('.top-circle').transition().duration(500)
        .attr('d', data._shape.path)
        .attr('transform', 'scale('+scaleX+','+scaleY+')');
};

graphics.classNode = function (className, value, node, data, graph) {

    // node = (node === undefined) ? d3.select($('.node').get(data.index)) : node;
    // doesn't work because node isn't a d3 selection?
    // node = d3.select($('.node').get(data.index));
    node = d3.select(node);

    console.log("classing node");
    console.log(data.index);
    console.log(node);
    console.log(node.datum())

    node.classed(className, value);
};

graphics.handleNodeScale = function (scale, event, node) {

    graphics.scaleNode(scale, node, this.graph);
};

graphics.handleClassNode = function (className, event, node, data) {

    graphics.classNode(className, true, node, data, this.graph);
};

graphics.handleUnclassNode = function (className, event, node, data) {

    graphics.classNode(className, false, node, data, this.graph);
};

graphics.handleNodeColor = function (color, event, node, data) {

    graphics.colorNodes(d3.select(node), color, 500);
};

graphics.colorNodes = function (nodes, color, duration) {

    nodes.selectAll('.top-circle').transition()
        .duration(duration)
        .style('fill', color);
};

graphics.classNodes = function (nodes, classifier) {

    nodes.each(function (data) {
        d3.select(this).classed(classifier(data));
    });
};

graphics.shapeNodes = function (nodes, shape) {

    var shapeData;
    
    nodes.each(function (data) {
        shapeData = shape(data);
        d3.select(this).selectAll('.top-circle').transition().duration(500)
            .attr('d', shapeData.path)
            .attr('transform', 'scale('+shapeData.scale.x+','+shapeData.scale.y+')');
    });
};

})(this, jQuery, d3);
(function (context, $, d3, undefined) {

'use strict';

var modules            = context.setNamespace('app.modules'),
    app                = context.use('app'),
    Node               = context.use('app.model.Node'),
    graphics           = context.use('app.graph.graphics'),
    EvaluationStrategy = context.use('app.constants.EvaluationStrategy'),

    _defaults = {
        strategy: EvaluationStrategy.PROPERTY, // coloring strategy priority
        labels: {}, // classes for specific labels
        labelPriority: [],
        properties: {}, // classes for properties (+ optionally values)
        propertyPriority: []
    };

/**
 * Classable module
 *
 * Adds functionality to class nodes based on data
 */
modules.Classable = app.createClass({

    construct: function (options) {

        this.options = $.extend({}, _defaults, options);
    },

    // TODO make possible to set more classes at once
    classNodeByProperty: function (data) {

        var className,
            properties = this.options.properties,
            property,
            values,
            value,
            option,
            classes = {};

        for (property in properties) {

            value = data._properties[property];
            values = properties[property];

            for (option in values) {

                if (!values.hasOwnProperty(option)) {
                    continue;
                }

                className = values[option];
                if (option === value) {
                    classes[className] = true;
                } else {
                    classes[className] = false;
                }
            }
        }

        return classes;
    },

    /**
     * trigger the (re)coloring of nodes
     */
    handleClassNodes: function (event, nodes, data, update) {

        var strategy = this.options.strategy;

        // we use updated to determine if we're dealing with a
        // d3 nodeEnter set or a single node update
        if (update) {

            // check if relevant data is updated
            // TODO check should be based on used strategies
            if (!update.changed(Node.getPropertiesPath()) &&
                !update.changed(Node.getLabelsPath())) {

                return;
            }

            nodes = d3.select(nodes);
        }

        if (strategy === EvaluationStrategy.PROPERTY) {
            graphics.classNodes(nodes, this.classNodeByProperty.bind(this));
        }
        // else {
        //     graphics.classNodes(nodes, this.classNodeByLabel.bind(this));
        // }
    }
});

}(this, jQuery, d3));

(function (context, $, d3, undefined) {

'use strict';

var modules         = context.setNamespace('app.modules'),
    app           = context.use('app'),
    graphics      = context.use('app.graph.graphics'),
    EvaluationStrategy = context.use('app.constants.EvaluationStrategy'),

    _defaults = {
        numColors: 10, // number of random colors
        strategy: EvaluationStrategy.PROPERTY, // coloring strategy priority
        defaultValue: '#d2d2d2', // default node color
        labels: {}, // colors for specific labels
        labelPriority: [],
        properties: {}, // colors for properties (+ optionally values)
        propertyPriority: []
    };

/**
 * Colorable extension
 *
 * Adds functionality to color nodes
 */
modules.Colorable = app.createClass({

    construct: function (options) {

        this.colorMap = {};
        this.colorCount = 0;
        this.colors = d3.scale.category10();

        this.options = $.extend({}, _defaults, options);
    },

    /**
     * Color all the nodes
     */
    colorNodeByLabel: function (data) {

        var color = this.options.defaultColor,
            labels = this.options.labels,
            colorIndex,
            label;
        
        if (data._labels && data._labels.length > 0) {
            label = data._labels[0];
            
            if (!this.colorMap.hasOwnProperty(label)) {

                // check if we've defined the label color in the options
                if (labels.hasOwnProperty(label)) {
                    // stuff it in the colorMap
                    this.colorMap[label] = labels[label];
                } else {
                    colorIndex = this.colorCount % this.options.numColors;
                    this.colorMap[label] = this.colors(colorIndex);;
                    this.colorCount++;
                }
            }

            color = this.colorMap[label];
        }

        return color;
    },

    colorNodeByProperty: function (data) {

        var color = this.options.defaultColor,
            properties = this.options.properties,
            property,
            priority = this.options.propertyPriority,
            usePriority = priority.length !== 0,
            rank,
            values,
            value,
            colorRank = -1; // the rank of the assigned color

        // first try to color according to the priority list
        for (property in properties) {

            // to color the node with this property,
            // - the node has to have the property
            // - the property value has to have a color
            if (!data.hasOwnProperty(property)) {
                continue;
            }

            value = data[property];
            values = properties[property];

            if (!values.hasOwnProperty(value)) {
                continue;
            }

            rank = priority.indexOf(property);
            if (usePriority && rank !== -1 && rank < colorRank) {
                color = values[value];
                colorRank = rank;
            } else {
                // only color if no ranked color assigned yet
                // all ranked colors go first
                if (colorRank === -1) {
                    color = values[value];
                }
            }
        }

        return color;
    },

    /**
     * trigger the (re)coloring of nodes
     * Note: the nodes are alread d3 selections
     */
    handleColorNodes: function (event, nodes, data, update) {

        var strategy = this.options.strategy,
            duration = 0;

        // we use updated to determine if we're dealing with a
        // d3 nodeEnter set or a single node update
        if (update) {

            // check if relevant data is updated
            // TODO check should be based on used strategies
            if (!update.changed(Node.getPropertiesPath()) &&
                !update.changed(Node.getLabelsPath())) {

                return;
            }

            // d3 select if a single html node is passed
            nodes = d3.select(nodes);
            duration = 500;
        }

        if (strategy === EvaluationStrategy.PROPERTY) {
            graphics.colorNodes(nodes, this.colorNodeByProperty.bind(this), duration);
        } else {
            graphics.colorNodes(nodes, this.colorNodeByLabel.bind(this), duration);
        }
    }
});

}(this, jQuery, d3));

(function (context, $, d3, undefined) {

'use strict';

var graph     = context.setNamespace('app.graph'),
    modules   = context.setNamespace('app.modules'),
    app       = context.use('app'),
    EdgeEvent = context.use('app.event.EdgeEvent'),
    _defaults;

/**
 * EdgeCRUD module
 *
 * Adds functionality to link nodes by hovering them on top of each other
 */
modules.EdgeCRUD = app.createClass({

    construct: function (options) {

        this.options = $.extend({}, _defaults, options);
    },

    /**
     * Initializes variables and attaches events used for creating edges
     */
    initialize: function () {

        // non-customizable events
        $(this.kernel)
            .on(EdgeEvent.CREATE, this.handleCreateEdge.bind(this))
            .on(EdgeEvent.DESTROY, this.handleDestroyEdge.bind(this));
    },

    /**
     * Handles the event 
     */
    handleLinking: function () {

        console.log("handling linking");

        if (!this.graph.dragging) {
            return;
        }

        // TODO this can probably be done better (without using graph properties)
        if (this.graph.draggedNode && this.graph.hoveredNode) {
            this.updateLink(this.graph.draggedNode.data, this.graph.hoveredNode.data);
        }
    },

    handleCreateEdge: function (event, source, target, type) {

        console.log('handling edge creation');

        this.updateLink(source, target, type, 2);
    },

    handleDestroyEdge: function (event, source, target, type) {

        console.log('handling edge deletion');

        this.updateLink(source, target, type, 1);
    },

    handleUpdateEdge: function (event, edge, update) {

        var recreate = false,
            source,
            target,
            type,
            index;

        /* doesn't work yet

        // direction is relative to source
        if (update.hasOwnProperty('direction')) {
            recreate = true;
            source = edge.target;
            target = edge.source;
        }

        if (recreate) {
            // index = edge.index; // does it have this??
            index = this.indexOfEdge(edge.source, edge.target, edge.type);

            this.replace(index, {
                source || edge.source,
                target || edge.target,
                type || edge.type
            });
        }
        */
    },

    /**
     * returns the type of edge that should be used for this source and target
     */
    resolveEdgeType: function (source, target, type) {
        if (type) {
            return type;
        }
        
        return 'POINTS_TO';
    },

    /**
     * Returns the index of the edge
     *
     * @param string type If not given, returns index of the first edge between nodes
     */
    indexOfEdge: function (source, target, type) {

        var index = -1;

        this.graph.edges.forEach(function (edge, i) {

            if (type && edge.type !== type) {
                return index;
            }

            if ((edge.source.index == source.index && edge.target.index == target.index) ||
                (edge.source.index == target.index && edge.target.index == source.index)) {

                index = i;
            }
        });

        return index;
    },

    create: function (edge, properties) {

        // edge should at least have a source, target and type
        if (!edge.hasOwnProperty('source')
            || !edge.hasOwnProperty('target')
            || !edge.hasOwnProperty('type')) {

            return null;
        }

        this.graph.edges.push(edge);

        $(this.kernel).trigger(EdgeEvent.CREATED, [edge, source, target]);
    },

    replace: function (index, edge) {

        var replacedEdge = this.graph.edges[index];

        this.graph.edges[index] = edge;

        $(this.kernel).trigger(EdgeEvent.REPLACED, [edge, replacedEdge]);
    },



    /**
     * Creates a edge from source to target of type type if it does not exist yet.
     * Deletes the edge if it exists.
     *
     * @param integer action falsy if toggle, 1 if destroy, 2 if create
     */
    updateLink: function (source, target, type, action) {
        var edgeIndex = this.indexOfEdge(source, target, type),
            edge;

        type = this.resolveEdgeType(source, target, type);

        if (source.index == target.index) {
            return;
        }
        // console.log("updating link");
        // console.log(type);

        // // check if there's already an edge between source and target
        // for (i = edges.length-1; i >= 0; i--) {
        //     edge = edges[i];

        //     // if (edge.type != type) {
        //     //  continue;
        //     // }

        //     if ((edge.source.index == source.index && edge.target.index == target.index) ||
        //         (edge.source.index == target.index && edge.target.index == source.index)) {

        //         edges.splice(i, 1);
        //         deletered = true;
        //         toDelete = edge;
        //     }
        // }

        // determine action
        if (!action) {
            action = edgeIndex === -1 ? 2 : 1;
        }

        // create or destroy edge
        if (edgeIndex === -1 && action === 2) {

            // create

            // edge = {
            //     source: source.index,
            //     target: target.index,
            //     type: type
            // };

            edge = {
                source: source,
                target: target,
                type: type
            };

            this.graph.edges.push(edge);

            $(this.kernel).trigger(EdgeEvent.CREATED, [edge, source, target]);

        } else if (edgeIndex >= 0 && action === 1) {

            // destroy

            edge = this.graph.edges[edgeIndex];
            this.graph.edges.splice(edgeIndex, 1);

            $(this.kernel).trigger(EdgeEvent.DESTROYED, [edge]);
        }

        // TODO move this to some edge deleted/created handlers somewhere else
        this.graph.drawLinks();
        this.graph.force.start();
    }
});

}(this, jQuery, d3));

(function (context, $, d3, undefined) {

'use strict';

var modules            = context.setNamespace('app.modules'),
    app                = context.use('app'),
    Node               = context.use('app.model.Node'),
    graphics           = context.use('app.graph.graphics'),
    EvaluationStrategy = context.use('app.constants.EvaluationStrategy'),

    _defaults = {
        strategy: EvaluationStrategy.LABEL, // strategy priority
        labels: {}, // label evaluation
        labelPriority: [],
        properties: {}, // evaluation for properties (+ optionally values)
        propertyPriority: []
    };

/**
 * Evaluable abstract module
 *
 * Allows modules to react to property and label values
 */
modules.Evaluable = app.createClass({

    construct: function (options) {

        this.options = $.extend({}, _defaults, options);
    },

    // TODO generalize priority handling, as it's used in both evaluation functions
    
    evaluateLabels: function (data) {

        var value = this.options.defaultValue,
            labels = this.options.labels,
            label,
            priority = this.options.labelPriority,
            usePriority = priority.length !== 0,
            rank,
            assignedRank = -1;

        if (!value) {
            throw 'Default value not specified';
        }

        for (label in labels) {

            // to evaluate the node with this label,
            // - the node has to have the label
            // - the label value has to have a return value assigned
            if (!Node.hasLabel(data, label)) {
                continue;
            }

            rank = priority.indexOf(label);
            if (usePriority && rank !== -1 && rank < assignedRank) {
                value = labels[label];
                assignedRank = rank;
            } else {
                // only evaluate if no ranked value assigned yet
                // all ranked values go first
                if (assignedRank === -1) {
                    value = labels[label];
                }
            }
        }

        return value;
    },

    evaluateProperties: function (data) {

        var value = this.options.defaultValue,
            properties = this.options.properties,
            property,
            priority = this.options.propertyPriority,
            usePriority = priority.length !== 0,
            propertyValues,
            propertyValue,
            rank,
            assignedRank = -1;

        if (!value) {
            throw 'Default value not specified';
        }

        for (property in properties) {

            // to evaluate the node with this property,
            // - the node has to have the property
            // - the property's value has to have a return value specified
            propertyValue = Node.getPropertyValue(data, property);

            if (propertyValue === undefined) {
                continue;
            }

            // the values for which we've specified something
            propertyValues = properties[property];

            // continue if we don't know what to do with this property's value
            if (!propertyValues.hasOwnProperty(propertyValue)) {
                continue;
            }

            rank = priority.indexOf(property);
            if (usePriority && rank !== -1 && rank < assignedRank) {
                value = propertyValues[propertyValue];
                assignedRank = rank;
            } else {
                // only evaluate if no ranked propertyValue assigned yet
                // all ranked value go first
                if (assignedRank === -1) {
                    value = propertyValues[propertyValue];
                }
            }
        }

        return value;
    },

    /**
     * trigger the (re)evaluation of nodes
     * Note: nodes can be a single html element or a d3 selection
     */
    /*
    handleEvaluation: function (event, nodes, data, update) {

        var strategy = this.options.strategy,
            graph = this.graph;

        // we use updated to determine if we're dealing with a
        // d3 nodeEnter set or a single node update
        if (update) {

            // check if relevant data is updated
            // TODO check should be based on used strategies
            if (!update.changed(Node.getLabelsPath())) {

                return;
            }

            // d3 select if a single html node is passed
            nodes = d3.select(nodes);
        }

        if (strategy === EvaluationStrategy.PROPERTY) {
            graphics.shapeNodes(nodes, this.shapeNodeByProperty.bind(this));
        } else {
            graphics.shapeNodes(
                nodes,
                this.shapeNodeByLabel.bind(this),
                function (data) {
                    // note: size is set in square pixels, hence the pow
                    return Math.pow(graph.getNodeRadius(data)*3, 2);
                }
            );
        }
    }
    */
});

}(this, jQuery, d3));

(function (context, $, d3, undefined) {

'use strict';

var modules = context.setNamespace('app.modules'),
    app   = context.use('app');

/**
 * Filterable module
 *
 * Adds functionality to click and hold a node or the canvas
 */
modules.Filterable = app.createClass({

    initialize: function () {

        
    },

    drawNodeOverlay: function (nodeEnter) {

        var self = this;

        nodeEnter.append('svg:circle')
            .attr('class', 'overlay')
            .attr('r', function (data) {
                var radius = self.graph.getNodeRadius() * 2;

                return radius;
            })
        ;
    },

    filter: function (needle) {

        var filteredData = [];

        d3.selectAll('.node').classed('filtered', function (data) {
            var i,
                field,
                value,
                regex;

            regex = new RegExp(needle, "i");

            for (field in data._properties) {

                if (!data._properties.hasOwnProperty(field)) {
                    continue;
                }

                value = String(data._properties[field]);

                if (value.match(regex)) {
                    filteredData.push(data);
                    return false;
                }
            }

            return true;
        });

        return filteredData;
    },

    resetFilter: function () {

        d3.selectAll('.filtered').classed('filtered', false);
    },

    handleNodeDrawn: function (event, nodeEnter) {

        this.drawNodeOverlay(nodeEnter);
    },

    handleNodeFilter: function (event, query) {

        var data = this.filter(query);
        $(this.kernel).trigger('node-filtered', [undefined, data]);
    },

    handleNodeFilterUnset: function (event) {

        this.resetFilter();
    }
});

}(this, jQuery, d3));

(function (context, $, d3, undefined) {

'use strict';

var modules       = context.setNamespace('app.modules'),
    app           = context.use('app'),
    Node          = context.use('app.model.Node'),
    graphics      = context.use('app.graph.graphics'),
    EvaluationStrategy = context.use('app.constants.EvaluationStrategy'),

    _defaults = {
        strategy: EvaluationStrategy.PROPERTY, // evaluation strategy priority
        defaultValue: true, // show nodes/edges by default
        labels: {}, // colors for specific labels
        labelPriority: [],
        properties: {}, // colors for properties (+ optionally values)
        propertyPriority: []
    };

/**
 * Shapable module
 *
 * Adds functionality to shape nodes
 */
modules.Hidable = app.createClass(modules.Evaluable, {

    construct: function (options) {

        this.options = $.extend({}, _defaults, options);
        this.baseOptions = $.extend({}, _defaults, options);

        // add additional rules during execution
        this.filter = {};
    },

    initialize: function () {

        $(this.kernel)
            .on('graph-mode-changed', this.handleHideNodes.bind(this));
    },

    /**
     * Color all the nodes
     */
    hideNodeByLabel: function (data) {

        var show = this.evaluateLabels(data);

        return show;
    },

    hideNodeByProperty: function (data) {

        var show = this.evaluateProperties(data);

        return show;
    },

    /**
     * trigger the shaping of nodes
     */
    handleHideNodes: function (event, nodes, data, update) {

        var strategy = this.options.strategy,
            graph = this.graph;

        // we use updated to determine if we're dealing with a
        // d3 nodeEnter set or a single node update
        if (update) {

            // check if relevant data is updated
            // TODO check should be based on used strategies
            if (!update.changed(Node.getPropertiesPath()) &&
                !update.changed(Node.getLabelsPath())) {

                return;
            }

            // d3 select if a single html node is passed
            nodes = d3.select(nodes);
        }

        if (strategy === EvaluationStrategy.PROPERTY) {
            console.log('shaping by property');
            graphics.shapeNodes(
                nodes,
                this.shapeNodeByProperty.bind(this)
            );
        } else {
            graphics.shapeNodes(
                nodes,
                this.shapeNodeByLabel.bind(this)
            );
        }
    }
});

}(this, jQuery, d3));

(function (context, $, d3, undefined) {

'use strict';

var modules   = context.setNamespace('app.modules'),
    app       = context.use('app'),
    Drag      = context.use('app.constants.Drag'),
    HoldEvent = context.use('app.event.HoldEvent'),

    _defaults = {
        'duration': 500
    },
    self;

/**
 * Holdable module
 *
 * Adds functionality to click and hold a node or the canvas
 */
modules.Holdable = app.createClass({

    construct: function (options) {

        self = this;

        this.options = $.extend({}, _defaults, options);
    },

    /**
     * Initializes variables and attaches events used for creating edges
     */
    initialize: function () {

        // TODO graph.holdActions???
        this.graph.holdActions = {};
        this.graph.holdActions[Drag.LEFT]   = "None";
        this.graph.holdActions[Drag.RIGHT]  = "None";
        this.graph.holdActions[Drag.UP]     = "None";
        this.graph.holdActions[Drag.DOWN]   = "None";
    },

    handleHoldStart: function (event, node, data, position) {

        var graph = this.graph;

        this.holdTimeoutId = window.setTimeout(function () {

            // we're only really holding the node if we're not dragging
            if (!graph.dragging) {
                console.log("holding");
                graph.holding = true;

                if (node) {
                    $(self.kernel).trigger(HoldEvent.NODE, [node, data]);
                } else {
                    $(self.kernel).trigger(HoldEvent.CANVAS, [{}, position]);
                    graph.holding = false;
                }
            }
        }, this.options.duration);
    },

    /**
     * Show some information about the drag action
     */
    handleHoldDrag: function (event, node, data) {
        
        var infoText;

        if (!this.graph.holding) {
            return;
        }

        event.sourceEvent.preventDefault();

        if (this.graph.dragDistance > 100) {
            infoText = this.graph.holdActions[this.graph.dragDirection];
        } else {
            infoText = "Too close";
        }
    },

    handleHoldEnd: function (event, node, data) {

        window.clearTimeout(this.holdTimeoutId);
        
        if (!node) {
            return;
        }

        // dispatch menu action if node was held
        // use a fixed distance that has to be dragged
        if (this.graph.holding && this.graph.dragDistance > 100) {
            switch(this.graph.dragDirection) {
                case Drag.LEFT:
                    $(this.kernel).trigger(HoldEvent.DRAGLEFT, [node, data]);
                    break;
                case Drag.RIGHT:
                    $(this.kernel).trigger(HoldEvent.DRAGRIGHT, [node, data]);
                    break;
                case Drag.UP:
                    $(this.kernel).trigger(HoldEvent.DRAGUP, [node, data]);
                    break;
                case Drag.DOWN:
                    $(this.kernel).trigger(HoldEvent.DRAGDOWN, [node, data]);
                    break;
            }
        }

        this.graph.dragging = false;
        this.graph.holding = false;
    },
});

}(this, jQuery, d3));

(function (context, $, d3, undefined) {

'use strict';

var modules       = context.setNamespace('app.modules'),
    app           = context.use('app'),
    Node          = context.use('app.model.Node'),

    _defaults = {
        link: ['link'] // the properties to be checked for uris
    };

/**
 * Hyperlinkable module
 *
 * Adds functionality to follow a link in a node property
 */
modules.Hyperlinkable = app.createClass({

    construct: function (options) {

        this.options = $.extend({}, _defaults, options);
    },

    checkURI: function () {
        // TODO find a better javascript URL validation
        return true;
    },

    followLink: function (uri) {

        window.open(uri);
    },

    handleFollowLink: function (event, node, data) {

        var linkProperties = this.options.link,
            property,
            uris = [],
            uri,
            i;

        for (i = 0; i < linkProperties.length; i++) {
            property = linkProperties[i];

            uri = Node.getPropertyValue(data, property);
            if (uri && this.checkURI(uri)) {
                uris.push(uri);
            }
        }

        // follow the first for now
        if (uris.length > 0) {
            this.followLink(uris[0]);
        } else {
            console.log("no links");
        }
    }
});

}(this, jQuery, d3));
(function (context, $, d3, _, undefined) {

'use strict';

var modules     = context.setNamespace('app.modules'),
    transformer = context.setNamespace('app.transformer'),
    app         = context.use('app'),
    model       = context.use('app.model'),
    Node        = context.use('app.model.Node2'),
    NodeEvent   = context.use('app.event.NodeEvent'),
    EdgeEvent   = context.use('app.event.EdgeEvent'),

    _defaults = {
        properties: {}, // default property values on node creation
        labels: [] // default label values on node creation
    }

/**
 * NodeCRUD module
 *
 * Adds CRUD functionality to nodes
 */
modules.NodeCRUD = app.createClass({

    construct: function (options) {

        this.options = $.extend({}, _defaults, options);
    },

    /**
     * Initializes variables and attaches events used for creating edges
     */
    initialize: function () {

        $(this.kernel)
            .on(NodeEvent.CREATE, this.handleNodeCreate.bind(this))
            .on(NodeEvent.UPDATE, this.handleUpdate.bind(this))
            .on(NodeEvent.DESTROY, this.handleNodeDestroy.bind(this))
    },

    /**
     * Create a node from a given set of key value pairs
     */
    createNode: function (properties, labels, x, y) {

        console.log("creating node, x: " + x + ", y: " + y);

        // then add node metadata
        var defaultProperties = this.options.properties,
            property,
            defaultLabels = this.options.labels,
            label,
            data,
            i;

        // add the default properties passed in the options
        for (property in defaultProperties) {

            if (!defaultProperties.hasOwnProperty(property)) {
                continue;
            }

            // we should be careful not to overwrite property values
            if (!properties.hasOwnProperty(property)) {
                properties[property] = defaultProperties[property];
            }
        }

        // add the default labels from the options
        for (i = 0; i < defaultLabels.length; i++) {
            label = defaultLabels[i];

            if (labels.indexOf(label) === -1) {
                labels.push(label);
            }   
        }

        // data = model.Node.create(properties, labels);
        // data.x = x || 0;
        // data.y = y || 0;

        data = new Node(
            null, // don't determine id here
            properties,
            null, // no mapped properties (add here?)
            labels
        );

        data.x = x || 0;
        data.y = y || 0;

        // then let d3 add other properties
        // TODO do this after the trigger
        this.graph.nodes.push(data);
        this.graph.drawNodes();
        this.graph.handleTick();
        this.graph.force.start();

        $(this.kernel).trigger(NodeEvent.CREATED, [null, data]);

        return data;
    },

    deleteEdgesForNode: function (nodeIndex) {

        var edges = this.graph.edges,
            edge;

        // start from top to remove multiple links correctly
        for (var i = edges.length-1; i >= 0; i--) {
            edge = edges[i];
            if (edge.source.index == nodeIndex || edge.target.index == nodeIndex) {
                edges.splice(i, 1);
            }
        }
    },

    /**
     * Handles the delete-node event
     */
    destroyNode: function (data) {

        if (!confirm("destroy node?")) {
            return;
        }

        var graph = this.graph;
        this.deleteEdgesForNode(data.index);

        // remove the node at the index
        graph.nodes.splice(data.index, 1);

        // update the indices of all nodes behind it
        // yes? no?
        // for (var i = data.index; i < this.nodes.length; i++) {
        //  console.log(i + ' ' + this.nodes[i].index);
        //  this.nodes[i].index = i;
        // }

        // TODO move elsewhere
        graph.drawLinks();
        graph.redrawNodes();
        graph.force.start();

        $(this.kernel).trigger(NodeEvent.DESTROYED, [data]);
    },

    updateNode: function (node, data, update) {

        node = this.graph.resolveNode(node, data);
        data = this.graph.resolveData(node, data);

        update.process(data);

        if (update.count) {

            // TODO this should be a response (in graphics?) to NodeEvent.UPDATED
            this.graph.setNodeText(node, data);

            $(this.kernel).trigger(NodeEvent.UPDATED, [node, data, update]);
        }
    },

    /**
     * Event Listeners
     */

    handleCreateChildNode: function (event, node, data) {

        var self = this,
            newData = this.createNode({}, [], data.x, data.y);
            // newNode = d3.select('.node:nth-child(' + (newData.index+1) + ')', this.graph.selector);

        // passing newNode to trigger select doesn't work, because the nodes
        // are redrawn in the create edge trigger

        $(this.kernel)
            .trigger(EdgeEvent.CREATE, [data, newData])
            .trigger(NodeEvent.SELECT, [null, newData]);
    },

    handleNodeCreate: function (event, properties, position) {

        var data;

        event.preventDefault();
        event.stopPropagation();

        if (!position) {
            position = {
                x: 0,
                y: 0
            };
        }

        data = this.createNode(properties, [], position.x, position.y);
    },

    /**
     * Generic update function
     */
    handleUpdate: function (event, node, data, update) {

        event.preventDefault();
        event.stopPropagation();

        console.log("handling node update");

        if (!update) {
            console.log("no update passed");
            return;
        }

        this.updateNode(node, data, update);
    },

    handleNodeDestroy: function (event, node, data) {

        this.destroyNode(data);
    }
});

}(this, jQuery, d3, _));

(function (context, $, undefined) {

'use strict';

var modules = context.setNamespace('app.modules'),
	app   = context.use('app');

/**
 * Pinnable module
 *
 * Adds functionality to fix node placement
 */
modules.Pinnable = app.createClass({

	/**
	 * This is actually a toggle to either pin or unpin a node
	 */
	handleNodePinned: function (event, node, data) {
		
		data.fixed = !data.fixed;

		$(this.kernel).trigger('node-pinned', [node, data]);
	}
});

}(this, jQuery));
(function (context, $, d3, undefined) {

'use strict';

var modules     = context.setNamespace('app.modules'),
    app         = context.use('app'),
    NodeEvent   = context.use('app.event.NodeEvent');

/**
 * Selectable module
 *
 * Adds functionality to select and unselect nodes
 */
modules.Selectable = app.createClass({

    construct: function () {

        this.selectedNode = null;
    },

    initialize: function () {

        $(this.kernel)
            .on(NodeEvent.SELECT, this.handleNodeSelect.bind(this))
            .on(NodeEvent.UNSELECT, this.handleNodeUnselect.bind(this));
    },

    handleNodeSelect: function (event, node, data) {

        console.log("selecting");
        console.log(data);
        console.log(node);

        var selectedNode = this.selectedNode;

        // do nothing if we're trying to reselect the selected node
        if (selectedNode) {

            if (selectedNode.data.index == data.index) {
                return;
            }

            // unselect the previously selected node
            $(this.kernel).trigger(
            	NodeEvent.UNSELECT,
            	[selectedNode.node, selectedNode.data]
            );
        }

        // resolve the node and data
        node = this.graph.resolveNode(node, data);
        data = this.graph.resolveData(node, data);

        this.selectedNode = {
            node: node,
            data: data
        };

        $(this.kernel).trigger(NodeEvent.SELECTED, [node, data]);
    },

    handleNodeUnselect: function (event, node, data) {

        // if node and data are null, unselect all nodes
        var selectedNode = this.selectedNode;

        if (data) {
            $(this.kernel).trigger(
            	NodeEvent.UNSELECTED,
            	[node, data]
            );

        } else if (selectedNode) {
            $(this.kernel).trigger(
            	NodeEvent.UNSELECTED,
            	[selectedNode.node, selectedNode.data]
            );
        }

        if (selectedNode) {
            this.selectedNode = null;
        }
    }
});

}(this, jQuery, d3));

(function (context, $, d3, undefined) {

'use strict';

var modules       = context.setNamespace('app.modules'),
    app           = context.use('app'),
    Node          = context.use('app.model.Node'),
    graphics      = context.use('app.graph.graphics'),
    EvaluationStrategy = context.use('app.constants.EvaluationStrategy'),

    _defaults = {
        strategy: EvaluationStrategy.PROPERTY, // coloring strategy priority
        defaultValue: 'circle', // default node color
        directMapping: true, // if true, label names are directly used as shapes
        paths: {}, // add custom paths
        shapes: {}, // add custom shapes (pathname or default shape + scaling)
        labels: {}, // colors for specific labels
        labelPriority: [],
        properties: {}, // colors for properties (+ optionally values)
        propertyPriority: []
    };

/**
 * Shapable module
 *
 * Adds functionality to shape nodes
 */
modules.Shapable = app.createClass(modules.Evaluable, {

    construct: function (options) {

        this.options = $.extend({}, _defaults, options);
    },

    getShapeObject: function (shape, size) {

        var shapes = this.options.shapes,
            paths = this.options.paths,
            shapeData,
            pathName,
            path,
            scale;

        // get the scaling that we should use as default
        // first check shapes, then paths, then just use built-in symbol
        if (shapes.hasOwnProperty(shape)) {
            shapeData = shapes[shape];

            pathName = shapeData[0];
            scale = {
                x: shapeData[1],
                y: shapeData[2]
            };

        } else {
            pathName = shape;
            scale = {
                x: 1,
                y: 1
            }
        }

        // use a path if provided, else generate with d3
        if (paths.hasOwnProperty(pathName)) {
            path = paths[pathName];
        } else {
            // path = d3.svg.symbol()
            //     .type(pathName)
            //     .size(size)
            path = d3.superformula()
                .type(pathName)
                .size(size)
                .segments(50);
        }

        return {
            shape: shape,
            path: path,
            scale: scale
        };
    },

    /**
     * Just a dumb approximation for now
     */
    getSizeFromRadius: function (radius) {
        return Math.pow(radius*3, 2);
    },

    /**
     * Color all the nodes
     */
    shapeNodeByLabel: function (data) {

        var shape,
            size;

        shape = this.evaluateLabels(data);
        size = this.getSizeFromRadius(this.graph.getNodeRadius(data));

        data._shape = this.getShapeObject(shape, size);

        return data._shape;
    },

    shapeNodeByProperty: function (data) {

        var shape,
            size;

        shape = this.evaluateProperties(data);
        size = this.getSizeFromRadius(this.graph.getNodeRadius(data));

        data._shape = this.getShapeObject(shape, size);

        return data._shape;
    },

    /**
     * trigger the shaping of nodes
     */
    handleShapeNodes: function (event, nodes, data, update) {

        var strategy = this.options.strategy,
            graph = this.graph;

        // we use updated to determine if we're dealing with a
        // d3 nodeEnter set or a single node update
        if (update) {

            // check if relevant data is updated
            // TODO check should be based on used strategies
            if (!update.changed(Node.getPropertiesPath()) &&
                !update.changed(Node.getLabelsPath())) {

                return;
            }

            // d3 select if a single html node is passed
            nodes = d3.select(nodes);
        }

        if (strategy === EvaluationStrategy.PROPERTY) {
            graphics.shapeNodes(
                nodes,
                this.shapeNodeByProperty.bind(this)
            );
        } else {
            graphics.shapeNodes(
                nodes,
                this.shapeNodeByLabel.bind(this)
            );
        }
    }
});

}(this, jQuery, d3));

(function (context, $, d3, undefined) {

'use strict';

var modules   = context.setNamespace('app.modules'),
    app       = context.use('app'),
    model     = context.use('app.model'),
    NodeEvent = context.use('app.event.NodeEvent'),
    _defaults = {
        path: '_mapped._style',
        storables: {}
    };

/**
 * Storable module
 *
 * Adds functionality to store node style in the database
 */
modules.Storable = app.createClass({

    construct: function (options) {

        this.options = $.extend({}, _defaults, options);
    },

	initialize: function () {

		$(this.kernel).on(NodeEvent.LOADED, this.handleGraphLoaded.bind(this));
	},

    /**
     * the string to be stored
     */
    objectToString: function (obj) {
        return JSON.stringify(obj);
    },

    /**
	 * parse the style string
	 */
    objectFromString: function (storableString) {
		return JSON.parse(storableString);
	},

    /**
     * Generate a style string from this node
     * so we only need to waste one field in the database
     */
    getStorableString: function (node, data) {

        // completely (re)build the object for now
        var storables = this.options.storables,
            style,
            properties,
            i,
            property,
            value,
            obj = {},
            objString,
            parameters;

        for (style in storables) {
            parameters = {};
            properties = storables[style];

            for (i = 0; i < properties.length; i++) {

                property = properties[i];

				// get the value of the property
				value = context.getObjectValueByPath(data, property);

                parameters[property] = value;
            }

            obj[style] = parameters;
        }

        objString = this.objectToString(obj);

        return objString;
    },

	/**
	 * Parse a style string into an object with node style properties
	 */
	parseStorableString: function (data) {

		var storables = this.options.storables,
            path = this.options.path,
            storedString,
			style,
			obj,
			properties,
			property,
			value;

        storedString = context.getObjectValueByPath(data, path);
		if (!storedString) {
			return;
		}

		obj = this.objectFromString(storedString);

		for (style in obj) {
			// check if this style was configured to be used
			if (!storables.hasOwnProperty(style)) {
				continue;
			}

			properties = obj[style];

            // TODO each style should have its own parser
			for (property in properties) {
                context.setByPath(data, property, properties[property]);
			}
		}
	},

	/**
	 * Translate the storable strings inside nodes to node data
	 */
	handleGraphLoaded: function (event, nodes, edges) {

		var i,
			node;

		for (i = 0; i < nodes.length; i++) {
			node = nodes[i];

			this.parseStorableString(node);
		}
	},

    handleNodeStyled: function (event, node, data) {

        // move this to a per-storable check
        if (!data.fixed) {
            return;
        }

        var storableString = this.getStorableString(node, data),
            update = new model.Update();
        
        update.set(this.options.path, storableString);

        $(this.kernel).trigger(NodeEvent.UPDATE, [node, data, update]);
    }
});

}(this, jQuery, d3));

(function (context, $, _, undefined) {

'use strict';

var modules     = context.setNamespace('app.modules'),
    app         = context.use('app'),
    model       = context.use('app.model'),
    NodeEvent   = context.use('app.event.NodeEvent'),
    NodeStatus  = context.use('app.constants.NodeStatus'),
    _defaults;

modules.Validatable = app.createClass({

    construct: function (options) {
        
        this.options = $.extend({}, _defaults, options);
    },

    setNodeStatus: function (node, data, status) {

        var update;

        if (!data._properties.hasOwnProperty('status') || data._properties.status !== status) {

            update = new model.Update();
            update.setProperty('status', status);

            $(this.kernel).trigger(NodeEvent.UPDATE, [node, data, update]);
        }
    },

    /**
     * Event handlers
     */


    /**
     * Invalidates a node
     */
    handleDenyNode: function (event, node, data) {

        this.setNodeStatus(node, data, NodeStatus.DENIED);
    },

    /**
     * Validates a node
     */
    handleAcceptNode: function (event, node, data) {

        this.setNodeStatus(node, data, NodeStatus.ACCEPTED);
    }
});

}(this, jQuery, _));

(function (context, $, d3, _, undefined) {

'use strict';

var modules   = context.setNamespace('app.modules'),
    app       = context.use('app'),
    _defaults;

/**
 * Zoomable module
 *
 * Adds standard d3 zooming and panning functionality to the graph
 */
modules.Zoomable = app.createClass({

    construct: function (options) {

        this.options = $.extend({}, _defaults, options);
    },

    initialize: function () {

        var zoomHandler = _.bind(this.handleZoom, this);
        var zoomStartHandler = _.bind(this.handleZoomStart, this);
        var zoomEndHandler = _.bind(this.handleZoomEnd, this);
        d3.select(this.graph.selector + ' .graph-viewport')
          .call(d3.behavior.zoom()
            .on('zoom', zoomHandler)
            .on('zoomstart', zoomStartHandler)
            .on('zoomend', zoomEndHandler)
          )

        // disables zoom on double click
        if (!this.options.doubleclick) {
            d3.select(this.graph.selector + ' .graph-viewport')
                .on('dblclick.zoom', null);
        }

        this.elem = $('.graph-content', this.graph.selector).get(0);
    },

    handleZoom: function () {

        var position = d3.mouse(this.elem),
            xdiff = this.dragStartPosition[0] - position[0],
            ydiff = this.dragStartPosition[1] - position[1];

        if (xdiff != 0 || ydiff != 0) {
            this.graph.dragging = true;
        }

        var prototype = 'translate(__translate__) scale(__scale__)',
            transform = prototype
                .replace(/__translate__/g, d3.event.translate)
                .replace(/__scale__/g, d3.event.scale);

        d3.select(this.graph.selector).select('.graph-content').attr('transform', transform);
    },

    handleZoomStart: function () {

        this.dragStartPosition = d3.mouse(this.elem);
    },

    handleZoomEnd: function () {

        this.graph.dragging = false;
    }
});

}(this, jQuery, d3, _));
(function (context, _, undefined) {

'use strict';

var transformer = context.setNamespace('app.transformer'),
    app         = context.use('app'),
    _defaults   = {
    	map: {} // the non property values
    };

transformer.AbstractDataTransformer = app.createClass({

	construct: function (options) {

		this.options = _.extend({}, _defaults, options);
	},

	from: function () {
		throw 'The data transformer should implement a "from" function';
	},

	to: function () {
		throw 'The data transformer should implement a "to" function';
	},

	getMappedProperties: function (data) {
		return this.filterAndChangePropertyKeys(data, this.options.map);
        // return this.mapProperties(data, this.options.map);
	},

	/**
     * Returns an object with the database field linked to the data value
     */
    filterAndChangePropertyKeys: function (data, map) {

        var mapped = {},
            dataField,
            mappedField,
            value;

        for (mappedField in map) {

        	if (!map.hasOwnProperty(mappedField)) {
        		continue;
        	}

            dataField = map[mappedField];
            value = data[dataField];

            if (!value) {
                continue;
            }

            mapped[mappedField] = value;
        }

        return mapped;
    },

    mapProperties: function (data, map) {

        var mapped = {};

        _.forOwn(data, function (value, key) {
            if (map.hasOwnProperty(key) && map[key]) {
                mapped[map[key]] = value;
            }
        });

        return mapped;
    },

    /**
     * Splits the data object into two objects
     *   properties: an object with the direct key/value pairs from data
     *   mapped: an object with the keys as values from the map
     *
     * @param {Object} data The data object to be split
     * @param {Object} map The mapping object
     *                 mapping to false means excluding a key
     */
    splitProperties: function (data, map) {

        var properties = {},
            mapped = {};

        // divide and map (if needed and possible)
        _.forOwn(data, function (value, key) {
            if (map.hasOwnProperty(key)) {
                if (map[key]) {
                    mapped[map[key]] = value;
                }
            } else {
                properties[key] = value;
            }
        });

        return {
            properties: properties,
            mapped: mapped
        };
    }
});

}(this, _));
(function (context, undefined) {

'use strict';

var transformer = context.setNamespace('app.transformer'),
    app         = context.use('app');

/**
 * An interface between d3 data structure and the data structure
 * used by this framework
 */
transformer.D3Transformer = app.createClass(transformer.AbstractDataTransformer, {

	from: function (data) {
		return data;
	},

	to: function (data) {
		return data;
	}
});

}(this));
    return this.app;
}(this));
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}]},{},[1]);
