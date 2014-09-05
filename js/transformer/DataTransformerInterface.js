(function (window, undefined) {

'use strict';

var transformer = window.setNamespace('app.transformer'),
    app         = window.use('app');
    _defaults   = {

    };

transformer.DataTransformerInterface = app.createClass({

	construct: function (options) {

		this.options = $.extend({}, _defaults, options);
	},

	from: function (data) {
		return data;
	},

	to: function (data) {
		return data;
	}
});

}(window));