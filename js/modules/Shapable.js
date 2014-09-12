(function (window, $, d3, undefined) {

'use strict';

var modules       = window.setNamespace('app.modules'),
    app           = window.use('app'),
    Node          = window.use('app.model.Node'),
    graphics      = window.use('app.graph.graphics'),
    ColorStrategy = window.use('app.constants.ColorStrategy'),

    _defaults = {
        strategy: ColorStrategy.LABEL, // coloring strategy priority
        defaultShape: 'circle', // default node color
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
modules.Shapable = app.createClass({

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
                .segments(50)
        }

        return {
            shape: shape,
            path: path,
            scale: scale
        }
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

        var shape = this.options.defaultShape, // the shape for which we'll create the path
            shapes = this.options.shapes,
            labels = this.options.labels,
            label,
            size,
            priority = this.options.labelPriority,
            usePriority = priority.length !== 0,
            rank,
            value,
            assignedRank = -1; // the rank of the assigned value

        for (label in labels) {

            // to shape the node with this label,
            // - the node has to have the label
            // - the label value has to have a shape assigned
            if (!Node.hasLabel(label, data)) {
                continue;
            }

            rank = priority.indexOf(label);
            if (usePriority && rank !== -1 && rank < assignedRank) {
                shape = labels[label];
                assignedRank = rank;
            } else {
                // only shape if no ranked shape assigned yet
                // all ranked values go first
                if (assignedRank === -1) {
                    shape = labels[label];
                }
            }
        }

        size = this.getSizeFromRadius(this.graph.getNodeRadius(data));
        data._shape = this.getShapeObject(shape, size);

        return data._shape;
    },

    shapeNodeByProperty: function (data) {

        var color = this.options.defaultColor,
            properties = this.options.properties,
            property,
            priority = this.options.propertyPriority,
            usePriority = priority.length !== 0,
            rank,
            values,
            value,
            colorRank = -1; // the rank of the assigned color

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
    handleShapeNodes: function (event, nodes, data, update) {

        var strategy = this.options.strategy,
            graph = this.graph;

        // we use updated to determine if we're dealing with a
        // d3 nodeEnter set or a single node update
        if (update) {

            // check if relevant data is updated
            // TODO check should be based on used strategies
            if (/*!update.changed(Node.getPropertiesPath()) &&*/
                !update.changed(Node.getLabelsPath())) {

                return;
            }

            // d3 select if a single html node is passed
            nodes = d3.select(nodes);
        }

        if (strategy === ColorStrategy.PROPERTY) {
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
});

}(window, window.jQuery, window.d3));