(function (window, $, d3, undefined) {

'use strict';

var modules       = window.setNamespace('app.modules'),
    app         = window.use('app'),
    NodeEvent   = window.use('app.event.NodeEvent');

/**
 * Storable module
 *
 * Adds functionality to store node style in the database
 */
modules.Storable = app.createClass({

    construct: function (options) {

        var _defaults = {
            path: '_style',
            storables: {}
        };

        this.options = $.extend({}, _defaults, options);
    },

	initialize: function () {

		$(this.kernel).on(NodeEvent.LOADED, this.handleGraphLoaded.bind(this));
	},

    /**
     * the string to be stored
     */
    objectToString: function (obj) {
        return JSON.stringify(obj);
    },

    /**
	 * parse the style string
	 */
    objectFromString: function (styleString) {
		return JSON.parse(styleString);
	},

    /**
     * Generate a style string from this node
     * so we only need to waste one field in the database
     */
    getStyleString: function (node, data) {

        // completely (re)build the object for now
        var storables = this.options.storables,
            style,
            properties,
            i,
            property,
            value,
            obj = {},
            objString,
            parameters;

        for (style in storables) {
            parameters = {};
            properties = storables[style];

            for (i = 0; i < properties.length; i++) {

                property = properties[i];

				// get the value of the property
				value = window.getObjectValueByString(data, property);

                parameters[property] = value;
            }

            obj[style] = parameters;
        }

        objString = this.objectToString(obj);

        return objString;
    },

	/**
	 * Parse a style string into an object with node style properties
	 */
	parseStyleString: function (data) {

		var storables = this.options.storables,
            path = this.options.path,
			style,
			obj,
			properties,
			property,
			value;

		if (!data.hasOwnProperty(path)) {
			return;
		}

		obj = this.objectFromString(data[path]);

		for (style in obj) {
			// check if this style was configured to be used
			if (!storables.hasOwnProperty(style)) {
				continue;
			}

			properties = obj[style];

            // TODO this only works if properties are in data
            // each style should have its own parser
			for (property in properties) {
				data[property] = properties[property];
			}
		}
	},

	/**
	 * Translate the style strings inside nodes to node data and style
	 */
	handleGraphLoaded: function (event, nodes, edges) {

		var i,
			node;

		for (i = 0; i < nodes.length; i++) {
			node = nodes[i];

			this.parseStyleString(node);
		}
	},

    handleNodeStyled: function (event, node, data) {

        var styleString = this.getStyleString(node, data);
        data[this.options.path] = styleString;

        $(this.kernel).trigger(NodeEvent.UPDATED, [node, data]);

        // $(this.kernel).trigger(NodeEvent.UPDATE, [node, data, path, value])
    }
});

}(window, jQuery, d3));