(function (window, $, undefined){

'use strict';

var ui      = window.setNamespace('app.ui'),
    app     = window.use('app');

ui.UIElement = app.createClass({

    initialize: function (selector, kernel) {   

        this.events = []; 
        this.view   = $(selector);
        this.kernel = kernel;
    },

    destroy: function () {

        var i;

        for (i = this.events.length; i > 0; i--) {

            this.off.apply(this, this.events[i - 1]);
        }
    },

    off: function () {

        var args     = Array.prototype.slice.call(arguments, 0),
            selector = args.shift(),
            index,
            view;

        view = $(selector, this.view);
        view.off.apply(view, args);

        index = this.events.indexOf(args);

        if (-1 !== index) {
            this.events = this.events.splice(index, 1);
        }

        return this;
    },

    on: function () {

        var args        = Array.prototype.slice.call(arguments, 0),
            selector    = args.shift(),
            eventName   = args[0],
            view;

        args.push(this.resolveEvent(eventName, this));

        view = $(selector, this.view);
        view.on.apply(view, args);

        this.events.push(args.unshift(selector));

        return this;
    },

    resolveEvent: function (eventName, target) {
        var fn,
            functionName = this.toCamelCase([
                'handle',
                eventName
            ].join('-'));

        fn = target[functionName];

        if (fn && 'function' === typeof fn) {
            return fn.bind(target);
        } else {
            throw new Error('Could not resolve ' + eventName + ' to function.')
        }
    },

    toCamelCase: function (dashedString) {
        return dashedString.replace(/-([a-z])/g, function (g) {
            return g[1].toUpperCase();
        });
    }
});

}(window, jQuery));