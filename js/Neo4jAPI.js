(function (window, $, undefined) {

'use strict';

var graph       = window.setNamespace('app.graph'),
    transformer = window.use('app.transformer'),
    app         = window.use('app'),
    model       = window.use('app.model'),
    NodeEvent   = window.use('app.event.NodeEvent'),
    EdgeEvent   = window.use('app.event.EdgeEvent'),
    _defaults   = {
        host: 'localhost',
        port: 7474,
        version: 2,
    },
    self;

graph.Neo4jAPI = app.createClass({

    construct: function (options) {

        this.options = $.extend({}, _defaults, options);

        self = this;
    },

    url: function (path) {
        var url = 'http://' + this.options.host;

        if (this.options.port) {
            url += ':' + this.options.port;
        }

        if (path) {
            url += path;
        }

        return url;
    },

    nodeUrl: function (id) {

        var path = '/db/data/node';

        if (id) {
            path += '/' + id;
        }

        return this.url(path);
    },

    edgeUrl: function (id) {

        var path = '/db/data/relationship';

        if (id) {
            path += '/' + id;
        }

        return this.url(path);
    },

    cypherUrl: function () {
        return this.url('/db/data/cypher');
    },

    initialize: function () {
        $(this.kernel).on(NodeEvent.CREATED, this.handleNodeCreated.bind(this));
        $(this.kernel).on(NodeEvent.DESTROYED, this.handleNodeDeleted.bind(this));
        $(this.kernel).on(EdgeEvent.CREATED, this.handleEdgeCreated.bind(this));
        $(this.kernel).on(EdgeEvent.DESTROYED, this.handleEdgeDeleted.bind(this));
        $(this.kernel).on(NodeEvent.UPDATED, this.handleNodeUpdated.bind(this));
        $(this.kernel).on(NodeEvent.UPDATED, this.handleNodeLabelUpdated.bind(this));
    },

    get: function (callback) {

        var nodeQuery = {
            query: 'START n=node(*) RETURN n, labels(n)',
            // query: 'START n=node(*) RETURN n',
            params: {}
        };
        var edgeQuery = {
            query: 'START r=relationship(*) RETURN r',
            params: {}
        };
        var url = this.cypherUrl();
        var graph;

        // TODO use promises
        $.post(url, nodeQuery)
         .done(function (nodeResult) {

        $.post(url, edgeQuery)
         .done(function (edgeResult) {

            graph = transformer.neo4j.from(nodeResult, edgeResult);

            callback(graph);
         });
        });
    },

    /**
     * Create a node in the neo4j database
     * Store the id to easily delete the node later
     */
    handleNodeCreated: function (event, node, data) {

        var url = this.nodeUrl(),
            props = transformer.neo4j.toNode(data);

        $.ajax({
            url: url,
            data: props,
            type: 'POST',
            async: false
        }).done(function (result) {
            data._id = transformer.neo4j.idFromSelf(result.self);
        });
    },

    /**
     * We're doing this with a cypher, because we also have to delete
     * all relationships
     */
    handleNodeDeleted: function (event, data) {

        var query,
            url = this.cypherUrl();

        // TODO this query should work, but can't find parameter nodeId
        // query = {
        //      "query" : "START n=node({nodeId}) OPTIONAL MATCH n-[r]-() DELETE n,r",
        //      "params" : {
        //          "nodeId": nodeId
        //  }
        // };
        query = {
            "query" : "START n=node("+data._id+") OPTIONAL MATCH n-[r]-() DELETE n,r",
            // "query" : "START n=node("+data._id+") MATCH n-[r?]-() DELETE n,r",
            "params" : {}
        };

        $.post(url, query);
    },

    handleEdgeCreated: function (event, data, source, target) {

        var url = this.nodeUrl(source._id) + '/relationships',
            props = {
                to: this.edgeUrl(target._id),
                type: data.type
            };

        $.post(url, props)
         .done(function (result) {
            data._id = transformer.neo4j.idFromSelf(result.self);
         });
    },

    handleEdgeDeleted: function (event, data) {

        var url = this.edgeUrl(data._id);

        $.ajax({
            url: url,
            type: 'DELETE'
        });
    },

    handleNodeUpdated: function (event, node, data, update) {

        // check if a property was updated
        if (!update.changed(model.Node.getPropertiesPath()) &&
            !update.changed('_style')) {
            
            return;
        }

        console.log("api: handling node update");
        console.log(data._id);

        var obj = transformer.neo4j.toNode(data),
            url = this.nodeUrl(data._id) + '/properties';

        $.ajax({
            url: url,
            type: 'PUT',
            data: obj
        });
    },

    /**
     * Removes all labels from the node and replaces them with the ones in data
     * @param data string or array<string>
     */
    handleNodeLabelUpdated: function (event, node, data, update) {

        // check if a label was added or removed
        if (!update.changed(model.Node.getLabelsPath())) {
            return;
        }

        console.log("api: handling node label update");
        console.log(data._id);

        var url = this.nodeUrl(data._id) + '/labels';

        $.ajax({
            url: url,
            type: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify(data._labels)
        });
    }
});

}(window, window.jQuery));