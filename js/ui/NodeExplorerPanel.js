(function (context, $, _, undefined) {

'use strict';

var ui          = context.setNamespace('app.ui'),
    app         = context.use('app'),
    NodeEvent   = context.use('app.event.NodeEvent'),
    Event       = context.use('app.event.Event'),
    _defaults;

ui.NodeExplorerPanel = app.createClass(ui.UIPanel, {

    construct: function (selector, options, kernel) {

    	this.initialize(selector, kernel);
    	this.options = $.extend({}, _defaults, options);
        this.name = 'Graph Explorer';
        this.icon = 'icon-globe';
    },

    init: function (container) {

        $(container).on('menu-collapse', this.handleMenuCollapse.bind(this));

        return this;
    },

    show: function () {

        this.super('show');

        $(this.kernel).trigger('mode-change', 'explorer');
    }
});

}(this, jQuery, _));