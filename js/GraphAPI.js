(function (window, $, undefined) {
	var graph 	  = window.setNamespace('app.graph'),
		NodeEvent = window.use('app.event.NodeEvent'),
		_defaults = {
			host: 'localhost',
			port: 7474
		};

	graph.API = function (options) {

		// enforce use of new on constructor
		if ((this instanceof graph.API) === false) {
			return new graph.API(arguments);
		}

		this.options = $.extend({}, _defaults, options);
	};

	graph.API.prototype.url = function (path) {
		var url = 'http://' + this.options.host + ':' + this.options.port;

		if (path) {
			url += path;
		}

		return url;
	};

	graph.API.prototype.initialize = function () {
		console.log("yo");
		console.log(this.kernel);
		var createNode = window.curry(this.handleNodeCreated, this);
		$(this.kernel).on(NodeEvent.CREATED, createNode);
		var deleteNode = window.curry(this.handleNodeDeleted, this);
		$(this.kernel).on(NodeEvent.DESTROYED, deleteNode);
		var createEdge = window.curry(this.handleEdgeCreated, this);
		$(this.kernel).on('edge-created', createEdge);
		var deleteEdge = window.curry(this.handleEdgeDeleted, this);
		$(this.kernel).on('edge-deleted', deleteEdge);
		var updateNode = window.curry(this.handleNodeUpdated, this);
		$(this.kernel).on(NodeEvent.UPDATED, updateNode);
	};

	graph.API.prototype.get = function (callback, addNodeMetadata) {

		// OPTIONAL MATCH n-[r]-m
		var nodeQuery = {
		  "query" : "START n=node(*) RETURN n, labels(n)",
		  // query: 'START n=node(*) RETURN n',
		  "params" : {}
		};
		var edgeQuery = {
		  "query" : "START r=relationship(*) RETURN r",
		  "params" : {}
		};
		var url = this.url('/db/data/cypher');

		$.post(url, nodeQuery)
		 .done(function (nodeResult) {

		$.post(url, edgeQuery)
		 .done(function (edgeResult) {

		 	// console.log(data);
		 	// parse the neo4j data
		 	var graph,
		 		nodes = [],
		 		edges = [],
		 		node, nodeId, nodeData, nodeLabels,
		 		edge,
		 		nodeMap = {},
		 		nodeCount = 0;

		 	if (!nodeResult.data) {
		 		return;
		 	}

		 	// build the nodes array and the index map
		 	for (var i = 0; i < nodeResult.data.length; i++) {
		 		nodeData = nodeResult.data[i];
		 		node = nodeData[0];
		 		nodeLabels = nodeData[1];

		 		if (!node || nodeMap[node.self] !== undefined) {
		 			continue;
		 		}

		 		addNodeMetadata(node.data);
		 		node.data._labels = nodeLabels;

		 		nodeMap[node.self] = nodeCount;
		 		nodeCount++;

		 		node.data.id = node.self;
		 		nodes.push(node.data);
		 	}

		 	// convert the edges to an array of d3 edges,
		 	// which have node indices as source and target
		 	console.log()
		 	for (var i = 0; i < edgeResult.data.length; i++) {
		 		edge = edgeResult.data[i][0];

		 		if (!edge) {
		 			continue;
		 		}

		 		edges.push({
		 			id: edge.self,
		 			source: nodeMap[edge.start],
		 			target: nodeMap[edge.end]
		 		});
		 	}

		 	// console.log(nodes);

		 	graph = {
		 		nodes: nodes,
		 		edges: edges
		 	};

		 	callback(graph);
		 });
		});
	};

	/**
	 * Create a node in the neo4j database
	 * Store the id to easily delete the node later
	 */
	graph.API.prototype.handleNodeCreated = function (event, data) {

		var props = this.graph.getCleanNodeData(data),
			url = this.url('/db/data/node');

		// $.post(url, props)
		$.ajax({
			url: url,
			data: props,
			type: 'POST',
			async: false
		}).done(function (result) {
		 	console.log(result);
		 	data.id = result.self;

		 	console.log(data);
		 });
	};

	/**
	 * We're doing this with a cypher, because we also have to delete
	 * all relationships
	 */
	graph.API.prototype.handleNodeDeleted = function (event, data) {

		console.log("deleting neo4j node");

		var nodeId,
			index,
			query,
			url = this.url('/db/data/cypher');

		index = data.id.lastIndexOf('/');
		if (index == -1) {
			return;
		}

		nodeId = data.id.substring(index+1, data.id.length);

		// TODO this query should work, but can't find parameter nodeId
		// query = {
		//  	"query" : "START n=node({nodeId}) OPTIONAL MATCH n-[r]-() DELETE n,r",
		//  	"params" : {
		//  		"nodeId": nodeId
		// 	}
		// };
		query = {
		 	"query" : "START n=node("+nodeId+") OPTIONAL MATCH n-[r]-() DELETE n,r",
		 	"params" : {}
		};


		console.log(query);

		$.post(url, query)
		 .done(function (result) {
		 	console.log(result);
		});
	};

	graph.API.prototype.handleEdgeCreated = function (event, data, source, target) {

		console.log("creating neo4j edge");
		console.log(data);

		var props = {
			to: target.id,
			type: "POINTS"
		};

		$.post(source.id+'/relationships', props)
		 .done(function (result) {
		 	console.log(result);
		 	data.id = result.self;
		 });
	};

	graph.API.prototype.handleEdgeDeleted = function (event, data) {

		console.log("deleting neo4j edge");
		console.log(data.id);

		$.ajax({
			url: data.id,
			type: 'DELETE'
		})
		.done(function (result) {
		 	console.log(result);
		});
	};

	graph.API.prototype.handleNodeUpdated = function (event, data, id) {

		console.log("handling node update");
		console.log(id);
		console.log(data);

		$.ajax({
			url: id + '/properties',
			type: 'PUT',
			data: data
		})
		.done(function (result) {
		 	console.log(result);
		});
	};

	/**
	 * Removes all labels from the node and replaces them with the ones in data
	 * @param data string or array<string>
	 */
	graph.API.prototype.handleNodeLabelUpdated = function (event, data, id) {

		console.log("handling node label update");
		console.log(id);
		console.log(data);

		$.ajax({
			url: id + '/labels',
			type: 'PUT',
			data: data
		})
		.done(function (result) {
		 	console.log(result);
		});
	};

}(window, jQuery));