(function (window, undefined) {

'use strict';

var transformer = window.setNamespace('app.transformer'),
    app         = window.use('app');

transformer.DataTransformerInterface = app.createClass({

	from: function (data) {
		return data;
	},

	to: function (data) {
		return data;
	}
});

}(window));