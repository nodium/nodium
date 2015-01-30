(function (context, $, d3, _, undefined) {

'use strict';

var modules     = context.setNamespace('app.modules'),
    transformer = context.setNamespace('app.transformer'),
    app         = context.use('app'),
    model       = context.use('app.model'),
    NodeEvent   = context.use('app.event.NodeEvent'),
    EdgeEvent   = context.use('app.event.EdgeEvent'),

    _defaults = {
        properties: {}, // default property values on node creation
        labels: [] // default label values on node creation
    }

/**
 * NodeCRUD module
 *
 * Adds CRUD functionality to nodes
 */
modules.NodeCRUD = app.createClass({

    construct: function (options) {

        this.options = $.extend({}, _defaults, options);
    },

    /**
     * Initializes variables and attaches events used for creating edges
     */
    initialize: function () {

        $(this.kernel)
            .on(NodeEvent.CREATE, this.handleNodeCreate.bind(this))
            .on(NodeEvent.UPDATE, this.handleUpdate.bind(this))
            .on(NodeEvent.DESTROY, this.handleNodeDestroy.bind(this))
    },

    /**
     * Create a node from a given set of key value pairs
     */
    createNode: function (properties, labels, x, y) {

        console.log("creating node, x: " + x + ", y: " + y);

        // then add node metadata
        var defaultProperties = this.options.properties,
            property,
            defaultLabels = this.options.labels,
            label,
            data,
            i;

        // we should be careful not to overwrite property values
        for (property in defaultProperties) {

            if (!defaultProperties.hasOwnProperty(property)) {
                continue;
            }

            if (!properties.hasOwnProperty(property)) {
                properties[property] = defaultProperties[property];
            }
        }

        for (i = 0; i < defaultLabels.length; i++) {
            label = defaultLabels[i];

            if (labels.indexOf(label) === -1) {
                labels.push(label);
            }   
        }

        data = model.Node.create(properties, labels);
        data.x = x || 0;
        data.y = y || 0;

        // then let d3 add other properties
        // TODO do this after the trigger
        this.graph.nodes.push(data);
        this.graph.drawNodes();
        this.graph.handleTick();
        this.graph.force.start();

        $(this.kernel).trigger(NodeEvent.CREATED, [null, data]);

        return data;
    },

    deleteEdgesForNode: function (nodeIndex) {

        var edges = this.graph.edges,
            edge;

        // start from top to remove multiple links correctly
        for (var i = edges.length-1; i >= 0; i--) {
            edge = edges[i];
            if (edge.source.index == nodeIndex || edge.target.index == nodeIndex) {
                edges.splice(i, 1);
            }
        }
    },

    /**
     * Handles the delete-node event
     */
    destroyNode: function (data) {

        if (!confirm("destroy node?")) {
            return;
        }

        var graph = this.graph;
        this.deleteEdgesForNode(data.index);

        // remove the node at the index
        graph.nodes.splice(data.index, 1);

        // update the indices of all nodes behind it
        // yes? no?
        // for (var i = data.index; i < this.nodes.length; i++) {
        //  console.log(i + ' ' + this.nodes[i].index);
        //  this.nodes[i].index = i;
        // }

        // TODO move elsewhere
        graph.drawLinks();
        graph.redrawNodes();
        graph.force.start();

        $(this.kernel).trigger(NodeEvent.DESTROYED, [data]);
    },

    updateNode: function (node, data, update) {

        node = this.graph.resolveNode(node, data);
        data = this.graph.resolveData(node, data);

        update.process(data);

        if (update.count) {

            // TODO this should be a response (in graphics?) to NodeEvent.UPDATED
            this.graph.setNodeText(node, data);

            $(this.kernel).trigger(NodeEvent.UPDATED, [node, data, update]);
        }
    },

    /**
     * Event Listeners
     */

    handleCreateChildNode: function (event, node, data) {

        var self = this,
            newData = this.createNode({}, [], data.x, data.y);
            // newNode = d3.select('.node:nth-child(' + (newData.index+1) + ')', this.graph.selector);

        // passing newNode to trigger select doesn't work, because the nodes
        // are redrawn in the create edge trigger

        $(this.kernel)
            .trigger(EdgeEvent.CREATE, [data, newData])
            .trigger(NodeEvent.SELECT, [null, newData]);
    },

    handleNodeCreate: function (event, properties, position) {

        var data;

        event.preventDefault();
        event.stopPropagation();

        if (!position) {
            position = {
                x: 0,
                y: 0
            };
        }

        data = this.createNode(properties, [], position.x, position.y);
    },

    /**
     * Generic update function
     */
    handleUpdate: function (event, node, data, update) {

        event.preventDefault();
        event.stopPropagation();

        console.log("handling node update");

        if (!update) {
            console.log("no update passed");
            return;
        }

        this.updateNode(node, data, update);
    },

    handleNodeDestroy: function (event, node, data) {

        this.destroyNode(data);
    }
});

}(this, jQuery, d3, _));
