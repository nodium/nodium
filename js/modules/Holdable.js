(function (context, $, d3, undefined) {

'use strict';

var modules   = context.setNamespace('app.modules'),
    app       = context.use('app'),
    HoldEvent = context.use('app.event.HoldEvent'),

    _defaults = {
        'duration': 500
    },
    self;

/**
 * Holdable module
 *
 * Adds functionality to click and hold a node or the canvas
 */
modules.Holdable = app.createClass({

    construct: function (options) {

        self = this;

        this.options = $.extend({}, _defaults, options);
    },

    /**
     * Initializes variables and attaches events used for creating edges
     */
    initialize: function () {

        // TODO graph.holdActions???
        this.graph.holdActions = {};
        this.graph.holdActions[graph.Drag.LEFT] = "None";
        this.graph.holdActions[graph.Drag.RIGHT] = "None";
        this.graph.holdActions[graph.Drag.UP] = "None";
        this.graph.holdActions[graph.Drag.DOWN] = "None";
    },

    handleHoldStart: function (event, node, data, position) {

        var graph = this.graph;

        this.holdTimeoutId = window.setTimeout(function () {

            // we're only really holding the node if we're not dragging
            if (!graph.dragging) {
                console.log("holding");
                graph.holding = true;

                if (node) {
                    $(self.kernel).trigger(HoldEvent.NODE, [node, data]);
                } else {
                    $(self.kernel).trigger(HoldEvent.CANVAS, [{}, position]);
                    graph.holding = false;
                }
            }
        }, this.options.duration);
    },

    /**
     * Show some information about the drag action
     */
    handleHoldDrag: function (event, node, data) {
        
        var infoText;

        if (!this.graph.holding) {
            return;
        }

        event.sourceEvent.preventDefault();

        if (this.graph.dragDistance > 100) {
            infoText = this.graph.holdActions[this.graph.dragDirection];
        } else {
            infoText = "Too close";
        }
    },

    handleHoldEnd: function (event, node, data) {

        window.clearTimeout(this.holdTimeoutId);
        
        if (!node) {
            return;
        }

        // dispatch menu action if node was held
        // use a fixed distance that has to be dragged
        if (this.graph.holding && this.graph.dragDistance > 100) {
            switch(this.graph.dragDirection) {
                case graph.Drag.LEFT:
                    $(this.kernel).trigger(HoldEvent.DRAGLEFT, [node, data]);
                    break;
                case graph.Drag.RIGHT:
                    $(this.kernel).trigger(HoldEvent.DRAGRIGHT, [node, data]);
                    break;
                case graph.Drag.UP:
                    $(this.kernel).trigger(HoldEvent.DRAGUP, [node, data]);
                    break;
                case graph.Drag.DOWN:
                    $(this.kernel).trigger(HoldEvent.DRAGDOWN, [node, data]);
                    break;
            }
        }

        this.graph.dragging = false;
        this.graph.holding = false;
    },
});

}(this, jQuery, d3));
