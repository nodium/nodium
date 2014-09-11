(function (window, $, d3, undefined) {

'use strict';

var modules     = window.setNamespace('app.modules'),
    app         = window.use('app'),
    NodeEvent   = window.use('app.event.NodeEvent');

/**
 * Selectable module
 *
 * Adds functionality to select and unselect nodes
 */
modules.Selectable = app.createClass({

    construct: function () {

        this.selectedNode = null;
    },

    initialize: function () {

        $(this.kernel)
            .on(NodeEvent.SELECT, this.handleNodeSelect.bind(this))
            .on(NodeEvent.UNSELECT, this.handleNodeUnselect.bind(this));
    },

    handleNodeSelect: function (event, node, data) {

        console.log('node select');

        var selectedNode = this.selectedNode;

        // do nothing if we're trying to reselect the selected node
        if (selectedNode) {

            if (selectedNode.data.index == data.index) {
                return;
            }

            // unselect the previously selected node
            $(this.kernel).trigger(
            	NodeEvent.UNSELECT,
            	[selectedNode.node, selectedNode.data]
            );
        }

        this.selectedNode = {
            node: node,
            data: data
        };

        $(this.kernel).trigger(NodeEvent.SELECTED, [node, data]);
    },

    handleNodeUnselect: function (event, node, data) {

        // if node and data are null, unselect all nodes
        var selectedNode = this.selectedNode;

        console.log('handling unselecting node');

        if (data) {
            $(this.kernel).trigger(
            	NodeEvent.UNSELECTED,
            	[node, data]
            );

        } else if (selectedNode) {
            $(this.kernel).trigger(
            	NodeEvent.UNSELECTED,
            	[selectedNode.node, selectedNode.data]
            );
        }

        if (selectedNode) {
            this.selectedNode = null;
        }
    }
});

}(window, window.jQuery, window.d3));