(function (window, $, _, undefined) {

'use strict';

var ui          = window.setNamespace('app.ui'),
    app         = window.use('app'),
    NodeEvent   = window.use('app.event.NodeEvent'),
    Event       = window.use('app.event.Event'),
    _defaults;

ui.NodeExplorerPanel = app.createClass(ui.UIElement, {

    construct: function () {

    	this.initialize(selector, kernel);
    	this.options = $.extend({}, _defaults, options);
        this.name = 'Graph Explorer';
        this.icon = 'icon-globe';
    }
});

}(window, window.$, window._));