(function (context, $, undefined) {

'use strict';

var ui          = context.setNamespace('app.ui'),
    app         = context.use('app'),
    EdgeEvent   = context.use('app.event.EdgeEvent'),
    Event       = context.use('app.event.Event'),
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

}(this, jQuery));