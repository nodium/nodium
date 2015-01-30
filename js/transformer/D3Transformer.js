(function (context, undefined) {

'use strict';

var transformer = context.setNamespace('app.transformer'),
    app         = context.use('app');

/**
 * An interface between d3 data structure and the data structure
 * used by this framework
 */
transformer.D3Transformer = app.createClass(transformer.AbstractDataTransformer, {

	from: function (data) {
		return data;
	},

	to: function (data) {
		return data;
	}
});

}(this));