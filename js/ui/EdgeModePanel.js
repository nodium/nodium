(function (window, $, undefined) {

'use strict';

var ui          = window.setNamespace('app.ui'),
    app         = window.use('app'),
    EdgeEvent   = window.use('app.event.EdgeEvent'),
    Event       = window.use('app.event.Event'),
    _defaults;

ui.EdgeModePanel = app.createClass({

    construct: function (options, selector) {

        this.options = $.extend({}, _defaults, options);
        this.name = 'Edge mode';
        this.selector = selector;

        $(selector).on(Event.CHANGE, 'input[type=radio]', this.handleModeChange.bind(this));
    },

    initialize: function () {
    },

    /**
     * set the edge mode variable
     */
    handleModeChange: function (event) {

        var target = event.target,
            mode = $(target).val();

        $(this.kernel).trigger(EdgeEvent.MODECHANGE, [mode]);
    }
});

}(window, jQuery, d3));