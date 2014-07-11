(function (window, $, undefined) {
    'use strict';

    // define namespace
    window.app = window.app || {};

    app.debug = false;
    app.registeredNamespaces = [];

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
            fn.apply(scope, arguments);
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

        console.log("currying with arguments");
        console.log(arguments);

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
        
        namespaceLoadedHandler = window.curryWithArguments(window.initializeNamespace, window, namespace);

        // get the script
        if (window.hasNamespace(namespace)) {
            window.initializeNamespace(namespace);

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

    window.initializeNamespace = function (namespace) {

        window.setNamespace(namespace).initialize();
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

}(window, jQuery));