(function (window, $, d3, _, undefined) {

'use strict';

var modules       = window.setNamespace('app.modules'),
    transformer = window.setNamespace('app.transformer'),
    app         = window.use('app'),
    NodeEvent   = window.use('app.event.NodeEvent'),
    EdgeEvent   = window.use('app.event.EdgeEvent');

/**
 * NodeEditor trait
 *
 * Adds functionality to create new nodes
 */
modules.NodeCD = app.createClass({

    construct: function () {

        this.labels = [];
    },

    /**
     * Initializes variables and attaches events used for creating edges
     */
    initialize: function () {

        $(this.kernel)
            .on(NodeEvent.SELECT, this.handleNodeSelect.bind(this))
            .on(NodeEvent.UNSELECT, this.handleNodeUnselect.bind(this))
            .on(NodeEvent.CREATE, this.handleNodeCreate.bind(this))
            .on(NodeEvent.DESTROY, this.handleNodeDestroy.bind(this))
            .on(NodeEvent.UPDATE, this.handleNodeUpdate.bind(this))
            .on(NodeEvent.UPDATELABEL, this.handleNodeLabelUpdate.bind(this))
            .on(NodeEvent.LOADED, this.handleGraphLoaded.bind(this));
    },

    /**
     * Create a node from a given set of key value pairs
     */
    createNode: function (data, x, y) {

        console.log("creating node, x: " + x + ", y: " + y);

        // then add node metadata
        // this.graph.addNodeMetadata(data);
        var node = transformer.neo4j.initNode(data);

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

    updateDataWithLabels: function (data, labels) {

        // return false if data wasn't updated
        if (_.isEqual(data._labels, labels)) {
            return false;
        }

        data._labels = labels;

        return true;
    },

    updateDataWithProperties: function (data, properties) {

        console.log(data._properties);
        console.log(properties);

        // return false if data wasn't updated
        if (_.isEqual(data._properties, properties)) {
            console.log("equal")
            return false;
        }

        console.log("unequal");
        data._properties = properties;

        return true;
    },

    updateProperty: function (node, data, property, value) {

        data[property] = value;

        $(this.kernel).trigger(NodeEvent.UPDATED, [node, data]);
    },

    /**
     * Event Listeners
     */

    /**
     * Read the node into the edit form
     */
    handleNodeSelect: function (event, node, data) {

        console.log('node select');

        var selectedNode = this.graph.selectedNode;

        // do nothing if we're trying to reselect the selected node
        if (selectedNode) {

            if (selectedNode.data.index == data.index) {
                console.log("not doing anything =I");
                return;
            }

            $(this.kernel).trigger(NodeEvent.UNSELECT, [selectedNode.node, selectedNode.data]);
        }

        // TODO fix this differently
        this.graph.selectedNode = {
            node: node,
            data: data
        };

        $(this.kernel).trigger(NodeEvent.SELECTED, [node, data]);
    },

    handleCanvasHold: function (event, position) {

        var nodeData;

        nodeData = this.createNode({}, position.x, position.y);

        $(this.kernel).trigger(NodeEvent.SELECT, [null, nodeData]);
    },

    /**
     *
     */
    handleNodeUnselect: function (event, node, data) {

        // if node and data are null, unselect all nodes
        var selectedNode = this.graph.selectedNode;

        console.log('handling unselecting node');

        if (data) {
            $(this.kernel).trigger(NodeEvent.UNSELECTED, [node, data]);
        } else if (selectedNode) {
            $(this.kernel).trigger(NodeEvent.UNSELECTED, [selectedNode.node, selectedNode.data]);
        }

        if (selectedNode) {
            this.graph.selectedNode = null;
        }
    },

    handleCreateChildNode: function (event, node, data) {

        var self = this,
            newData = this.createNode({}, data.x, data.y);
            // newNode = d3.select('.node:nth-child(' + (newData.index+1) + ')', this.graph.selector);

        // passing newNode to trigger select doesn't work, because the nodes
        // are redrawn in the create edge trigger

        newData.fixed = true;

        $(this.kernel)
            .trigger(EdgeEvent.CREATE, [data, newData])
            .trigger(NodeEvent.SELECT, [null, newData]);
        
        newData.fixed = false;
    },

    handleNodeCreate: function (event) {

        event.preventDefault();
        event.stopPropagation();

        var input = $('#new-node-name').val();
        if (input == '') {
            return;
        }

        $('#new-node-name').val('');

        this.createNode({name: input});
    },

    /**
     * Handles the update of properties
     */
    handleNodeUpdate: function (event, node, data, properties) {

        event.preventDefault();
        event.stopPropagation();

        console.log("handling node properties update");

        if (!properties) {
            console.log("no properties passed");
            return;
        }

        // let's see if we can do without the bothersome selectedNode
        // if (!this.graph.selectedNode) {
        //     return;
        // }

        // if (!node) {
        //     node = this.graph.selectedNode.node;
        // }

        node = this.graph.resolveNode(node, data);
        data = this.graph.resolveData(node, data);

        if (this.updateDataWithProperties(data, properties)) {

            // TODO this should be a response (in graphics?) to NodeEvent.UPDATED
            console.log(node);
            this.graph.setNodeText(node, data);

            $(this.kernel).trigger(NodeEvent.UPDATED, [node, data]);
        }
    },

    /**
     * Handles the update of properties
     */
    handleNodeLabelUpdate: function (event, node, data, labels) {

        event.preventDefault();
        event.stopPropagation();

        console.log("handling node labels update");

        if (!labels) {
            console.log("no labels passed");
            return;
        }

        node = this.graph.resolveNode(node, data);
        data = this.graph.resolveData(node, data);

        if (this.updateDataWithLabels(data, labels)) {

            $(this.kernel).trigger(NodeEvent.UPDATEDLABEL, [node, data]);
        }
    },
    
    handleNodeDestroy: function (event, node, data) {

        var selectedNode = this.graph.selectedNode,
            nodeData;

        nodeData = data || (selectedNode && selectedNode.data);

        if (nodeData) {
            this.destroyNode(nodeData);
        }
    },

    handlePropertyUpdate: function (event, node, data, property, value) {

        this.updateProperty(node, data, property, value);
    },

    handleGraphLoaded: function (event, nodes, edges) {

        var i,
            node,
            label;

        var labels = [];

        // inventarize the labels
        for (i = 0; i < nodes.length; i++) {
            node = nodes[i];

            if (node._labels) {
                labels = _.union(labels, node._labels);
            }
        }

        this.labels = labels;
    }
});

}(window, jQuery, d3, _));