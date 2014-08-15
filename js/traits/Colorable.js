(function (window, $, d3, undefined) {
	var graph = window.setNamespace('app.graph'),
		app   = window.setNamespace('app'),
		graphics  = window.setNamespace('app.graph.graphics');

	/**
	 * Colorable extension
	 *
	 * Adds functionality to color nodes and edges
	 */
	graph.Colorable = function (options) {

		if ((this instanceof graph.Colorable) === false) {
			return new graph.Colorable(arguments);
		}

		var _defaults = {
			'method': 'label',
			'defaultColor': '#AA1111'
		};

		this.options = $.extend({}, _defaults, options);
	};

	graph.Colorable.prototype.getNodeColor = function () {

	};

	/**
	 * Color all the nodes
	 */
	graph.Colorable.prototype.colorNodesByLabel = function () {
		console.log(this.options.defaultColor);
		return this.options.defaultColor;
	};

	graph.Colorable.prototype.colorNodesRandomly = function () {

	};

	/**
	 * trigger the (re)coloring of nodes
	 */
	graph.Colorable.prototype.handleColorNodes = function (event, node, data) {

		console.log('coloring nodes');
		console.log(this.options);

		if (!node) {
			graphics.colorNodes(window.curry(this.colorNodesByLabel, this));
		}
	};

}(window, jQuery, d3));