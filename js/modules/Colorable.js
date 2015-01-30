(function (context, $, d3, undefined) {

'use strict';

var modules         = context.setNamespace('app.modules'),
    app           = context.use('app'),
    graphics      = context.use('app.graph.graphics'),
    EvaluationStrategy = context.use('app.constants.EvaluationStrategy'),

    _defaults = {
        numColors: 10, // number of random colors
        strategy: EvaluationStrategy.PROPERTY, // coloring strategy priority
        defaultValue: '#d2d2d2', // default node color
        labels: {}, // colors for specific labels
        labelPriority: [],
        properties: {}, // colors for properties (+ optionally values)
        propertyPriority: []
    };

/**
 * Colorable extension
 *
 * Adds functionality to color nodes
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
    handleColorNodes: function (event, nodes, data, update) {

        var strategy = this.options.strategy,
            duration = 0;

        // we use updated to determine if we're dealing with a
        // d3 nodeEnter set or a single node update
        if (update) {

            // check if relevant data is updated
            // TODO check should be based on used strategies
            if (!update.changed(Node.getPropertiesPath()) &&
                !update.changed(Node.getLabelsPath())) {

                return;
            }

            // d3 select if a single html node is passed
            nodes = d3.select(nodes);
            duration = 500;
        }

        if (strategy === EvaluationStrategy.PROPERTY) {
            graphics.colorNodes(nodes, this.colorNodeByProperty.bind(this), duration);
        } else {
            graphics.colorNodes(nodes, this.colorNodeByLabel.bind(this), duration);
        }
    }
});

}(this, jQuery, d3));
