(function (window, $, d3, undefined) {

'use strict';

var graph = window.setNamespace('app.graph'),
    app   = window.use('app');

/**
 * Filterable trait
 *
 * Adds functionality to click and hold a node or the canvas
 */
graph.Filterable = app.createClass({

    /**
     * Initializes variables and attaches events used for creating edges
     */
    initialize: function () {

        
    },

    drawNodeOverlay: function (nodeEnter) {

        var self = this;

        nodeEnter.append('svg:circle')
            .attr('class', 'overlay')
            .attr('r', function (data) {
                var radius = self.graph.getNodeRadius() * 2;

                return radius;
            })
        ;
    },

    filter: function (needle) {

        var filteredData = [];

        d3.selectAll('.node').classed('filtered', function (data) {
            var i,
                field,
                value,
                regex;

            regex = new RegExp(needle, "i");

            for (i = data._fields.length; i > 0; i--) {
                field = data._fields[i - 1];
                value = String(data[field]);

                if (value.match(regex)) {
                    filteredData.push(data);
                    return false;
                }
            }

            return true;
        });

        return filteredData;
    },

    resetFilter: function () {

        d3.selectAll('.filtered').classed('filtered', false);
    },

    handleNodeDrawn: function (event, nodeEnter) {

        this.drawNodeOverlay(nodeEnter);
    },

    handleNodeFilter: function (event, query) {

        var data = this.filter(query);
        $(this.kernel).trigger('node-filtered', [undefined, data]);
    },

    handleNodeFilterUnset: function (event) {

        this.resetFilter();
    }
});

}(window, jQuery, d3));