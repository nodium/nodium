(function (context, undefined) {

    // 'use strict';

    var snippet = context.setNamespace('app.snippet');

    /**
     * snippet.super
     * Executes the caller function as defined in an object's prototype class
     */
    snippet.super = function (functionName) {

        var prototype = Object.getPrototypeOf(Object.getPrototypeOf(this)),
            functionName,
            args;

        args = Array.prototype.slice.call(arguments, 1);

        if (prototype.hasOwnProperty(functionName)) {
            return prototype[functionName].apply(this, args);
        }
    };
}(this));