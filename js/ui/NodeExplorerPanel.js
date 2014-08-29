(function (window, $, _, undefined) {

'use strict';

var ui          = window.setNamespace('app.ui'),
    app         = window.use('app'),
    NodeEvent   = window.use('app.event.NodeEvent'),
    Event       = window.use('app.event.Event'),
    _defaults;

ui.NodeExplorerPanel = app.createClass(ui.UIPanel, {

    construct: function (selector, options, kernel) {

    	this.initialize(selector, kernel);
    	this.options = $.extend({}, _defaults, options);
        this.name = 'Graph Explorer';
        this.icon = 'icon-globe';
    },

    init: function (container) {

        $(container).on('menu-collapse', this.handleCollapse.bind(this));

        return this;
    },

    show: function () {

        this.super('show');

        $(this.kernel).trigger('mode-change', 'explorer');
    }
});

}(window, window.$, window._));