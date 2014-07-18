(function (window, $, d3, undefined) {
	var graph = window.setNamespace('app.graph'),
		app   = window.setNamespace('app');

	/**
	 * Linkable trait
	 *
	 * Adds functionality to link nodes by hovering them on top of each other
	 */
	graph.EdgeCD = function () {

		// enforce use of new on constructor
		if ((this instanceof graph.EdgeCD) === false) {
			return new graph.EdgeCD(arguments);
		}
	};

	/**
	 * Initializes variables and attaches events used for creating edges
	 */
	graph.EdgeCD.prototype.initialize = function () {};

	/**
	 * Handles the event 
	 */
	graph.EdgeCD.prototype.handleLinking = function () {

		if (!this.graph.dragging) {
			return;
		}

		// TODO this can probably be done better (without using graph properties)
		if (this.graph.draggedNode && this.graph.hoveredNode) {
			this.updateLink(this.graph.draggedNode.data, this.graph.hoveredNode.data);
		}
	};

	/**
	 * Creates a edge from source to target of type type if it does not exist yet.
	 * Deletes the edge if it exists.
	 */
	graph.EdgeCD.prototype.updateLink = function (source, target, type) {
		var edges = this.graph.edges,
			edge,
			i,
			toDelete,
			deletered = false;

		type = type === undefined ? "POINTS_TO" : type;

		console.log("updating link");

		if (source.index == target.index) {
			return;
		}

		// check if there's a edge already between source and target
		for (i = edges.length-1; i >= 0; i--) {
			edge = edges[i];

			// if (edge.type != type) {
			// 	continue;
			// }

			if ((edge.source.index == source.index && edge.target.index == target.index) ||
				(edge.source.index == target.index && edge.target.index == source.index)) {

				edges.splice(i, 1);
				deletered = true;
				toDelete = edge;
			}
		}

		// delete or remove edge
		if (!deletered) {

			// add new edge
			edge = {
				source: source.index,
				target: target.index,
				type: type
			};

			edges.push(edge);

			$(this.graph).trigger('edge-created', [edge, source, target]);
		} else {
			$(this.graph).trigger('edge-deleted', [toDelete]);
		}

		// redraw the complete graph
		// TODO move this to some edge-deleted/created handlers somewhere else
		this.graph.drawLinks();
		this.graph.redrawNodes();
		this.graph.force.start();
	};

}(window, jQuery, d3));