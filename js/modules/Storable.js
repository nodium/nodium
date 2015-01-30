(function (context, $, d3, undefined) {

'use strict';

var modules       = context.setNamespace('app.modules'),
    app         = context.use('app'),
    model         = context.use('app.model'),
    NodeEvent   = context.use('app.event.NodeEvent'),
    _defaults = {
        path: '_style',
        storables: {}
    };

/**
 * Storable module
 *
 * Adds functionality to store node style in the database
 */
modules.Storable = app.createClass({

    construct: function (options) {

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
    objectFromString: function (storableString) {
		return JSON.parse(storableString);
	},

    /**
     * Generate a style string from this node
     * so we only need to waste one field in the database
     */
    getStorableString: function (node, data) {

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
				value = context.getObjectValueByPath(data, property);

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
	parseStorableString: function (data) {

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

            // TODO each style should have its own parser
			for (property in properties) {
                context.setByPath(data, property, properties[property]);
			}
		}
	},

	/**
	 * Translate the storable strings inside nodes to node data
	 */
	handleGraphLoaded: function (event, nodes, edges) {

		var i,
			node;

		for (i = 0; i < nodes.length; i++) {
			node = nodes[i];

			this.parseStorableString(node);
		}
	},

    handleNodeStyled: function (event, node, data) {

        // move this to a per-storable check
        if (!data.fixed) {
            return;
        }

        var storableString = this.getStorableString(node, data),
            update = new model.Update();
        
        update.set(this.options.path, storableString);

        $(this.kernel).trigger(NodeEvent.UPDATE, [node, data, update]);
    }
});

}(this, jQuery, d3));
