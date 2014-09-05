(function (window, undefined) {

'use strict';

var transformer = window.setNamespace('app.transformer'),
    app         = window.use('app');

/**
 * An interface between the Neo4j data structure and the data structure
 * used by this framework
 */
transformer.Neo4jTransformer = app.createClass(transformer.AbstractDataTransformer, {

	nodeId: function (data) {

		var dataId = index = data.id.lastIndexOf('/'),
			id;

        if (index == -1) {
            return null;
        }

        id = data.id.substring(index + 1, data.id.length);

        return id;
	},

	/**
	 * Transform data from neo4j
	 */
	from: function (nodeResult, edgeResult) {

		var graph,
			nodes = [],
			edges = [],
			node, id, nodeData, nodeLabels,
			obj,
			edge,
			nodeIndexMap = {},
			nodeCount = 0,
			properties,
			map = this.options.map,
			mappedProperties;

		for (var i = 0; i < nodeResult.data.length; i++) {
			properties = {};
			mappedProperties = {};
			nodeData = nodeResult.data[i][0];
			nodeLabels = nodeResult.data[i][1];

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

			node = {
				_id: this.nodeId(nodeData.self),
				_properties: properties,
				_labels: nodeLabels
			};

			// throw everything back in one object for now
			// TODO keep data split from other node stuff
			$.extend(node, mappedProperties);
			nodes.push(node);
		}

		console.log(nodes);
	},

	/**
	 * Transform data to neo4j
	 */
	to: function (data) {
		return data;
	}
});

}(window));