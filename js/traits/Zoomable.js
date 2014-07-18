(function (window, $, d3, undefined) {
	var graph = window.setNamespace('app.graph'),
		app   = window.setNamespace('app');

	/**
	 * Zoomable trait
	 *
	 * Adds standard d3 zooming and panning functionality to the graph
	 */
	graph.Zoomable = function () {

		// enforce use of new on constructor
		if ((this instanceof graph.Zoomable) === false) {
			return new graph.Zoomable(arguments);
		}
	};

	graph.Zoomable.prototype.initialize = function () {
		
		console.log(this.graph);
		console.log(d3.select(this.graph.selector + ' .graph-viewport'));

		var zoomHandler = window.curry(this.handleZoom, this);
		d3.select(this.graph.selector + ' .graph-viewport')
		  .call(d3.behavior.zoom().on("zoom", zoomHandler));
	};

	graph.Zoomable.prototype.handleZoom = function () {

		var prototype = 'translate(__translate__) scale(__scale__)',
			transform = prototype
				.replace(/__translate__/g, d3.event.translate)
				.replace(/__scale__/g, d3.event.scale);

		d3.select(this.graph.selector).select('.graph-content').attr('transform', transform);
	};

}(window, jQuery, d3));