(function (context, $, _, undefined) {

'use strict';

var modules     = context.setNamespace('app.modules'),
    app         = context.use('app'),
    model       = context.use('app.model'),
    NodeEvent   = context.use('app.event.NodeEvent'),
    NodeStatus  = context.use('app.constants.NodeStatus'),
    _defaults;

modules.Validatable = app.createClass({

    construct: function (options) {
        
        this.options = $.extend({}, _defaults, options);
    },

    setNodeStatus: function (node, data, status) {

        var update;

        if (!data._properties.hasOwnProperty('status') || data._properties.status !== status) {

            update = new model.Update();
            update.setProperty('status', status);

            $(this.kernel).trigger(NodeEvent.UPDATE, [node, data, update]);
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

}(this, jQuery, _));
