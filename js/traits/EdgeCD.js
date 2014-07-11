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

		$(this).on('trait', this.attachEdgeCD);
	};

	/**
	 * Initializes variables and attaches events used for creating edges
	 */
	graph.EdgeCD.prototype.attachEdgeCD = function () {

		// make the base code fire a createLink event
		var linkHandler = window.curry(this.handleLinking, this);
		$(this).on('drag-end', linkHandler);
	};

	/**
	 * Handles the event 
	 */
	graph.EdgeCD.prototype.handleLinking = function () {

		if (!this.dragging) {
			return;
		}

		if (this.draggedNode && this.hoveredNode) {
			this.updateLink(this.draggedNode.data, this.hoveredNode.data, 'OI');
		}
	};

	/**
	 * Creates a edge from source to target of type type if it does not exist yet.
	 * Deletes the edge if it exists.
	 */
	graph.EdgeCD.prototype.updateLink = function (source, target, type) {
		var edge,
			i,
			toDelete,
			deletered = false;

		console.log("updating link");

		if (source.index == target.index) {
			return;
		}

		// check if there's a edge already between source and target
		for (i = this.edges.length-1; i >= 0; i--) {
			edge = this.edges[i];

			// if (edge.type != type) {
			// 	continue;
			// }

			if ((edge.source.index == source.index && edge.target.index == target.index) ||
				(edge.source.index == target.index && edge.target.index == source.index)) {

				console.log(i);
				console.log(edge);
				this.edges.splice(i, 1);
				deletered = true;
				toDelete = edge;
				// break;
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

			this.edges.push(edge);

			$(this).trigger('edge-created', [edge, source, target]);
		} else {
			$(this).trigger('edge-deleted', [toDelete]);
		}

		// redraw the complete graph
		this.drawLinks();
		this.redrawNodes();
		this.force.start();
	};

}(window, jQuery, d3));