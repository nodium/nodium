(function (window, $, d3, undefined) {

'use strict';

var modules         = window.setNamespace('app.modules'),
    app           = window.use('app'),
    graphics      = window.use('app.graph.graphics'),
    ColorStrategy = window.use('app.constants.ColorStrategy'),

    _defaults = {
        numColors: 10, // number of random colors
        strategy: ColorStrategy.PROPERTY, // coloring strategy priority
        defaultColor: '#d2d2d2', // default node color
        labels: {}, // colors for specific labels
        labelPriority: [],
        properties: {}, // colors for properties (+ optionally values)
        propertyPriority: []
    };

/**
 * Colorable extension
 *
 * Adds functionality to color nodes and edges
 */
modules.Colorable = app.createClass({

    construct: function (options) {

        this.colorMap = {};
        this.colorCount = 0;
        this.colors = d3.scale.category10();

        this.options = $.extend({}, _defaults, options);
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

    colorNodeByProperty: function (data) {

        var color = this.options.defaultColor,
            properties = this.options.properties,
            property,
            priority = this.options.propertyPriority,
            usePriority = priority.length !== 0,
            rank,
            values,
            value,
            colorRank = -1; // the rank of the assigned color

        // first try to color according to the priority list
        for (property in properties) {

            // to color the node with this property,
            // - the node has to have the property
            // - the property value has to have a color
            if (!data.hasOwnProperty(property)) {
                continue;
            }

            value = data[property];
            values = properties[property];

            if (!values.hasOwnProperty(value)) {
                continue;
            }

            rank = priority.indexOf(property);
            if (usePriority && rank !== -1 && rank < colorRank) {
                color = values[value];
                colorRank = rank;
            } else {
                // only color if no ranked color assigned yet
                // all ranked colors go first
                if (colorRank === -1) {
                    color = values[value];
                }
            }
        }

        return color;
    },

    /**
     * trigger the (re)coloring of nodes
     * Note: the nodes are alread d3 selections
     */
    handleColorNodes: function (event, nodes, data) {

        var strategy = this.options.strategy,
            duration;

        // we use data to determine if we're dealing with a
        // d3 nodeEnter set or a single node
        if (data) {
            nodes = d3.select(nodes);
            duration = 500;
        } else {
            duration = 0;
        }

        if (strategy === ColorStrategy.PROPERTY) {
            graphics.colorNodes(nodes, this.colorNodeByProperty.bind(this), duration);
        } else {
            graphics.colorNodes(nodes, this.colorNodeByLabel.bind(this), duration);
        }
    }
});

}(window, window.jQuery, window.d3));