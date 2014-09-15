(function (window, undefined) {

'use strict';

var transformer = window.setNamespace('app.transformer'),
    app         = window.use('app'),
    model       = window.use('app.model');

/**
 * An interface between the Neo4j data structure and the data structure
 * used by this framework
 */
transformer.Neo4jTransformer = app.createClass(transformer.AbstractDataTransformer, {

	construct: function () {

		// transformer should only be instantiated once per app
		transformer.neo4j = this;
	},

	/**
	 * Extract the node id from neo4j node's self property
	 */
	idFromSelf: function (selfString) {

		var index = selfString.lastIndexOf('/'),
			id;

        if (index == -1) {
            return null;
        }

        id = selfString.substring(index + 1, selfString.length);

        return id;
	},

	/**
	 * Transform data from neo4j
	 */
	from: function (neo4jNodes, neo4jEdges) {

		var nodes = [],
			edges = [],
			node, id, nodeData, nodeLabels,
			nodeIndexMap = {}, nodeCount = 0,
			edge,
			properties,
			map = this.options.map,
			mappedProperties;

		for (var i = 0; i < neo4jNodes.data.length; i++) {

			properties = {};
			mappedProperties = {};

			nodeData = neo4jNodes.data[i][0];
			nodeLabels = neo4jNodes.data[i][1];

			if (!nodeData || nodeIndexMap[nodeData.self] !== undefined) {
				continue;
			}

			// split data properties from mapped app properties
			for (var j in nodeData.data) {
				if (map.hasOwnProperty(j)) {
					mappedProperties[map[j]] = nodeData.data[j];
				} else {
					properties[j] = nodeData.data[j];
				}
			}

			nodeIndexMap[nodeData.self] = nodeCount;
			nodeCount++;

			node = model.Node.create(
				properties,
				nodeLabels,
				this.idFromSelf(nodeData.self)
			);

			$.extend(node, mappedProperties);
			nodes.push(node);
		}

		// convert the edges to an array of d3 edges,
	 	// which have node indices as source and target
	 	for (var i = 0; i < neo4jEdges.data.length; i++) {
	 		edge = neo4jEdges.data[i][0];

	 		if (!edge) {
	 			continue;
	 		}

	 		edges.push({
	 			_id: this.idFromSelf(edge.self),
	 			source: nodeIndexMap[edge.start],
	 			target: nodeIndexMap[edge.end],
                type: edge.type
	 		});
	 	}

	 	console.log("nodes");
	 	console.log(nodes);

	 	return {
	 		nodes: nodes,
	 		edges: edges
	 	}
	},

	/**
	 * Transform data to neo4j nodes and edges
	 */
	to: function (nodes, edges) {

		var neoNodes = [],
			neoEdges = [],
			node,
			edge,
			properties,
			mappedProperties,
			obj;

		if (nodes) {
			for (var i = 0; i < nodes.length; i++) {
				node = nodes[i];

				mappedProperties = this.getMappedProperties(node);
				obj = $.extend({}, node._properties, mappedProperties);

				neoNodes.push(obj);
			}
		}

		if (edges) {
			for (var i = 0; i < edges.length; i++) {
				edge = edges[i];

				neoEdges.push(edge);
			}
		}

		return {
			nodes: neoNodes,
			edges: neoEdges
		}
	},

	toNode: function (node) {
		return this.to([node]).nodes[0];
	}
});

}(window));