(function (window, $, d3, undefined) {

'use strict';

var graph       = window.setNamespace('app.graph'),
    app         = window.use('app'),
    NodeEvent   = window.use('app.event.NodeEvent');

/**
 * Stylable trait
 *
 * Adds functionality to store node style in the database
 */
graph.Stylable = app.createClass({

    constrruct: function (options) {

        var _defaults = {
            key: '__nodestyle',
            styles: {}
        };

        this.options = $.extend({}, _defaults, options);
    },

    /**
     * the string to be stored
     */
    objectToString: function (obj) {
        return JSON.stringify(obj);
    },

    /**
     * Generate a style string from this node
     * so we only need to store waste one field in the database
     */
    getStyleString: function (node, data) {

        // completely (re)build the object for now
        var styles = this.options.styles,
            style,
            properties,
            i,
            property,
            value,
            obj = {},
            objString,
            parameters;

        for (style in styles) {
            parameters = {};
            properties = styles[style];

            for (i = 0; i < properties.length; i++) {

                property = properties[i];

                // get the value of the property
                // value = data[style[i]];
                value = window.getObjectValueByString(data, property);

                console.log("stylestring");
                console.log(data);
                console.log(property);
                console.log(value);

                parameters[property] = value;
            }

            obj[style] = parameters;
        }

        objString = this.objectToString(obj);
        console.log(objString);

        return objString;
    },

    /**
     * Parse a style string into an object with node style properties
     */
    parseStyleString: function (styleString) {

    },

    handleNodeStyled: function (event, node, data) {

        console.log("handling node style");

        var styleString = this.getStyleString(node, data);
        data._style = styleString;

        $(this.kernel).trigger(NodeEvent.UPDATED, [node, data, this.options.key, styleString]);
    }
});

}(window, jQuery, d3));