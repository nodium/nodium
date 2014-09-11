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

        $(selector).on(Event.CHANGE, 'input[type=radio]', this.handleChange.bind(this));
        $('input[value=LINK]').click();
    },

    /**
     * set the edge mode variable
     */
    handleChange: function (event) {

        var target = event.target,
            mode = $(target).val();

        $(target)
            .parent().addClass('selected')
            .siblings().removeClass('selected');

        $(this.kernel).trigger(EdgeEvent.MODECHANGE, [mode]);
    }
});

}(window, window.jQuery, window.d3));