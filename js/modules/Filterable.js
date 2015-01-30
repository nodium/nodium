(function (context, $, d3, undefined) {

'use strict';

var modules = context.setNamespace('app.modules'),
    app   = context.use('app');

/**
 * Filterable module
 *
 * Adds functionality to click and hold a node or the canvas
 */
modules.Filterable = app.createClass({

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

            for (field in data._properties) {

                if (!data._properties.hasOwnProperty(field)) {
                    continue;
                }

                value = String(data._properties[field]);

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

}(this, jQuery, d3));
