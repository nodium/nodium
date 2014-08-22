(function (window, $, d3, _, undefined) {
    var graph = window.setNamespace('app.graph'),
        app   = window.setNamespace('app'),
        NodeEvent = window.use('app.event.NodeEvent');

    /**
     * NodeEditor trait
     *
     * Adds functionality to create new nodes
     */
    graph.NodeCD = function () {

        // enforce use of new on constructor
        if ((this instanceof graph.NodeCD) === false) {
            return new graph.NodeCD(arguments);
        }

        this.labels = [];
    };

    /**
     * Initializes variables and attaches events used for creating edges
     */
    graph.NodeCD.prototype.initialize = function () {

        $(this.kernel)
            .on(NodeEvent.SELECT, this.handleNodeSelect.bind(this))
            .on(NodeEvent.UNSELECT, this.handleNodeUnselect.bind(this))
            .on(NodeEvent.UPDATE, this.handleNodeUpdate.bind(this))
            .on(NodeEvent.UPDATELABEL, this.handleNodeLabelUpdate.bind(this))
            .on(NodeEvent.LOADED, this.handleGraphLoaded.bind(this));
    };

    /**
     * Create a node from a given set of key value pairs
     */
    graph.NodeCD.prototype.createNode = function (data, x, y) {

        // then add node metadata
        this.graph.addNodeMetadata(data);
        data._labels = [];

        data.x = x || 0;
        data.y = y || 0;

        // then let d3 add other properties
        // TODO do this after the trigger
        this.graph.nodes.push(data);
        this.graph.drawNodes();
        this.graph.force.start();

        $(this.kernel).trigger(NodeEvent.CREATED, [data]);

        return data;
    };

    graph.NodeCD.prototype.deleteEdgesForNode = function (nodeIndex) {

        var edges = this.graph.edges,
            edge;

        // start from top to remove multiple links correctly
        for (var i = edges.length-1; i >= 0; i--) {
            edge = edges[i];
            if (edge.source.index == nodeIndex || edge.target.index == nodeIndex) {
                edges.splice(i, 1);
            }
        }
    };

    /**
     * Handles the delete-node event
     */
    graph.NodeCD.prototype.destroyNode = function (data) {

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
    };

    /**
     * Update the data and return the filtered updated data
     */
    graph.NodeCD.prototype.updateNodeDataWithFields = function (data) {

        var titleField = this.graph.getNodeTitleKey(),
            fields = $('#node-fields').children(),
            key,
            value,
            result = {};

        // clear the fields metadata, we'll refill this
        data._fields = [titleField];

        // set the title field separately
        data[titleField] = $('#node-title').val();
        if (data[titleField]) {
            result[titleField] = data[titleField];
        }

        for (var i = 0; i < fields.length; i++) {
            key = $('.node-key', fields[i]).val();
            value = $('.node-value', fields[i]).val();

            // skip if the key is empty
            if (key == "" || value == "") {
                continue;
            }

            data._fields.push(key);
            data[key] = value;
            result[key] = value;
        }

        // TODO maybe we should try to remove the unused fields from the node data,
        // but this is not strictly necessary, the fields metadata works as a filter

        return result;
    };

    graph.NodeCD.prototype.updateNodeDataWithLabels = function (data) {

        var labels = $('#node-labels').children(),
            label;

        // clear the labels metadata, we'll refill this
        data._labels = [];

        console.log(labels);

        for (var i = 0; i < labels.length; i++) {
            label = $('.node-label-value', labels[i]).val();

            // skip if the key is empty
            if (label == '') {
                continue;
            }

            data._labels.push(label);
        }

        return data;
    };

    /**
     * Event Listeners
     */

    /**
     * Read the node into the edit form
     */
    graph.NodeCD.prototype.handleNodeSelect = function (event, node, data) {

        console.log('node select');

        var selectedNode = this.graph.selectedNode;

        if (selectedNode) {
            $(this.kernel).trigger(NodeEvent.UNSELECT, [selectedNode.node, selectedNode.data]);
        }

        // TODO fix this differently
        this.graph.selectedNode = {
            node: node,
            data: data
        };

        $(this.kernel).trigger(NodeEvent.SELECTED, [node, data]);
    };

    graph.NodeCD.prototype.handleCanvasHold = function (event, position) {

        var nodeData;

        nodeData = this.createNode({}, position.x, position.y);

        $(this.kernel).trigger(NodeEvent.SELECT, [null, nodeData]);
    };

    /**
     *
     */
    graph.NodeCD.prototype.handleNodeUnselect = function (event, node, data) {

        // if node and data are null, unselect all nodes
        var selectedNode = this.graph.selectedNode;

        console.log('handling unselecting node');

        if (data) {
            console.log("data was set");
            console.log(data);
            console.log(node);
            $(this.kernel).trigger(NodeEvent.UNSELECTED, [node, data]);
        } else if (selectedNode) {
            console.log("selected node set")
            console.log(selectedNode);
            $(this.kernel).trigger(NodeEvent.UNSELECTED, [selectedNode.node, selectedNode.data]);
        } /*else {
            $(this.kernel).trigger(NodeEvent.UNSELECTED);
        }*/

        if (selectedNode) {
            console.log(selectedNode);

            this.graph.selectedNode = null;
        }
    };

    graph.NodeCD.prototype.handleCreateChildNode = function (event, node, data) {

        var self = this,
            newData = this.createNode({}, data.x, data.y);
            // newNode = d3.select('.node:nth-child(' + (newData.index+1) + ')', this.graph.selector);

        // passing newNode to trigger select doesn't work, because the nodes
        // are redrawn in the create edge trigger

        $(this.kernel)
            .trigger('create-edge', [data, newData])
            .trigger(NodeEvent.SELECT, [null, newData]);
        
    };

    graph.NodeCD.prototype.handleNodeCreate = function (event) {

        event.preventDefault();
        event.stopPropagation();

        var input = $('#new-node-name').val();
        if (input == '') {
            return;
        }

        $('#new-node-name').val('');

        this.createNode({name: input});
    };

    graph.NodeCD.prototype.handleNodeUpdate = function (event, node, data) {

        event.preventDefault();
        event.stopPropagation();

        var data,
            fieldName,
            titleField = this.graph.getNodeTitleKey(),
            nodeData;      

        console.log("handling node update");

        if (!this.graph.selectedNode) {
            return;
        }

        if (!node) {
            // node = $('.nodes').get(data.index);
            node = this.graph.selectedNode.node;
        }

        console.log(this.graph.selectedNode);

        nodeData = this.graph.selectedNode.data;
        data = this.updateNodeDataWithFields(nodeData);

        console.log(node);
        this.graph.setNodeText(node, nodeData);

        // if (!data[titleField] || data[titleField] == "") {
        //     return;
        // }

        $(this.kernel).trigger(NodeEvent.UPDATED, [data, nodeData.id]);
    };

    graph.NodeCD.prototype.handleNodeLabelUpdate = function (event, node, data) {

        event.preventDefault();
        event.stopPropagation();

        var newData;

        console.log("handling node label update");


        // TODO plzplz dis stuff is ugly
        if (!this.graph.selectedNode) {
            return;
        }

        if (!data) {
            data = this.graph.selectedNode.data;
        }
        newData = this.updateNodeDataWithLabels(data);

        if (!node) {
            // node = $('.nodes').get(data.index);
            node = this.graph.selectedNode.node;
        }

        $(this.kernel).trigger(NodeEvent.UPDATEDLABEL, [node, data]);
        // $(this.kernel).trigger('labels', this.)
    };

    graph.NodeCD.prototype.handleNodeDestroy = function (event, node, data) {

        var selectedNode = this.graph.selectedNode,
            nodeData;

        nodeData = data || (selectedNode && selectedNode.data);

        if (nodeData) {
            this.destroyNode(nodeData);
        }
    };

    graph.NodeCD.prototype.handleGraphLoaded = function (event, nodes, edges) {

        var i,
            node,
            label;

        var labels = [];

        // inventarize the labels
        for (i = 0; i < nodes.length; i++) {
            node = nodes[i];

            if (node._labels) {
                console.log(node._labels);
                labels = _.union(labels, node._labels);
            }
        }

        this.labels = labels;

        console.log(labels);
    };

}(window, jQuery, d3, _));