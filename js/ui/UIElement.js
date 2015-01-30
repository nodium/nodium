(function (context, $, undefined){

'use strict';

var ui          = context.setNamespace('app.ui'),
    app         = context.use('app'),
    EventAware  = context.use('app.event.EventAware');

ui.UIElement = app.createClass(EventAware, {

    initialize: function (selector, kernel) {   

        this.view   = $(selector);
        this.kernel = kernel;
    },

    resolveSelector: function (selector) {

    	if (selector) {
    		return $(selector, this.view)	
    	}
    	
    	return this.view;
    }
});

}(this, jQuery));