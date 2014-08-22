(function (window, $, d3, undefined) {

'use strict';

var graph = window.setNamespace('app.graph'),
	app   = window.use('app');

/**
 * Pinnable trait
 *
 * Adds functionality to fix node placement
 */
graph.Pinnable = app.createClass({

	/**
	 * This is actually a toggle to either pin or unpin a node
	 */
	handleNodePinned: function (event, node, data) {

		console.log("handling pinning");
		console.log(data.fixed);
		data.fixed = !data.fixed;

		$(this.kernel).trigger('node-pinned', [node, data]);
	}
});

}(window, jQuery, d3));