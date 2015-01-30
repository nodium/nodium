(function (context, $, undefined) {

'use strict';

var app       = context.app,
    superflag = false;;

app.debug = false;
app.registeredNamespaces = [];

// move to snippet
app.createClass = function () {

    var Constructor,
        SuperClass,
        prototype,
        props,
        p,
        args;

    args = Array.prototype.slice.call(arguments, 0);

    if (typeof args[0] === 'function') {
        SuperClass = args.shift();
    }

    props = args.shift();

    Constructor = function () {
        
        if (false === (this instanceof Constructor)) {
            return new Constructor(arguments);
        }

        if (this.construct && typeof this.construct === 'function') {

            var args = Array.prototype.slice.call(arguments, 0);

            args.unshift('construct');
            this.super.apply(this, args);

            if (!superflag) {
                this.construct.apply(this, args.slice(1));
            }
        }
        superflag = false;
    };

    if (null != SuperClass) {
        superflag = true;
        prototype = new SuperClass();

        for (p in props) {

            if (props.hasOwnProperty(p)) {
                prototype[p] = props[p];
            }
        }
    } else {
        props.super = app.snippet.super;
    }

    Constructor.prototype = prototype || props;

    return Constructor;
};

/**
 * Creates a function calling fn
 * @param function fn
 * @param object scope
 * @return function
 */
context.curry = function (fn, scope) {
    scope = scope || context;

    // return a function executing fn
    return function () {
        return fn.apply(scope, arguments);
    };
};

/**
 * Creates a function calling fn, with optional arguments
 * @param function fn
 * @param object scope
 * @param ...
 * @return function
 */
context.curryWithArguments = function (fn, scope) {

    var args = arguments.slice(2);

    scope = scope || context;

    // return a function executing fn
    return function () {
        fn.apply(scope, args);
    };
};

context.currySelf = function (fn, self) {

    return function () {
        for (var i = arguments.length; i > 0; i--) {
            arguments[i] = arguments[i-1];
        }
        arguments[0] = self;
        fn.apply(this, arguments);
    };
};

context.partial = function (fn, scope) {
    var aps = Array.prototype.slice,
        apc = Array.prototype.concat,
        args;

    if (scope) {
        args = aps.call(arguments, 2);
    } else {
        args = aps.call(arguments, 1);
    }

    // flatten the arguments
    args = apc.apply([], args);

    scope = scope || context;
  
    return function () {
        return fn.apply(scope, args.concat(aps.call(arguments)));
    };
}

/**
 * Sets the current namespace
 * @param string namespace
 * @return object
 */
context.setNamespace = function (namespace) {

    // declare variables
    var namespaceCompenents = namespace.split("."),
        parent = context,
        component,
        i,
        length;

    // loop through namespaceComponents and create new sub-objects for each component
    for (i = 0, length = namespaceCompenents.length; i < length; i++) {
        component = namespaceCompenents[i];
        parent[component] = parent[component] || {};
        parent = parent[component];
    }

    // return the namespace object
    return parent;
};

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

        // if (parent[child]) {
        //     parent = parent[child];
        // } else {
        //     throw new Error('Could not resolve ' + child + ' in ' + fullyQualifiedClassName);
        //     return;
        // }
        parent = parent[child] || {};
    }

    return parent;
};

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
}

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
}

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
}

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
}

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

    
}

context.hasNamespace = function (namespace) {
    // declare variables
    var namespaceCompenents = namespace.split("."),
        hasNamespace = true,
        parent = context,
        component,
        i,
        length;

    // loop through namespaceComponents and create new sub-objects for each component
    for (i = 0, length = namespaceCompenents.length; i < length; i++) {
        component = namespaceCompenents[i];

        if (parent[component] === undefined) {

            hasNamespace = false;
            break;
        }
        
        parent = parent[component];
    }

    // return the namespace object
    return hasNamespace;
};

context.createFromPrototype = function (view, parameters) {
    var prototype = view.data('prototype'),
        key,
        instance,
        parameter;

    for (key in parameters) {

        if (false === parameters.hasOwnProperty(key)) {
            continue;
        }

        parameter = '{' + key + '}';

        instance = (instance || prototype).replace(parameter, parameters[key])
    }

    return instance;
};

context.uuid = function () {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random()*16|0,
            v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
}

}(this, jQuery));
