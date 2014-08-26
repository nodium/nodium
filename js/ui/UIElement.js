(function (window, $, undefined){

'use strict';

var ui          = window.setNamespace('app.ui'),
    app         = window.use('app'),
    EventAware  = window.use('app.event.EventAware');

ui.UIElement = app.createClass(EventAware, {

    initialize: function (selector, kernel) {   

        this.view   = $(selector);
        this.kernel = kernel;
    },

    resolveSelector: function (selector) {

    	if (selector) {
    		return $(selector, this.view)	
    	}
    	
    	return $(this.view);
    }
});

}(window, jQuery));