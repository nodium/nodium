(function (window, $, d3, _, undefined) {

'use strict';

var modules     = window.setNamespace('app.modules'),
    transformer = window.setNamespace('app.transformer'),
    app         = window.use('app'),
    model       = window.use('app.model'),
    NodeEvent   = window.use('app.event.NodeEvent'),
    EdgeEvent   = window.use('app.event.EdgeEvent');

/**
 * NodeCRUD module
 *
 * Adds CRUD functionality to nodes
 */
modules.NodeCRUD = app.createClass({

    construct: function () {

        // this.labels = [];
    },

    /**
     * Initializes variables and attaches events used for creating edges
     */
    initialize: function () {

        $(this.kernel)
            .on(NodeEvent.CREATE, this.handleNodeCreate.bind(this))
            .on(NodeEvent.UPDATE, this.handleUpdate.bind(this))
            .on(NodeEvent.DESTROY, this.handleNodeDestroy.bind(this))
            // .on(NodeEvent.UPDATEPROPERTY, this.handleUpdateProperty.bind(this))
            // .on(NodeEvent.UPDATELABEL, this.handleUpdateLabel.bind(this))
            // .on(NodeEvent.LOADED, this.handleGraphLoaded.bind(this));
    },

    /**
     * Create a node from a given set of key value pairs
     */
    createNode: function (properties, x, y) {

        console.log("creating node, x: " + x + ", y: " + y);

        // then add node metadata
        var node = model.Node.create(properties);

        node.x = x || 0;
        node.y = y || 0;

        // then let d3 add other properties
        // TODO do this after the trigger
        this.graph.nodes.push(node);
        this.graph.drawNodes();
        this.graph.handleTick();
        this.graph.force.start();

        $(this.kernel).trigger(NodeEvent.CREATED, [node]);

        return node;
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

    /**
     * Updates the data with the update directives
     * The reason we use directives is that it allows for more
     * control in some cases. E.g. when you want to set a whole
     * sub-object at once.
     */
    processUpdate: function (data, update) {

        var set = update.set,
            unset = update.unset,
            i,
            directive,
            clone = $.extend({}, data),
            difference;

        // we always process unset first, so that
        // at least every property in set will be set

        if (unset) {

            for (i = 0; i < unset.length; i++) {
                directive = unset[i];
                window.removeObjectKeyByPath(data, directive[0])
            }
        }

        if (set) {

            for (i = 0; i < set.length; i++) {
                directive = set[i];
                window.setObjectValueByPath(data, directive[0], directive[1])
            }
        }

        // return the diff
        difference = DeepDiff.diff(clone, data);
        difference = difference || [];
        console.log("difference");
        console.log(difference);

        return difference;
    },

    updateNode: function (node, data, update) {

        var difference;

        node = this.graph.resolveNode(node, data);
        data = this.graph.resolveData(node, data);

        difference = this.processUpdate(data, update);

        if (difference.length) {

            // TODO this should be a response (in graphics?) to NodeEvent.UPDATED
            this.graph.setNodeText(node, data);

            $(this.kernel).trigger(NodeEvent.UPDATED, [node, data, difference]);
        }
    },

    /**
     * Event Listeners
     */

    handleCreateChildNode: function (event, node, data) {

        var self = this,
            newData = this.createNode({}, data.x, data.y);
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

        data = this.createNode(properties, position.x, position.y);

        // TODO make event chaining configurable?
        $(this.kernel).trigger(NodeEvent.SELECT, [null, data]);
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
    },

    // handleGraphLoaded: function (event, nodes, edges) {

    //     var i,
    //         node,
    //         label;

    //     var labels = [];

    //     // inventarize the labels
    //     for (i = 0; i < nodes.length; i++) {
    //         node = nodes[i];

    //         if (node._labels) {
    //             labels = _.union(labels, node._labels);
    //         }
    //     }

    //     this.labels = labels;
    // }
});

}(window, jQuery, d3, _));