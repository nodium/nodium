(function (context, $, d3, undefined) {

'use strict';

var graph     = context.setNamespace('app.graph'),
    modules   = context.setNamespace('app.modules'),
    app       = context.use('app'),
    EdgeEvent = context.use('app.event.EdgeEvent'),
    _defaults;

/**
 * EdgeCRUD module
 *
 * Adds functionality to link nodes by hovering them on top of each other
 */
modules.EdgeCRUD = app.createClass({

    construct: function (options) {

        this.options = $.extend({}, _defaults, options);
    },

    /**
     * Initializes variables and attaches events used for creating edges
     */
    initialize: function () {

        // non-customizable events
        $(this.kernel)
            .on(EdgeEvent.CREATE, this.handleCreateEdge.bind(this))
            .on(EdgeEvent.DESTROY, this.handleDestroyEdge.bind(this));
    },

    /**
     * Handles the event 
     */
    handleLinking: function () {

        console.log("handling linking");

        if (!this.graph.dragging) {
            return;
        }

        // TODO this can probably be done better (without using graph properties)
        if (this.graph.draggedNode && this.graph.hoveredNode) {
            this.updateLink(this.graph.draggedNode.data, this.graph.hoveredNode.data);
        }
    },

    handleCreateEdge: function (event, source, target) {

        console.log('handling edge creation');

        this.updateLink(source, target, undefined, 2);
    },

    handleDestroyEdge: function (event, source, target) {

        console.log('handling edge deletion');

        this.updateLink(source, target, undefined, 1);
    },

    handleUpdateEdge: function (event, edge, update) {

        var recreate = false,
            source,
            target,
            type,
            index;

        /* doesn't work yet

        // direction is relative to source
        if (update.hasOwnProperty('direction')) {
            recreate = true;
            source = edge.target;
            target = edge.source;
        }

        if (recreate) {
            // index = edge.index; // does it have this??
            index = this.indexOfEdge(edge.source, edge.target, edge.type);

            this.replace(index, {
                source || edge.source,
                target || edge.target,
                type || edge.type
            });
        }
        */
    },

    /**
     * returns the type of edge that should be used for this source and target
     */
    resolveEdgeType: function (source, target) {
        return 'POINTS_TO';
    },

    /**
     * Returns the index of the edge
     *
     * @param string type If not given, returns index of the first edge between nodes
     */
    indexOfEdge: function (source, target, type) {

        var index = -1;

        this.graph.edges.forEach(function (edge, i) {

            if (type && edge.type !== type) {
                return;
            }

            if ((edge.source.index == source.index && edge.target.index == target.index) ||
                (edge.source.index == target.index && edge.target.index == source.index)) {

                index = i;
            }
        });

        return index;
    },

    create: function (edge, properties) {

        // edge should at least have a source, target and type
        if (!edge.hasOwnProperty('source')
            || !edge.hasOwnProperty('target')
            || !edge.hasOwnProperty('type')) {

            return null;
        }

        this.graph.edges.push(edge);

        $(this.kernel).trigger(EdgeEvent.CREATED, [edge, source, target]);
    },

    replace: function (index, edge) {

        var replacedEdge = this.graph.edges[index];

        this.graph.edges[index] = edge;

        $(this.kernel).trigger(EdgeEvent.REPLACED, [edge, replacedEdge]);
    },



    /**
     * Creates a edge from source to target of type type if it does not exist yet.
     * Deletes the edge if it exists.
     *
     * @param integer action falsy if toggle, 1 if destroy, 2 if create
     */
    updateLink: function (source, target, type, action) {
        var edgeIndex = this.indexOfEdge(source, target, type),
            edge;

        type = type === undefined ? this.resolveEdgeType(source, target) : type;

        if (source.index == target.index) {
            return;
        }
        // console.log("updating link");
        // console.log(type);

        // // check if there's already an edge between source and target
        // for (i = edges.length-1; i >= 0; i--) {
        //     edge = edges[i];

        //     // if (edge.type != type) {
        //     //  continue;
        //     // }

        //     if ((edge.source.index == source.index && edge.target.index == target.index) ||
        //         (edge.source.index == target.index && edge.target.index == source.index)) {

        //         edges.splice(i, 1);
        //         deletered = true;
        //         toDelete = edge;
        //     }
        // }

        // determine action
        console.log('ACTION: ' + action);
        if (!action) {
            action = edgeIndex === -1 ? 2 : 1;
        }
        console.log('ACTION: ' + action);

        // create or destroy edge
        if (edgeIndex === -1 && action === 2) {

            edge = {
                source: source.index,
                target: target.index,
                type: type
            };

            this.graph.edges.push(edge);

            $(this.kernel).trigger(EdgeEvent.CREATED, [edge, source, target]);

        } else if (edgeIndex >= 0 && action === 1) {

            edge = this.graph.edges[edgeIndex];
            this.graph.edges.splice(edgeIndex, 1);

            $(this.kernel).trigger(EdgeEvent.DESTROYED, [edge]);
        }

        // TODO move this to some edge deleted/created handlers somewhere else
        this.graph.drawLinks();
        this.graph.force.start();
    }
});

}(this, jQuery, d3));
