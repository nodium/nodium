(function (context, $, d3, undefined) {

'use strict';

var modules            = context.setNamespace('app.modules'),
    app                = context.use('app'),
    Node               = context.use('app.model.Node'),
    graphics           = context.use('app.graph.graphics'),
    EvaluationStrategy = context.use('app.constants.EvaluationStrategy'),

    _defaults = {
        strategy: EvaluationStrategy.LABEL, // strategy priority
        labels: {}, // label evaluation
        labelPriority: [],
        properties: {}, // evaluation for properties (+ optionally values)
        propertyPriority: []
    };

/**
 * Evaluable abstract module
 *
 * Allows modules to react to property and label values
 */
modules.Evaluable = app.createClass({

    construct: function (options) {

        this.options = $.extend({}, _defaults, options);
    },

    // TODO generalize priority handling, as it's used in both evaluation functions
    
    evaluateLabels: function (data) {

        var value = this.options.defaultValue,
            labels = this.options.labels,
            label,
            priority = this.options.labelPriority,
            usePriority = priority.length !== 0,
            rank,
            assignedRank = -1;

        if (!value) {
            throw 'Default value not specified';
        }

        for (label in labels) {

            // to evaluate the node with this label,
            // - the node has to have the label
            // - the label value has to have a return value assigned
            if (!Node.hasLabel(data, label)) {
                continue;
            }

            rank = priority.indexOf(label);
            if (usePriority && rank !== -1 && rank < assignedRank) {
                value = labels[label];
                assignedRank = rank;
            } else {
                // only evaluate if no ranked value assigned yet
                // all ranked values go first
                if (assignedRank === -1) {
                    value = labels[label];
                }
            }
        }

        return value;
    },

    evaluateProperties: function (data) {

        var value = this.options.defaultValue,
            properties = this.options.properties,
            property,
            priority = this.options.propertyPriority,
            usePriority = priority.length !== 0,
            propertyValues,
            propertyValue,
            rank,
            assignedRank = -1;

        if (!value) {
            throw 'Default value not specified';
        }

        for (property in properties) {

            // to evaluate the node with this property,
            // - the node has to have the property
            // - the property's value has to have a return value specified
            propertyValue = Node.getPropertyValue(data, property);

            if (propertyValue === undefined) {
                continue;
            }

            // the values for which we've specified something
            propertyValues = properties[property];

            // continue if we don't know what to do with this property's value
            if (!propertyValues.hasOwnProperty(propertyValue)) {
                continue;
            }

            rank = priority.indexOf(property);
            if (usePriority && rank !== -1 && rank < assignedRank) {
                value = propertyValues[propertyValue];
                assignedRank = rank;
            } else {
                // only evaluate if no ranked propertyValue assigned yet
                // all ranked value go first
                if (assignedRank === -1) {
                    value = propertyValues[propertyValue];
                }
            }
        }

        return value;
    },

    /**
     * trigger the (re)evaluation of nodes
     * Note: nodes can be a single html element or a d3 selection
     */
    /*
    handleEvaluation: function (event, nodes, data, update) {

        var strategy = this.options.strategy,
            graph = this.graph;

        // we use updated to determine if we're dealing with a
        // d3 nodeEnter set or a single node update
        if (update) {

            // check if relevant data is updated
            // TODO check should be based on used strategies
            if (!update.changed(Node.getLabelsPath())) {

                return;
            }

            // d3 select if a single html node is passed
            nodes = d3.select(nodes);
        }

        if (strategy === EvaluationStrategy.PROPERTY) {
            graphics.shapeNodes(nodes, this.shapeNodeByProperty.bind(this));
        } else {
            graphics.shapeNodes(
                nodes,
                this.shapeNodeByLabel.bind(this),
                function (data) {
                    // note: size is set in square pixels, hence the pow
                    return Math.pow(graph.getNodeRadius(data)*3, 2);
                }
            );
        }
    }
    */
});

}(this, jQuery, d3));
