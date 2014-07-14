(function (window, $, d3, undefined) {

	var app = window.setNamespace('app'),
		graph = window.setNamespace('app.graph');

	graph.Graph = function (selector) {

		// enforce use of new on constructor
		// TODO why is app needed here???
		if ((this instanceof app.graph.Graph) === false) {
			return new app.graph.Graph(arguments);
		}

		// the base graph svg
		// contains a .graph-viewport and a .graph-content
		this.selector = selector || this.selector;

		// this.visibleNodes = this.nodes;

		// to distinguish between node and canvas drags e.a.
		this.draggedNode = null;
		this.dragging = false;
		this.dragDirection = 0;

		// the node that is being hovered
		// needed for drag starts
		this.hoveredNode = null;

		// the node that was clicked on
		this.selectedNode = null;

		this._traitEvents = [];

		// set during initialization
		this.nodeCount;
		this.edgeCount;
	};

	/**
	 * Add one trait
	 */
	graph.Graph.prototype.trait = function (trait, config) {

		var traitEvent = {
			config: config
		};

		events = $._data($(trait)[0], "events");

		// add the handler to the traitEvents array
		if (events && events['trait']) {
			for (var e = 0; e < events['trait'].length; e++) {
				traitEvent.attach = events['trait'][e].handler;
			}
		}

		this._traitEvents.push(traitEvent);

		$.extend(this, trait);

		return this;
	};

	/**
	 * Give as many traits as you like without config, prolly deprecated soon
	 */
	graph.Graph.prototype.addTraits = function () {

		var events;

		for (var i = 0; i < arguments.length; i++) {
			this.trait(arguments[i]);
		}

		return this;
	};

	graph.Graph.prototype.attachConfigEvents = function (config) {

		var key,
			value;

		for (key in config) {
			value = config[key];

			if (this.hasOwnProperty(value) && typeof(this[value]) === "function") {
				console.log("attaching " + key + " to " + value);
				$(this).on(key, window.curry(this[value], this));
			} else {
				console.log("couldn't attach " + key + " to " + value);
			}
		}
	}


	/*
	 * Graph initialization and utility functions
	 */

	/**
	 * Get the data from the graph html and clear it
	 */
	graph.Graph.prototype.getGraphData = function () {

		var graphData = $(this.selector).data('graph');
		$(this.selector).attr('data-graph', null);

		for (var i = 0; i < graphData.nodes.length; i++) {
			this.addNodeMetadata(graphData.nodes[i]);
		}

		this.handleGraphData(graphData);
	};

	/** 
	 * Adds the metadata so we can distinguish the actual data
	 * fields from the properties added by d3
	 */
	graph.Graph.prototype.addNodeMetadata = function (node) {
		var fields = [],
			key;

		for (key in node) {
			fields.push(key);
		}

		node._fields = fields;
	};

	/**
	 * Returns an object with only the real data of the node
	 */
	graph.Graph.prototype.getCleanNodeData = function (data) {

		var fields = data._fields,
			cleaned = {},
			value;

		if (!fields) {
			return cleaned;
		}

		for (var i = 0; i < fields.length; i++) {
			key = fields[i];
			value = data[key];

			if (!value) {
				continue;
			}

			cleaned[key] = value;
		}

		return cleaned;
	};

	/**
	 * asynchronous callback function incase of database call
	 * expects a graph object with nodes and edges properties
	 */
	graph.Graph.prototype.handleGraphData = function (graph) {

		this.nodes = graph.nodes || [];
		this.edges = graph.edges || [];

		// draw the graph
		this.force = this.createForce();
		this.force.start();
		this.drawLinks();
		this.drawNodes();

		// NOTE: handleTick currently is dependent on this.node initialized in drawNodes()
		tickHandler = window.curry(this.handleTick, this);
		this.force.on('tick', tickHandler);

		this.handleWindowResize();
	};

	graph.Graph.prototype.createForce = function () {

		var self = this,
			force,
			tickHandler;

		force = d3.layout.force()
		.charge(-2500)
		.linkDistance(function (data) {
			return self.getLinkDistance(data);
		})
		.size([10000, 10000])
		.nodes(this.nodes)
		.links(this.edges)
		.linkStrength(function (data) {
			return 1;
		})

		return force;
	};

	/**
	 * Add event handlers in this method
	 */
	graph.Graph.prototype.initialize = function () {

		this.initializeTraits();
		this.initializeType();

		// put in resizable trait?
		var windowResizeHandler = window.curry(this.handleWindowResize, this);
		$(window).on('resize', windowResizeHandler);

		// initialize the viewport translation and scale
		this.initializeViewport();

		this.getGraphData();
	};

	graph.Graph.prototype.initializeType = function () {};

	graph.Graph.prototype.initializeTraits = function () {

		var attach,
			config;

		for (var i = 0; i < this._traitEvents.length; i++) {
			attach = this._traitEvents[i].attach;
			config = this._traitEvents[i].config;
			
			if (attach) {
				attach.call(this);
			}

			if (config) {
				this.attachConfigEvents(config)
			}
		}
	};

	graph.Graph.prototype.initializeViewport = function () {
		d3.select(this.selector + ' .graph-viewport')
			.attr('transform', function (data) {

				var scale = 0.2;

				translate = "-220, -700"
				prototype = 'translate(__translate__) scale(__scale__)',
				transform = prototype
					.replace(/__translate__/g, translate)
					.replace(/__scale__/g, scale);

				return transform;
			});
	};

	graph.Graph.prototype.getNodeRadius = function (data) {
		return 25;
	};

	graph.Graph.prototype.getLinkDistance = function (linkData){
		var distance = 50,
			r1,
			r2;

		if(linkData.source.r && linkData.target.r) {
			distance += (linkData.source.r + linkData.target.r );
		} else {
			r1 = this.getNodeRadius(linkData.source);
			r2 = this.getNodeRadius(linkData.target);

			distance += (r1 + r2);
		}
		
		return distance;
	};

	/**
	 * Example events object with all the events we've used so far
	 */
	graph.Graph.prototype.getEventsObject = function () {

		eventsObject = {
			'dragstart': window.currySelf(this.handleNodeDragStart, this),
			'drag': window.currySelf(this.handleNodeDrag, this),
			'dragend': window.currySelf(this.handleNodeDragEnd, this),
			'mouseover': window.currySelf(this.handleMouseOver, this),
			'mouseout': window.currySelf(this.handleMouseOut, this),
			'click': window.currySelf(this.handleMouseClick, this),
			'mouseup': window.currySelf(this.handleMouseUp, this),
			'mousedown': window.currySelf(this.handleMouseDown, this)
		};

		return eventsObject;
	};

	graph.Graph.prototype.getNodeClassValue = function (data) {
		return "node";
	};

	graph.Graph.prototype.getLinkClassValue = function (data) {
		return "link";
	};


	/*
	 * Drawing the graph
	 */

	/*
	 * Drawing the nodes
	 */

	graph.Graph.prototype.getVisibleNodes = function () {
		return this.nodes;
	};

	/**
	 * Removes all nodes and redraws them
	 */
	graph.Graph.prototype.redrawNodes = function () {
		d3.select(this.selector + ' .nodes').selectAll('.node').remove();

		this.drawNodes();
	};

	graph.Graph.prototype.drawNodes = function () {

		// in case you only want to draw a subset
		var nodes = this.getVisibleNodes(),
			node = d3.select(this.selector + ' .nodes').selectAll('.node')
				.data(nodes/*, function(d) { return d.id; }*/),
			nodeEnter = node.enter().append('g');

		this.drawNodeExit(node.exit());
		this.attachNodeEvents(nodeEnter);
		this.drawNodeEnter(nodeEnter);
		this.drawNodeTexts(nodeEnter);

		this.node = node;

		return this;
	};

	graph.Graph.prototype.attachNodeEvents = function (nodeEnter) {
		var eventsObject = this.getEventsObject();

		nodeEnter
			.on('click', eventsObject['click'])
			.on('mouseover', eventsObject['mouseover'])
			.on('mouseout', eventsObject['mouseout'])
			.on('mouseup', eventsObject['mouseup'])
			.on('mousedown', eventsObject['mousedown'])
			.call(d3.behavior.drag()
				.on('dragstart', eventsObject['dragstart'])
				.on('drag', eventsObject['drag'])
				.on('dragend', eventsObject['dragend']));
	};

	graph.Graph.prototype.drawNodeEnter = function (nodeEnter) {

		var self = this;

		nodeEnter.attr('class', function (data) {
			return self.getNodeClassValue(data);
		});

		nodeEnter.append('circle')
			.attr('r', function(data) {
				var radius = self.getNodeRadius(data) * 2;

				return radius;
			})
			.attr('class', 'top-circle');
	};

	graph.Graph.prototype.drawNodeExit = function (nodeExit) {
		nodeExit.remove();
	};

	graph.Graph.prototype.splitNodeText = function (name, treshold) {
		var parts,
			part,
			half,
			halfLength = name.length / 2,
			diffLength;

		treshold = treshold || 10;

		if (!name || name.length < treshold || name === "") {
			return [name];
		}

		parts = name.split(' ');

		half = parts[0];

		for (var i = 1; i < parts.length; i++) {
			part = parts[i];

			// the current difference with half
			diffLength = Math.abs(halfLength - half.length);

			// check if adding the current part still decreases the difference
			if (Math.abs(halfLength - (half.length + part.length + 1)) < diffLength) {
				half += " " + part;
			} else {
				return [half, parts.slice(i).join(' ')];
			}
		}

		return [name];
	};

	graph.Graph.prototype.getNodeTextDY = function (data, slices) {
		if (slices <= 1) {
			return 5;
		}

		return -3;
	};

	/**
	 * Get the text that should be shown on the node from the data
	 * Should return null when text not there
	 */
	graph.Graph.prototype.getNodeTitleKey = function (data) {
		return 'name';
	};

	graph.Graph.prototype.getNodeText = function (data) {
		return data[this.getNodeTitleKey()];
	};

	graph.Graph.prototype.drawNodeTexts = function (nodeEnter) {

		var self = this;

		var textNode = nodeEnter.append('text')
			.attr('text-anchor', 'middle')

		var textDrawer = window.currySelf(this.drawNodeText, this);
		textNode.each(textDrawer);
	};

	graph.Graph.prototype.drawNodeText = function (self, data) {

		var text = self.getNodeText(data),
			textParts = [],
			element = d3.select(this);

		if (!text) {
			return;
		}

		// clear the element
		element.text('');

		textParts = self.splitNodeText(text);

		element.attr('dy', self.getNodeTextDY(data,textParts.length));

		// we have max. 2 text parts
		for (var i = 0; i < textParts.length; i++) {
			var tspan = element.append('tspan').text(textParts[i]);
			if (i > 0) {
				tspan.attr('x', 0).attr('dy', 20);
			}
		}
	};


	/*
	 * Drawing the links
	 */

	graph.Graph.prototype.getVisibleLinks = function () {
		return this.edges;
	};

	/**
	 * Remove all links and draw everything
	 */
	graph.Graph.prototype.redrawLinks = function () {
		d3.select(this.selector + ' .links').selectAll('.link').remove();

		this.drawLinks();
	};

	graph.Graph.prototype.drawLinks = function () {

		// in case you only want to draw a subset
		links = this.getVisibleLinks();

		var link = d3.select(this.selector + ' .links').selectAll('.link')
			.data(links),
			linkEnter = link.enter().append('polyline');
			
		this.drawLinkExit(link.exit());
		this.drawLinkEnter(linkEnter);

		this.link = link;

		return this;
	};

	graph.Graph.prototype.drawLinkEnter = function (linkEnter) {

		var self = this;

		linkEnter.attr('class', function (data) {
			return self.getLinkClassValue(data);
		});
	};

	graph.Graph.prototype.drawLinkExit = function (linkExit) {
		linkExit.remove();
	};



	/*
	 * Handlers
	 */

	/*
	 * Mousing
	 */

	graph.Graph.prototype.handleMouseOver = function (graph, data) {

		graph.hoveredNode = {
			data: data,
			node: this
		};
	};

	graph.Graph.prototype.handleMouseOut = function (graph, data) {

		graph.hoveredNode = null;
	};

	graph.Graph.prototype.handleMouseClick = function (graph, data) {

		// don't click after a drag event
		if (d3.event.defaultPrevented) {
			return;
		}

		$(graph).trigger('node-clicked', [this, data]);
	};

	graph.Graph.prototype.handleMouseDown = function (graph, data) {

		$(graph).trigger('mouse-down', [this, data]);
	};	

	graph.Graph.prototype.handleMouseUp = function (graph, data) {

		$(graph).trigger('mouse-up');
	};	

	/*
	 * Dragging
	 */

	/**
	 * Keep track of data about the drag, such as direction and distance
	 */
	graph.Graph.prototype.updateDragData = function (x, y) {

		var xAbs,
			yAbs,
			distance;
		
		if (!this.draggedNode) {
			return;
		}

		this.xChange = this.xChange + x;
		this.yChange = this.yChange + y;
		xAbs = Math.abs(this.xChange);
		yAbs = Math.abs(this.yChange);
		this.dragDistance = Math.sqrt(Math.pow(xAbs, 2) + Math.pow(yAbs, 2));

		if (this.xChange > 0 && yAbs < xAbs) {
			this.dragDirection = graph.Drag.RIGHT;
		} else if (this.xChange < 0 && yAbs < xAbs) {
			this.dragDirection = graph.Drag.LEFT;
		} else if (this.yChange > 0 && xAbs < yAbs) {
			this.dragDirection = graph.Drag.DOWN;
		} else if (this.yChange < 0 && xAbs < yAbs) {
			this.dragDirection = graph.Drag.UP;
		}
	};

	graph.Graph.prototype.handleNodeDrag = function (graph, data) {

		// update the distance and direction of the drag
		graph.updateDragData(d3.event.dx, d3.event.dy);

		$(graph).trigger(d3.event, [this, data]);

		if (!d3.event.sourceEvent.defaultPrevented) {

			// because drag start is not actually dragging yet (we haven't moved)
			graph.dragging = true;
			this.style['pointerEvents'] = 'none';
			
			// node drag functionality

			data.px += d3.event.dx;
			data.py += d3.event.dy;

			data.x += d3.event.dx;
			data.y += d3.event.dy;

			// update the visuals while dragging
			graph.handleTick();
		}
	};

	graph.Graph.prototype.handleNodeDragStart = function (graph, data) {

		// use d3 event?
		$(graph).trigger('drag-start', [this, data]);

		// used to stop canvas from dragging too
		d3.event.sourceEvent.stopPropagation();

		graph.xChange = 0;
		graph.yChange = 0;

		// also log the start location of the node
		graph.draggedNode = {
			data: data,
			node: this
		};

		graph.force.stop();
	};

	graph.Graph.prototype.handleNodeDragEnd = function (graph, data) {

		// use d3 event?
		$(graph).trigger('drag-end', [this, data]);

		// clean up
		graph.draggedNode.node.style['pointerEvents'] = 'auto';
		graph.draggedNode = null;
		graph.dragging = false;

		graph.force.resume();
	};


	/*
	 * Other
	 */

	graph.Graph.prototype.handleWindowResize = function (event) {
		var width = $(window).width(),
			height = $(window).height();

		$(this.selector)
			.attr('width', width)
			.attr('height', height);
	};

	graph.Graph.prototype.handleTick = function () {

		var link = this.link,
			node = this.node,
			self = this;
				
		node.attr('transform', function (data) {

			var translation = 'translate(__x__, __y__)';
				w = 10000,
				h = 10000,
				r = self.getNodeRadius(data) * 2,
				position = {
					x: Math.max(r, Math.min(w - r, data.x)),
					y: Math.max(r, Math.min(h - r, data.y))
				};

			data.x = position.x;
			data.y = position.y;

			return translation.replace(/__x__/g, position.x).replace(/__y__/g, position.y);
		});

		if (link) {
			link.attr("points", function (data) {
	      		return data.source.x + "," + data.source.y + " " + 
	            	(data.source.x + data.target.x)/2 + "," +
	            	(data.source.y + data.target.y)/2 + " " +
	             	data.target.x + "," + data.target.y;
	        });
		}
	};


	/*
	 * Constants
	 */

	graph.Drag = {
		LEFT: 1,
		RIGHT: 2,
		UP: 3,
		DOWN: 4
	};


}(window, jQuery, d3));