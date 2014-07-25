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

		this.selector = selector;

		this.api = new graph.API();

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
		])
		.register(new graph.EdgeCD(), [
			['drag-end', 'handleLinking']
		])
		.register(new graph.Holdable({
			'duration': 400
		}),[['mouse-down', 'handleHoldStart'],
			['drag', 'handleHoldDrag'],
			['drag-end', 'handleHoldEnd'],
			['drag-end', 'app.graph.graphics.handleNodeScale', 1],
			['holding-node', 'app.graph.graphics.handleNodeScale', 1.3]
		])
		.register(new graph.Pinnable(), [
			['drag-right', 'handleNodePinned']
		])
		.register(this.api)
		// .register(new graph.Stylable(), {
		// 	'node-pinned': 'handleNodeStyled',
		// });

		// UI handlers that initiate an action event
		var keyDownHandler = window.curry(this.handleKeyDown, this);
        $(window).on('keydown', keyDownHandler);

		this.initialize();
	};

	graph.Neo4jGUI.prototype = new graph.Graph();

	graph.Neo4jGUI.prototype.getGraphData = function () {
		this.api.get(window.curry(this.handleGraphData, this), this.addNodeMetadata);
	};

	graph.Neo4jGUI.prototype.handleKeyDown = function (event) {

		console.log("handling key down");

		if (event.keyCode === 27) {
            $(this).trigger(NodeEvent.UNSELECT);
        } else if (event.keyCode === 90 && event.ctrlKey) {
        	console.log("CTRLz");
        }
	};

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