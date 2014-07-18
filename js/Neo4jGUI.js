(function (window, $, d3, undefined) {
	var app        = window.setNamespace('app'),
		graph      = window.setNamespace('app.graph'),
		animations = window.setNamespace('app.graph.animations');

	/**
	 * A generic neo4j user interface
	 */
	graph.Neo4jGUI = function (selector) {

		// enforce use of new on constructor
		if ((this instanceof graph.Neo4jGUI) === false) {
			return new graph.Neo4jGUI(arguments);
		}

		this.selector = selector;

		this.api = new graph.API(this);

		// here we put the actual linking of traits to events
		// so that the traits contain only the logic and are kept generic

		this
		.trait(new graph.Zoomable())
		.trait(new graph.NodeCD(), [
			['node-clicked', 'handleNodeSelected'],
			['node-selected', 'app.graph.graphics.handleNodeSelected'],
			['node-unselected', 'app.graph.graphics.handleNodeSelected'],
			['node-deleted', 'handleNodeUnselected'],
			['drag-down', 'handleNodeDelete'],
			['drag-up', 'handleCreateChildNode']
		])
		.trait(new graph.EdgeCD(), [
			['drag-end', 'handleLinking']
		])
		.trait(new graph.Holdable({
			'duration': 400
		}),[['mouse-down', 'handleHoldStart'],
			['drag', 'handleHoldDrag'],
			['drag-end', 'handleHoldEnd'],
			['drag-end', 'app.graph.graphics.handleNodeScale', 1],
			['holding-node', 'app.graph.graphics.handleNodeScale', 1.3]
		])
		.trait(new graph.Pinnable(), [
			['drag-right', 'handleNodePinned']
		])
		// .trait(new graph.Stylable(), {
		// 	'node-pinned': 'handleNodeStyled',
		// });

		this.initialize();
	};

	graph.Neo4jGUI.prototype = new graph.Graph();

	graph.Neo4jGUI.prototype.getBase = function () {

		return this.__proto__.__proto__;
	};

	graph.Neo4jGUI.prototype.getGraphData = function () {
		this.api.get(window.curry(this.handleGraphData, this), this.addNodeMetadata);
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