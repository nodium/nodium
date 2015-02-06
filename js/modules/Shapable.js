(function (context, $, d3, undefined) {

'use strict';

var modules       = context.setNamespace('app.modules'),
    app           = context.use('app'),
    Node          = context.use('app.model.Node'),
    graphics      = context.use('app.graph.graphics'),
    EvaluationStrategy = context.use('app.constants.EvaluationStrategy'),

    _defaults = {
        strategy: EvaluationStrategy.PROPERTY, // coloring strategy priority
        defaultValue: 'circle', // default node color
        directMapping: true, // if true, label names are directly used as shapes
        paths: {}, // add custom paths
        shapes: {}, // add custom shapes (pathname or default shape + scaling)
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
modules.Shapable = app.createClass(modules.Evaluable, {

    construct: function (options) {

        this.options = $.extend({}, _defaults, options);
    },

    getShapeObject: function (shape, size) {

        var shapes = this.options.shapes,
            paths = this.options.paths,
            shapeData,
            pathName,
            path,
            scale;

        // get the scaling that we should use as default
        // first check shapes, then paths, then just use built-in symbol
        if (shapes.hasOwnProperty(shape)) {
            shapeData = shapes[shape];

            pathName = shapeData[0];
            scale = {
                x: shapeData[1],
                y: shapeData[2]
            };

        } else {
            pathName = shape;
            scale = {
                x: 1,
                y: 1
            }
        }

        // use a path if provided, else generate with d3
        if (paths.hasOwnProperty(pathName)) {
            path = paths[pathName];
        } else {
            // path = d3.svg.symbol()
            //     .type(pathName)
            //     .size(size)
            path = d3.superformula()
                .type(pathName)
                .size(size)
                .segments(50);
        }

        return {
            shape: shape,
            path: path,
            scale: scale
        };
    },

    /**
     * Just a dumb approximation for now
     */
    getSizeFromRadius: function (radius) {
        return Math.pow(radius*3, 2);
    },

    /**
     * Color all the nodes
     */
    shapeNodeByLabel: function (data) {

        var shape,
            size;

        shape = this.evaluateLabels(data);
        size = this.getSizeFromRadius(this.graph.getNodeRadius(data));

        data._shape = this.getShapeObject(shape, size);

        return data._shape;
    },

    shapeNodeByProperty: function (data) {

        var shape,
            size;

        shape = this.evaluateProperties(data);
        size = this.getSizeFromRadius(this.graph.getNodeRadius(data));

        data._shape = this.getShapeObject(shape, size);

        return data._shape;
    },

    /**
     * trigger the shaping of nodes
     */
    handleShapeNodes: function (event, nodes, data, update) {

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
