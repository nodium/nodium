(function (window, $, _, undefined) {

'use strict';

var modules     = window.setNamespace('app.modules'),
    app         = window.use('app'),
    NodeEvent   = window.use('app.event.NodeEvent'),
    NodeStatus  = window.use('app.constants.NodeStatus'),
    _defaults;

modules.Validatable = app.createClass({

    construct: function (options) {
    	this.options = $.extend({}, _defaults, options);
    },

    setNodeStatus: function (node, data, status) {

    	if (false === data.hasOwnProperty('status') || data.status !== status) {

    		console.log(data.status);
    		data.status = status;

    		$(this.kernel).trigger(NodeEvent.UPDATED, [node, data]);
    	}
    },

    /**
     * Event handlers
     */

    /**
     * Invalidates a node
     */
    handleDragLeft: function (event, node, data) {

    	this.setNodeStatus(node, data, NodeStatus.DENIED);
    },

    /**
     * Validates a node
     */
    handleDragRight: function (event, node, data) {

    	this.setNodeStatus(node, data, NodeStatus.ACCEPTED);
    },

    handleNodeDrawn: function (event, nodeEnter) {

    	var graph = this.graph;

    	nodeEnter.attr('class', function (data) {

	    	data.status = data.status || NodeStatus.PENDING;

	    	return [
	    		graph.getNodeClassValue(),
	    		data.status
	    	].join(' ');
	    });
    }
});

}(window, window.jQuery, window._));