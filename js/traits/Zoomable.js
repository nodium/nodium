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

		var zoomHandler = window.curry(this.handleZoom, this);
		var zoomStartHandler = window.curry(this.handleZoomStart, this);
		var zoomEndHandler = window.curry(this.handleZoomEnd, this);
		d3.select(this.graph.selector + ' .graph-viewport')
		  .call(d3.behavior.zoom()
		  	.on('zoom', zoomHandler)
		  	.on('zoomstart', zoomStartHandler)
		  	.on('zoomend', zoomEndHandler)
		  );
	};

	graph.Zoomable.prototype.handleZoom = function () {

		var prototype = 'translate(__translate__) scale(__scale__)',
			transform = prototype
				.replace(/__translate__/g, d3.event.translate)
				.replace(/__scale__/g, d3.event.scale);

		d3.select(this.graph.selector).select('.graph-content').attr('transform', transform);
	};

	graph.Zoomable.prototype.handleZoomStart = function () {

		this.graph.dragging = true;
	};

	graph.Zoomable.prototype.handleZoomEnd = function () {

		this.graph.dragging = false;
	};

}(window, jQuery, d3));