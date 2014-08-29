(function (window, $, undefined) {

'use strict';

var ui          = window.setNamespace('app.ui'),
    app         = window.use('app');

ui.UIPanel = app.createClass(ui.UIElement, {

	destroy: function () {
        this.view.remove();
    },

    hide: function () {

        this.isVisible = false;
        this.view.removeClass('active');
    },

    show: function () {
    	this.isVisible = true;
        this.view.addClass('active');
    },

    super: window.use('app.snippet.super')
});

}(window, window.jQuery));