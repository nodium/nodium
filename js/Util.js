(function (window, $, undefined) {

'use strict';

// define namespace
window.app = window.app || {};

app.debug = false;
app.registeredNamespaces = [];

var superflag = false;

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
window.curry = function (fn, scope) {
    scope = scope || window;

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
window.curryWithArguments = function (fn, scope) {

    var args = arguments.slice(2);

    scope = scope || window;

    // return a function executing fn
    return function () {
        fn.apply(scope, args);
    };
};

window.currySelf = function (fn, self) {

    return function () {
        for (var i = arguments.length; i > 0; i--) {
            arguments[i] = arguments[i-1];
        }
        arguments[0] = self;
        fn.apply(this, arguments);
    };
};

window.partial = function (fn, scope) {
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

    scope = scope || window;
  
    return function () {
        return fn.apply(scope, args.concat(aps.call(arguments)));
    };
}

/**
 * Sets the current namespace
 * @param string namespace
 * @return object
 */
window.setNamespace = function (namespace) {

    // declare variables
    var namespaceCompenents = namespace.split("."),
        parent = window,
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
window.use = function (fullyQualifiedClassName) {

    var components = fullyQualifiedClassName.split('.'),
        parent = window,
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
window.getFunction = function (functionPath) {

    var components = functionPath.split('.'),
        parent = window,
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
window.getPathArray = function (path) {

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

window.getObjectValueByPath = function (obj, path) {
    // s = s.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
    // s = s.replace(/^\./, '');           // strip a leading dot
    // var a = s.split('.');

    var array = window.getPathArray(path),
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
 */
window.setObjectValueByPath = function (obj, path, value) {

    var array = window.getPathArray(path),
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
    obj[key] = value;

    return newKey;
}

window.removeObjectKeyByPath = function (obj, path) {

    var array = window.getPathArray(path),
        key;

    while (array.length - 1) {
        key = array.shift();
        if (key in obj) {
            obj = obj[key];
        } else {
            return false;
        }
    }

    key = array.shift();
    if (!(key in obj)) {
        return false;
    }

    delete obj[key];
    return true;
}

/**
 * Dynamically loads a javascript file containing namespace
 * @param string namespace
 */
window.loadNamespace = function (namespace) {

    // declare variables
    var namespaceLoadedHandler,
        namespaceCompenents = namespace.split('.'),
        prototype = 'http://__hostname__/js/__path__.min.js',
        url;

    if (app.debug) {
        prototype = 'http://__hostname__/js/__path__.js';
    }

    // remove 'app' from namespaceComponents
    namespaceCompenents = namespaceCompenents.splice(1, namespaceCompenents.length - 1);

    // create the url to the javascript file
    url = prototype
        .replace(/__hostname__/g, window.location.hostname)
        .replace(/__path__/g, namespaceCompenents.join('/'));
    
    namespaceLoadedHandler = window.curryWithArguments(window.constructializeNamespace, window, namespace);

    // get the script
    if (window.hasNamespace(namespace)) {
        window.constructializeNamespace(namespace);

    } else {
        $.getScript(url)
            .done(namespaceLoadedHandler)
            .fail(function (jqxhr, settings, exception) {
                console.log('script failed to load!');
                console.log(exception);
            });
    }
};

window.hasNamespace = function (namespace) {
    // declare variables
    var namespaceCompenents = namespace.split("."),
        hasNamespace = true,
        parent = window,
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

window.constructializeNamespace = function (namespace) {

    window.setNamespace(namespace).constructialize();
};

window.releaseNamespace = function (namespace) {

    window.setNamespace(namespace).release();
};

window.isCrippleBrowser = function () {
    var userAgent = navigator.userAgent,
        crippleBrowsers = [
            'MSIE 6',
            'MSIE 7',
            'MSIE 8',
            'MSIE 9'
        ],
        i,
        length;

    for (i = 0, length = crippleBrowsers.length; i < length; i++) {

        if (0 <= userAgent.indexOf(crippleBrowsers[i])) {
            return true;
        }
    }

    return false;
};

window.createFromPrototype = function (view, parameters) {
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

window.bindAll = function (array, self) {
    var i;

    for (i = array.length; i > 0; i--) {
        array[i] = window.curry(array[i], self);
    }
};

}(window, jQuery));