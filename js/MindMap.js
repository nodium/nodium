(function (window, $, d3, undefined) {
	var graph = window.setNamespace('app.graph'),
		app   = window.setNamespace('app');

	/**
	 * Characteristics of the kinect graph:
	 * - controllable through the kinect C:
	 */
	graph.MindMap = function (selector) {

		// enforce use of new on constructor
		if ((this instanceof graph.MindMap) === false) {
			return new graph.MindMap(arguments);
		}

		this.selector = selector;

		this.api = new graph.API(this);

		// here we put the actual linking of traits to events
		// so that the traits contain only the logic and are kept generic
		var pinnableConfig = {
			'drag-right': 'handleNodePinned'
		};

		this.trait(new graph.Pinnable(), pinnableConfig);
	};

	graph.MindMap.prototype = new graph.Graph();

	graph.MindMap.prototype.getBase = function () {

		return this.__proto__.__proto__;
	};

	graph.MindMap.prototype.getGraphData = function () {
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