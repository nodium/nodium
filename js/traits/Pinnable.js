(function (window, $, d3, undefined) {
	var graph = window.setNamespace('app.graph'),
		app   = window.setNamespace('app');

	/**
	 * Pinnable trait
	 *
	 * Adds functionality to fix node placement
	 */
	graph.Pinnable = function () {

		// enforce use of new on constructor
		if ((this instanceof graph.Pinnable) === false) {
			return new graph.Pinnable(arguments);
		}
	};

	/**
	 * This is actually a toggle to either pin or unpin a node
	 */
	graph.Pinnable.prototype.handleNodePinned = function (event, node, data) {
		
		data.fixed = !data.fixed;

		$(this.kernel).trigger('node-pinned', [node, data]);
	};

}(window, jQuery, d3));