(function (window, $, d3, undefined) {

'use strict';

var event       = window.setNamespace('app.event'),
    EventAware  = window.use('app.event.EventAware'),
    app         = window.use('app');

event.Kernel = app.createClass(EventAware, {

    /**
     * Register a module to the kernel
     */
    register: function (module, events) {

        module.kernel = this;

        if (events) {
            this.attachModuleEvents(module, events);
        }

        if (typeof(module.initialize) === "function") {
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
                func = window.getFunction(value);
            }

            if (func) {
                $(this).on(key, window.partial(func, module, args));
            }
        }
    }
});

}(window, window.jQuery, window.d3));