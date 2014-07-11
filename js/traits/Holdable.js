(function (window, $, d3, undefined) {
	var graph = window.setNamespace('app.graph'),
		app   = window.setNamespace('app');

	/**
	 * Holdable trait
	 *
	 * Adds functionality to click and hold a node or the canvas
	 */
	graph.Holdable = function () {

		// enforce use of new on constructor
		if ((this instanceof graph.Holdable) === false) {
			return new graph.Holdable(arguments);
		}

		$(this).on('trait', this.attachHoldable);
	};

	/**
	 * Initializes variables and attaches events used for creating edges
	 */
	graph.Holdable.prototype.attachHoldable = function () {

		var startHold = window.curry(this.handleHoldStart, this);
		var dragHold = window.curry(this.handleHoldDrag, this);
		var endHold = window.curry(this.handleHoldEnd, this);
		$(this).on('mouse-down', startHold);
		$(this).on('drag', dragHold);
		$(this).on('drag-end', endHold);

		this.holdActions = {};
		this.holdActions[graph.Drag.LEFT] = "None";
		this.holdActions[graph.Drag.RIGHT] = "None";
		this.holdActions[graph.Drag.UP] = "None";
		this.holdActions[graph.Drag.DOWN] = "None";

		// add the action notification element
		// $(this.selector).append('<span id="hold-action-notification"></span>');
		$('#hold-action-notification').toggle();
	};

	/**
	 * Scale a node relative to the default size
	 */
	graph.Holdable.prototype.scaleNode = function (node, scale) {

		var self = this;

		d3.select(node).select('circle').transition()
		    .duration(400)
		    .attr("r", function(d) { return scale * self.getNodeRadius(d)*2; });
	};

	graph.Holdable.prototype.handleHoldStart = function (event, node, data) {

		var self = this;

		this.holdTimeoutId = setTimeout(function () {

			// we're only really holding the node if we're not dragging
			if (!self.dragging) {
				console.log("holding");
				self.holding = true;

				// show a nice transition while we're at it
				console.log(node);
				d3.select(node).select('.top-circle').classed('hover', true);
				// self.scaleNode(node, 1.3);

				$('#hold-action-notification').toggle();
			}
		}, 500);
	};

	/**
	 * Show some information about the drag action
	 */
	graph.Holdable.prototype.handleHoldDrag = function (event, node, data) {
		
		var infoText;

		if (!this.holding) {
			return;
		}

		event.sourceEvent.preventDefault();

		if (this.dragDistance > 100) {
			infoText = this.holdActions[this.dragDirection];
		} else {
			infoText = "Too close";
		}

		$info = $('#hold-action-notification');
		$info.text(infoText);
	};

	graph.Holdable.prototype.handleHoldEnd = function (event, node, data) {

		clearTimeout(this.holdTimeoutId);

		// dispatch menu action if node was held
		// use a fixed distance that has to be dragged
		if (this.holding && this.dragDistance > 100) {
			switch(this.dragDirection) {
				case graph.Drag.LEFT:
					$(this).trigger('drag-left', [node, data]);
					break;
				case graph.Drag.RIGHT:
					$(this).trigger('drag-right', [node, data]);
					break;
				case graph.Drag.UP:
					$(this).trigger('drag-up', [node, data]);
					break;
				case graph.Drag.DOWN:
					$(this).trigger('drag-down', [node, data]);
					break;
			}
		}

		if (this.holding) {
			//this.scaleNode(node, 1);
			d3.select(node).select('.top-circle').classed('hover', false);

			this.holding = false;
			$('#hold-action-notification').toggle();
			$('#hold-action-notification').text("");
		}
	};

}(window, jQuery, d3));