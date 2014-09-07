(function (window, $, d3, undefined) {

'use strict';

var modules = window.setNamespace('app.modules'),
    app   = window.use('app');

/**
 * Holdable trait
 *
 * Adds functionality to click and hold a node or the canvas
 */
modules.Holdable = app.createClass({

    construct: function (options) {

        var _defaults = {
            'duration': 1000
        };

        this.options = $.extend({}, _defaults, options);
    },

    /**
     * Initializes variables and attaches events used for creating edges
     */
    initialize: function () {

        this.graph.holdActions = {};
        this.graph.holdActions[graph.Drag.LEFT] = "None";
        this.graph.holdActions[graph.Drag.RIGHT] = "None";
        this.graph.holdActions[graph.Drag.UP] = "None";
        this.graph.holdActions[graph.Drag.DOWN] = "None";
    },

    handleHoldStart: function (event, node, data, position) {

        var self = this;
        var graph = this.graph;

        this.holdTimeoutId = window.setTimeout(function () {

            // we're only really holding the node if we're not dragging
            if (!graph.dragging) {
                console.log("holding");
                graph.holding = true;

                if (node) {
                    $(self.kernel).trigger('holding-node', [node, data]);
                } else {
                    $(self.kernel).trigger('holding-canvas', [position]);
                    graph.holding = false;
                }
            }
        }, 500);
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

        // $info = $('#hold-action-notification');
        // $info.text(infoText);
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
                    $(this.kernel).trigger('drag-left', [node, data]);
                    break;
                case graph.Drag.RIGHT:
                    $(this.kernel).trigger('drag-right', [node, data]);
                    break;
                case graph.Drag.UP:
                    $(this.kernel).trigger('drag-up', [node, data]);
                    break;
                case graph.Drag.DOWN:
                    $(this.kernel).trigger('drag-down', [node, data]);
                    break;
            }
        }

        this.graph.dragging = false;
        this.graph.holding = false;
    },
});

}(window, jQuery, d3));