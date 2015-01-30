(function (context, $, undefined) {

'use strict';

var ui          = context.setNamespace('app.ui'),
    app         = context.use('app');

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

    super: context.use('app.snippet.super'),

    /**
     * Event handlers
     */
    handleMenuCollapse: function (event) {

        if (this.isVisible) {
            this.hide();
        }
    }
});

}(this, jQuery));