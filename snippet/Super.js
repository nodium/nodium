(function (use, undefined) {

    'use strict';

    var snippet = use('app.snippet');

    /**
     * snippet.super
     * Executes the caller function as defined in an object's prototype class
     */
    snippet.super = function () {

        var prototype = this.constructor.prototype,
            keys,
            key,
            i;

        for (key in prototype) {

            if (false === prototype.hasOwnProperty(key)) {
                continue;
            }

            if (this[key] === this.super.caller) {
                return prototype[key](arguments);
            }
        }
    };
}(window.use));