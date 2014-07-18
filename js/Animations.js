(function (window, $, d3, undefined) {

	graph 		= window.setNamespace('app.graph');
	animations  = window.setNamespace('app.graph.animations');

	/*
	 * Functions here are probably executed in scope of the trait
	 */

	animations.scaleNode = function (scale, node, graph) {

		d3.select(node).select('circle').transition()
		    .duration(400)
		    .attr("r", function(d) { return scale * graph.getNodeRadius(d)*2; });
	};

	animations.handleNodeScale = function (scale, event, node, data) {
		console.log(arguments);

		animations.scaleNode(scale, node, this.graph);
	};

})(window, jQuery, d3);