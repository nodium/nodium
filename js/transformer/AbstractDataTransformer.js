(function (window, undefined) {

'use strict';

var transformer = window.setNamespace('app.transformer'),
    app         = window.use('app');
    _defaults   = {
    	map: {} // the non property values
    };

transformer.AbstractDataTransformer = app.createClass({

	construct: function (options) {

		this.options = $.extend({}, _defaults, options);
	},

	from: function () {
		throw 'The data transformer should implement a "from" function';
	},

	to: function () {
		throw 'The data transformer should implement a "to" function';
	}
});

}(window));