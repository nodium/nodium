(function (window, $, d3, undefined) {

	graph 	  = window.setNamespace('app.graph');
	graphics  = window.setNamespace('app.graph.graphics');

	/*
	 * Functions here are probably executed in scope of the trait
	 */

	graphics.scaleNode = function (scale, node, graph) {

		d3.select(node).select('circle').transition()
		    .duration(400)
		    .attr("r", function(d) { return scale * graph.getNodeRadius(d)*2; });
	};

	graphics.handleNodeScale = function (scale, event, node) {

		graphics.scaleNode(scale, node, this.graph);
	};

	graphics.handleNodeSelected = function (event, node) {

		d3.select(node).classed('selected', true);
	};

	graphics.handleNodeUnselected = function (event, node) {

		console.log("handling node unselected");

		d3.select(node).classed('selected', false);
	};

})(window, jQuery, d3);