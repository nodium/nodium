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

		this.colorMap = {};
		this.colorCount = 0;
		this.colors = d3.scale.category10();

		var _defaults = {
			'numColors': 10,
			'method': 'label',
			'defaultColor': '#d2d2d2'
		};

		this.options = $.extend({}, _defaults, options);
	};

	graph.Colorable.prototype.getNodeColor = function () {

	};

	/**
	 * Color all the nodes
	 */
	graph.Colorable.prototype.colorNodeByLabel = function (data) {

		var color = this.options.defaultColor,
			colorIndex,
			label;
		
		if (data._labels && data._labels.length > 0) {
			label = data._labels[0];
			
			if (!this.colorMap.hasOwnProperty(label)) {
				this.colorMap[label] = this.colorCount;
				this.colorCount++;
			}

			colorIndex = this.colorMap[label];

			color = this.colors(colorIndex % this.options.numColors);
		}

		return color;
	};

	graph.Colorable.prototype.colorNodesRandomly = function () {

	};

	graph.Colorable.prototype.handleColorNode = function (event, node) {

		console.log("coloring node");
		console.log(d3.select(node));
		graphics.colorNodes(d3.select(node), this.colorNodeByLabel.bind(this));
	};

	/**
	 * trigger the (re)coloring of nodes
	 */
	graph.Colorable.prototype.handleColorNodes = function (event, nodeEnter) {

		console.log('coloring nodes');

		var nodes = nodeEnter; // || this.graph.node;

		console.log(nodes);

		graphics.colorNodes(nodes, this.colorNodeByLabel.bind(this));
	};

}(window, jQuery, d3));