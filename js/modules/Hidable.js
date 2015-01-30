(function (context, $, d3, undefined) {

'use strict';

var modules       = context.setNamespace('app.modules'),
    app           = context.use('app'),
    Node          = context.use('app.model.Node'),
    graphics      = context.use('app.graph.graphics'),
    EvaluationStrategy = context.use('app.constants.EvaluationStrategy'),

    _defaults = {
        strategy: EvaluationStrategy.PROPERTY, // evaluation strategy priority
        defaultValue: true, // show nodes/edges by default
        labels: {}, // colors for specific labels
        labelPriority: [],
        properties: {}, // colors for properties (+ optionally values)
        propertyPriority: []
    };

/**
 * Shapable module
 *
 * Adds functionality to shape nodes
 */
modules.Hidable = app.createClass(modules.Evaluable, {

    construct: function (options) {

        this.options = $.extend({}, _defaults, options);
        this.baseOptions = $.extend({}, _defaults, options);

        // add additional rules during execution
        this.filter = {};
    },

    initialize: function () {

        $(this.kernel)
            .on('graph-mode-changed', this.handleHideNodes.bind(this));
    },

    /**
     * Color all the nodes
     */
    hideNodeByLabel: function (data) {

        var show = this.evaluateLabels(data);

        return show;
    },

    hideNodeByProperty: function (data) {

        var show = this.evaluateProperties(data);

        return show;
    },

    /**
     * trigger the shaping of nodes
     */
    handleHideNodes: function (event, nodes, data, update) {

        var strategy = this.options.strategy,
            graph = this.graph;

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
        }

        if (strategy === EvaluationStrategy.PROPERTY) {
            console.log('shaping by property');
            graphics.shapeNodes(
                nodes,
                this.shapeNodeByProperty.bind(this)
            );
        } else {
            graphics.shapeNodes(
                nodes,
                this.shapeNodeByLabel.bind(this)
            );
        }
    }
});

}(this, jQuery, d3));
