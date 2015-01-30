(function (context, $, d3, undefined) {

'use strict';

var modules            = context.setNamespace('app.modules'),
    app                = context.use('app'),
    Node               = context.use('app.model.Node'),
    graphics           = context.use('app.graph.graphics'),
    EvaluationStrategy = context.use('app.constants.EvaluationStrategy'),

    _defaults = {
        strategy: EvaluationStrategy.PROPERTY, // coloring strategy priority
        labels: {}, // classes for specific labels
        labelPriority: [],
        properties: {}, // classes for properties (+ optionally values)
        propertyPriority: []
    };

/**
 * Classable module
 *
 * Adds functionality to class nodes based on data
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
    handleClassNodes: function (event, nodes, data, update) {

        var strategy = this.options.strategy;

        // we use updated to determine if we're dealing with a
        // d3 nodeEnter set or a single node update
        if (update) {

            // check if relevant data is updated
            // TODO check should be based on used strategies
            if (!update.changed(Node.getPropertiesPath()) &&
                !update.changed(Node.getLabelsPath())) {

                return;
            }

            nodes = d3.select(nodes);
        }

        if (strategy === EvaluationStrategy.PROPERTY) {
            graphics.classNodes(nodes, this.classNodeByProperty.bind(this));
        }
        // else {
        //     graphics.classNodes(nodes, this.classNodeByLabel.bind(this));
        // }
    }
});

}(this, jQuery, d3));
