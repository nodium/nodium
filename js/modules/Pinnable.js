(function (window, $, d3, undefined) {

'use strict';

var modules = window.setNamespace('app.modules'),
	app   = window.use('app');

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

}(window, jQuery, d3));