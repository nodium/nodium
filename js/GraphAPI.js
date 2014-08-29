(function (window, $, undefined) {

'use strict';

var graph       = window.setNamespace('app.graph'),
    app         = window.use('app'),
    NodeEvent   = window.use('app.event.NodeEvent'),
    _defaults   = {
        host: 'localhost',
        port: 7474
    };

graph.API = app.createClass({

    construct: function (options) {

        this.options = $.extend({}, _defaults, options);
    },

    url: function (path) {
        var url = 'http://' + this.options.host + ':' + this.options.port;

        if (path) {
            url += path;
        }

        return url;
    },

    initialize: function () {
        var createNode = window.curry(this.handleNodeCreated, this);
        $(this.kernel).on(NodeEvent.CREATED, createNode);
        var deleteNode = window.curry(this.handleNodeDeleted, this);
        $(this.kernel).on(NodeEvent.DESTROYED, deleteNode);
        var createEdge = window.curry(this.handleEdgeCreated, this);
        $(this.kernel).on('edge-created', createEdge);
        var deleteEdge = window.curry(this.handleEdgeDeleted, this);
        $(this.kernel).on('edge-deleted', deleteEdge);
        $(this.kernel).on(NodeEvent.UPDATED, this.handleNodeUpdated.bind(this));
        $(this.kernel).on(NodeEvent.UPDATEDLABEL, this.handleNodeLabelUpdated.bind(this));
    },

    get: function (callback, addNodeMetadata) {

        // OPTIONAL MATCH n-[r]-m
        var special = this.options.special;
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

            var graph,
		 		nodes = [],
		 		edges = [],
		 		node, nodeId, nodeData, nodeLabels,
		 		obj,
		 		edge,
		 		nodeMap = {},
		 		nodeCount = 0,
		 		properties,
		 		specialProperties;

		 	if (!nodeResult.data) {
		 		return;
		 	}

		 	// build the nodes array and the index map
		 	for (var i = 0; i < nodeResult.data.length; i++) {
		 		properties = {};
		 		specialProperties = {};
		 		nodeData = nodeResult.data[i];
		 		node = nodeData[0];
		 		nodeLabels = nodeData[1];

		 		if (!node || nodeMap[node.self] !== undefined) {
		 			continue;
		 		}

		 		// split data properties from special app properties
		 		for (var j in node.data) {
		 			if (special.hasOwnProperty(j)) {
		 				specialProperties[special[j]] = node.data[j];
		 			} else {
		 				properties[j] = node.data[j];
		 			}
		 		}

		 		addNodeMetadata(properties);

		 		properties._labels = nodeLabels;
		 		properties.id = node.self;

		 		nodeMap[node.self] = nodeCount;
		 		nodeCount++;

		 		// throw everything back in one object for now
		 		// TODO keep data split from other node stuff
		 		obj = $.extend({}, properties, specialProperties);
		 		nodes.push(obj);
		 	}

		 	// convert the edges to an array of d3 edges,
		 	// which have node indices as source and target
		 	for (var i = 0; i < edgeResult.data.length; i++) {
		 		edge = edgeResult.data[i][0];

		 		if (!edge) {
		 			continue;
		 		}

		 		edges.push({
		 			id: edge.self,
		 			source: nodeMap[edge.start],
		 			target: nodeMap[edge.end],
                    type: edge.type
		 		});

                if (edge.type == 'SYNONYM') {
                    console.log('SYNONYM');
                    console.log(edge);
                }
		 	}

		 	graph = {
		 		nodes: nodes,
		 		edges: edges
		 	};

		 	callback(graph);
         });
        });
    },

    /**
     * Create a node in the neo4j database
     * Store the id to easily delete the node later
     */
    handleNodeCreated: function (event, data) {

        var props = this.graph.getCleanNodeData(data),
            url = this.url('/db/data/node');

        // $.post(url, props)
        $.ajax({
            url: url,
            data: props,
            type: 'POST',
            async: false
        }).done(function (result) {
            data.id = result.self;
         });
    },

    /**
     * We're doing this with a cypher, because we also have to delete
     * all relationships
     */
    handleNodeDeleted: function (event, data) {

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
        //      "query" : "START n=node({nodeId}) OPTIONAL MATCH n-[r]-() DELETE n,r",
        //      "params" : {
        //          "nodeId": nodeId
        //  }
        // };
        query = {
            "query" : "START n=node("+nodeId+") OPTIONAL MATCH n-[r]-() DELETE n,r",
            // "query" : "START n=node("+nodeId+") MATCH n-[r?]-() DELETE n,r",
            "params" : {}
        };

        $.post(url, query)
         .done(function (result) {
            console.log(result);
        });
    },

    handleEdgeCreated: function (event, data, source, target) {

        var props = {
            to: target.id,
            type: data.type
        };

        $.post(source.id+'/relationships', props)
         .done(function (result) {
            data.id = result.self;
         });
    },

    handleEdgeDeleted: function (event, data) {

        $.ajax({
            url: data.id,
            type: 'DELETE'
        })
        .done(function (result) {
        });
    },

    handleNodeUpdated: function (event, node, data) {

        console.log("handling node update");
        console.log(data.id);

        // prepare the data to be sent
        var properties,
        	specialProperties,
        	obj;

        properties = this.graph.getCleanNodeData(data);
        specialProperties = this.graph.getSpecialNodeData(data, this.options.special);

        obj = $.extend({}, properties, specialProperties);

        $.ajax({
            url: data.id + '/properties',
            type: 'PUT',
            data: obj
        })
        .done(function (result) {
        });
    },

    /**
     * Removes all labels from the node and replaces them with the ones in data
     * @param data string or array<string>
     */
    handleNodeLabelUpdated: function (event, node, data) {

        console.log("handling node label update");
        console.log(data.id);

        $.ajax({
            url: data.id + '/labels',
            type: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify(data._labels)
        })
        .done(function (result) {
        });
    }
});

}(window, jQuery));