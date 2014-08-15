(function (window, $, d3, undefined) {

    'use strict';

    var graph = window.setNamespace('app.graph'),
        app   = window.setNamespace('app');

    /**
     * Filterable trait
     *
     * Adds functionality to click and hold a node or the canvas
     */
    graph.Filterable = function () {

        // enforce use of new on constructor
        if ((this instanceof graph.Filterable) === false) {
            return new graph.Filterable(arguments);
        }
    };

    /**
     * Initializes variables and attaches events used for creating edges
     */
    graph.Filterable.prototype.initialize = function () {

        
    };

    graph.Filterable.prototype.drawNodeOverlay = function (nodeEnter) {

        var self = this;

        nodeEnter.append('svg:circle')
            .attr('class', 'overlay')
            .attr('r', function (data) {
                var radius = self.graph.getNodeRadius() * 2;

                return radius;
            })
        ;
    };

    graph.Filterable.prototype.filter = function (needle) {

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
    };

    graph.Filterable.prototype.resetFilter = function () {

        d3.selectAll('.filtered').classed('filtered', false);
    };

    graph.Filterable.prototype.handleNodeDrawn = function (event, nodeEnter) {

        this.drawNodeOverlay(nodeEnter);
    };

    graph.Filterable.prototype.handleNodeFilter = function (event, query) {

        var data = this.filter(query);
        $(this.kernel).trigger('node-filtered', [undefined, data]);
    };

    graph.Filterable.prototype.handleNodeFilterUnset = function (event) {

        this.resetFilter();
    };

}(window, jQuery, d3));