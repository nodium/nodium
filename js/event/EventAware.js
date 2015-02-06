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
