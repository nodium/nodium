(function (window, $, d3, undefined) {

'use strict';

var graph     = window.setNamespace('app.graph'),
    app       = window.use('app'),
    EdgeEvent = window.use('app.event.EdgeEvent');

/**
 * EdgeCD trait
 *
 * Adds functionality to link nodes by hovering them on top of each other
 */
graph.EdgeCD = app.createClass({

    /**
     * Initializes variables and attaches events used for creating edges
     */
    initialize: function () {

        // non-customizable events
        $(this.kernel)
            .on(EdgeEvent.CREATE, this.handleCreateEdge.bind(this))
            .on(EdgeEvent.UPDATEFUNCTION, this.handleFunctionUpdate.bind(this));
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

        this.updateLink(source, target);
    },

    handleFunctionUpdate: function (event, name, fn) {

        console.log('handling function update');
        console.log(name);
        console.log(fn);

        this[name] = fn;
    },

    /**
     * returns the type of edge that should be used for this source and target
     */
    resolveEdgeType: function (source, target) {
        return 'POINTS_TO';
    },

    /**
     * Creates a edge from source to target of type type if it does not exist yet.
     * Deletes the edge if it exists.
     */
    updateLink: function (source, target, type) {
        var edges = this.graph.edges,
            edge,
            i,
            toDelete,
            deletered = false;

        type = type === undefined ? this.resolveEdgeType(source, target) : type;

        if (source.index == target.index) {
            return;
        }
        console.log("updating link");
        console.log(type);

        // check if there's already an edge between source and target
        for (i = edges.length-1; i >= 0; i--) {
            edge = edges[i];

            // if (edge.type != type) {
            //  continue;
            // }

            if ((edge.source.index == source.index && edge.target.index == target.index) ||
                (edge.source.index == target.index && edge.target.index == source.index)) {

                edges.splice(i, 1);
                deletered = true;
                toDelete = edge;
            }
        }

        // delete or remove edge
        if (!deletered) {

            // add new edge
            edge = {
                source: source.index,
                target: target.index,
                type: type
            };

            edges.push(edge);

            $(this.kernel).trigger('edge-created', [edge, source, target]);
        } else {
            $(this.kernel).trigger('edge-deleted', [toDelete]);
        }

        // TODO move this to some edge-deleted/created handlers somewhere else
        this.graph.drawLinks();
        this.graph.force.start();

        // console.log(d3.selectAll('.node, .link'));
        // d3.selectAll('.node, .link').sort(function (a, b) { // select the parent and sort the path's
        //  if (a._fields && !b._fields) {
        //      return 1;
        //  } else if (!a._fields && b._fields) {
        //      return -1;
        //  } else {
        //      return 0;
        //  }
        // });
    }
});

}(window, jQuery, d3));