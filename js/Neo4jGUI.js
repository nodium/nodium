(function (window, $, d3, undefined) {
	var app        = window.setNamespace('app'),
		graph      = window.setNamespace('app.graph'),
		animations = window.setNamespace('app.graph.animations'),
		NodeEvent  = window.use('app.event.NodeEvent');

	/**
	 * A generic neo4j user interface
	 */
	graph.Neo4jGUI = function (selector) {

		// enforce use of new on constructor
		if ((this instanceof graph.Neo4jGUI) === false) {
			return new graph.Neo4jGUI(arguments);
		}

		var self = this;

		this.selector = selector;
		this.mode = '';
		this.kernel = this;

		this.api = new graph.API({
			special: {
				__nodestyle: '_style'
			}
		});

		// here we put the actual linking of traits to events
		// so that the traits contain only the logic and are kept generic

		this
		.register(new graph.Zoomable())
		.register(new graph.NodeCD(), [
			['node-clicked', 'handleNodeSelect'],
			[NodeEvent.SELECTED, 'app.graph.graphics.handleNodeSelected'],
			[NodeEvent.UNSELECTED, 'app.graph.graphics.handleNodeUnselected'],
			[NodeEvent.DESTROYED, 'handleNodeUnselect'],
			['drag-down', 'handleNodeDestroy'],
			['drag-up', 'handleCreateChildNode'],
			['holding-canvas', 'handleCanvasHold']
		])
		.register(new graph.EdgeCD(), [
			['drag-end', 'handleLinking']
		])
		.register(new graph.Holdable({
			'duration': 400
		}),[['mouse-down', 'handleHoldStart'],
			['drag', 'handleHoldDrag'],
			['drag-end', 'handleHoldEnd'],
			['mouse-up', 'handleHoldEnd'],
			['drag-end', 'app.graph.graphics.handleNodeScale', 1],
			['holding-node', 'app.graph.graphics.handleNodeScale', 1.3]
		])
		.register(new graph.Pinnable(), [
			['drag-right', 'handleNodePinned']
		])
		.register(new graph.Filterable(), [
			[NodeEvent.DRAWN, 'handleNodeDrawn'],
			[NodeEvent.FILTER, 'handleNodeFilter'],
			[NodeEvent.FILTER_UNSET, 'handleNodeFilterUnset']
		])
		.register(new graph.Colorable(), [
			[NodeEvent.DRAWN, 'handleColorNodes'],
			[NodeEvent.UPDATEDLABEL, 'handleColorNode']
		])
		.register(this.api)
		.register(new graph.Stylable({
			key: '__nodestyle',
			styles: {
				pinnable: ['fixed', 'x', 'y']
			}
		}), [
			['node-pinned', 'handleNodeStyled']
		]);

		// UI handlers that initiate an action event
		var keyDownHandler = window.curry(this.handleKeyDown, this);
        $(window).on('keydown', keyDownHandler);

        $(this)
        	.on('mode-change', this.handleModeChange.bind(this))
        	.on(KeyboardEvent.ESCAPE, this.handleEscapeKey.bind(this));


       	// mouse events
       	d3.select(this.selector).select('.graph-content')
       	.on('mousedown', function () {
			var position = d3.mouse(this);
			$(self.kernel).trigger('mouse-down', [undefined, undefined, { x: position[0], y: position[1] }]);
		})
		.on('mouseup', function () {
			var position = d3.mouse(this);
			$(self.kernel).trigger('mouse-up', [undefined, undefined, { x: position[0], y: position[1] }]);
		});

		this.initialize();
	};

	graph.Neo4jGUI.prototype = new graph.Graph();

	graph.Neo4jGUI.prototype.getGraphData = function () {
		this.api.get(window.curry(this.handleGraphData, this), this.addNodeMetadata);
	};

	graph.Neo4jGUI.prototype.handleKeyDown = function (event) {

		console.log('handleKeyDown');
		console.log(event);

		if (event.keyCode === 27) {
			console.log("escapering");
			$(this).trigger(KeyboardEvent.ESCAPE);
		} else if (event.keyCode === 70 && (event.ctrlKey || event.metaKey)) {
			console.log('ctrl+f');
        } else if (event.keyCode === 90 && (event.ctrlKey || event.metaKey)) {
        	console.log("ctrl+z");
        } else if (event.keyCode === 78 && (event.ctrlKey || event.metaKey)) {

        	event.preventDefault();
        	event.stopPropagation();

        	console.log('ctrl+n');
        	$(this).trigger(NodeEvent.CREATE);
        }
	};

	graph.Neo4jGUI.prototype.handleModeChange = function (event, mode) {
		this.mode = mode;
	};

	graph.Neo4jGUI.prototype.handleEscapeKey = function (event) {

		var eventType;

		console.log(this.mode);

		switch (this.mode) {
			case 'select':
				eventType = NodeEvent.UNSELECT;
				break;
			case 'filter':
				eventType = NodeEvent.FILTER_UNSET;
				break;
			default: // do nothing
				return;
		}

		$(this).trigger(eventType);
		this.mode = '';
	}

	/**
	 * Return the faked data
	 */
	/*
	graph.MindMap.prototype.getGraphData = function () {

		var graphData = {
			nodes: [
				{
                    id: 0,
                    name: 'Spul'
                },
                {
                    id: 1,
                    name: 'Stuff'
                },
                {
                    id: 2,
                    name: 'Staff'
                },
                {
                    id: 3,
                    name: 'Wizard'
                },
                {
                    id: 4,
                    name: 'Lalaala'
                },
                {
                    id: 5,
                    name: 'asdfsdf'
                },
                {
                    id: 6,
                    name: '>.>'
                }

			],
			edges: [
				{
					source: 0,
					target: 1
				}
			]
		};

		this.handleGraphData(graphData);
	};
	*/
	

}(window, jQuery, d3));