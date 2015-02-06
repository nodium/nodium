(function (context, $, undefined) {

'use strict';

var modules = context.setNamespace('app.modules'),
	app   = context.use('app');

/**
 * Pinnable module
 *
 * Adds functionality to fix node placement
 */
modules.Pinnable = app.createClass({

	/**
	 * This is actually a toggle to either pin or unpin a node
	 */
	handleNodePinned: function (event, node, data) {
		
		data.fixed = !data.fixed;

		$(this.kernel).trigger('node-pinned', [node, data]);
	}
});

}(this, jQuery));