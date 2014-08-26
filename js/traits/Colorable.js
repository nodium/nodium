(function (window, $, d3, undefined) {

'use strict';

var graph       = window.setNamespace('app.graph'),
    app         = window.use('app'),
    graphics    = window.use('app.graph.graphics');

/**
 * Colorable extension
 *
 * Adds functionality to color nodes and edges
 */
graph.Colorable = app.createClass({

    construct: function (options) {

        this.colorMap = {};
        this.colorCount = 0;
        this.colors = d3.scale.category10();

        var _defaults = {
            numColors: 10,
            method: 'label',
            defaultColor: '#d2d2d2',
            labels: {} // colors for specific labels
        };

        this.options = $.extend({}, _defaults, options);
    },

    getNodeColor: function () {

    },

    /**
     * Color all the nodes
     */
    colorNodeByLabel: function (data) {

        var color = this.options.defaultColor,
            labels = this.options.labels,
            colorIndex,
            label;
        
        if (data._labels && data._labels.length > 0) {
            label = data._labels[0];
            
            if (!this.colorMap.hasOwnProperty(label)) {

                // check if we've defined the label color in the options
                if (labels.hasOwnProperty(label)) {
                    // stuff it in the colorMap
                    this.colorMap[label] = labels[label];
                } else {
                    colorIndex = this.colorCount % this.options.numColors;
                    this.colorMap[label] = this.colors(colorIndex);;
                    this.colorCount++;
                }
            }

            color = this.colorMap[label];
        }

        return color;
    },

    colorNodesRandomly: function () {

    },

    handleColorNode: function (event, node) {

        graphics.colorNodes(d3.select(node), this.colorNodeByLabel.bind(this));
    },

    /**
     * trigger the (re)coloring of nodes
     */
    handleColorNodes: function (event, nodeEnter) {

        var nodes = nodeEnter; // || this.graph.node;

        graphics.colorNodes(nodes, this.colorNodeByLabel.bind(this));
    }
});

}(window, jQuery, d3));