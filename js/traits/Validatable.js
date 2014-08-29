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
        if (data._fields.indexOf('status') === -1) {
          data._fields.push('status');
        }

    		$(this.kernel).trigger(NodeEvent.UPDATED, [node, data]);
    	}
    },

    /**
     * Event handlers
     */

     /**
      * Invalidates a node
      */
    handleDenyNode: function (event, node, data) {

    	this.setNodeStatus(node, data, NodeStatus.DENIED);
    },

    /**
     * Validates a node
     */
    handleAcceptNode: function (event, node, data) {

    	this.setNodeStatus(node, data, NodeStatus.ACCEPTED);
    }
});

}(window, window.jQuery, window._));