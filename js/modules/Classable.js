(function (window, $, d3, undefined) {

'use strict';

var modules       = window.setNamespace('app.modules'),
    app           = window.use('app'),
    graphics      = window.use('app.graph.graphics'),
    ColorStrategy = window.use('app.constants.ColorStrategy'),

    _defaults = {
        strategy: ColorStrategy.PROPERTY, // coloring strategy priority
        labels: {}, // classes for specific labels
        labelPriority: [],
        properties: {}, // classes for properties (+ optionally values)
        propertyPriority: []
    };

/**
 * Colorable extension
 *
 * Adds functionality to color nodes and edges
 */
modules.Classable = app.createClass({

    construct: function (options) {

        this.options = $.extend({}, _defaults, options);
    },

    // TODO make possible to set more classes at once
    classNodeByProperty: function (data) {

        var className,
            properties = this.options.properties,
            property,
            values,
            value,
            option,
            classes = {};

        for (property in properties) {

            value = data._properties[property];
            values = properties[property];

            for (option in values) {

                if (!values.hasOwnProperty(option)) {
                    continue;
                }

                className = values[option];
                if (option === value) {
                    classes[className] = true;
                } else {
                    classes[className] = false;
                }
            }
        }

        return classes;
    },

    /**
     * trigger the (re)coloring of nodes
     */
    handleClassNodes: function (event, nodes, data) {

        var strategy = this.options.strategy;

        // we use data to determine if we're dealing with a
        // d3 nodeEnter set or a single node
        if (data) {
            nodes = d3.select(nodes);
        }

        if (strategy === ColorStrategy.PROPERTY) {
            graphics.classNodes(nodes, this.classNodeByProperty.bind(this));
        }
        // else {
        //     graphics.classNodes(nodes, this.classNodeByLabel.bind(this));
        // }
    }
});

}(window, jQuery, d3));