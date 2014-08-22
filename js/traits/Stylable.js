(function (window, $, d3, undefined) {

'use strict';

var graph = window.setNamespace('app.graph'),
	app   = window.setNamespace('app'),
	NodeEvent = window.use('app.event.NodeEvent');

/**
 * Stylable trait
 *
 * Adds functionality to store node style in the database
 */
graph.Stylable = function (options) {

	if ((this instanceof graph.Stylable) === false) {
		return new graph.Stylable(arguments);
	}

	var _defaults = {
		key: '__nodestyle',
		styles: {}
	};

	this.options = $.extend({}, _defaults, options);
};

graph.Stylable.prototype.initialize = function () {

	$(this.kernel).on(NodeEvent.LOADED, this.handleGraphLoaded.bind(this));
};

/**
 * the string to be stored
 */
graph.Stylable.prototype.objectToString = function (obj) {
	return JSON.stringify(obj);
};

/**
 * parse the string
 */
graph.Stylable.prototype.objectFromString = function (styleString) {
	return JSON.parse(styleString);
};

/**
 * Generate a style string from this node
 * so we only need to store waste one field in the database
 */
graph.Stylable.prototype.getStyleString = function (node, data) {

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
};

/**
 * Parse a style string into an object with node style properties
 */
graph.Stylable.prototype.parseStyleString = function (data) {

	var styles = this.options.styles,
		style,
		obj,
		properties,
		property,
		value;

	if (!data.hasOwnProperty('_style')) {
		return;
	}

	obj = this.objectFromString(data._style);

	for (style in obj) {
		// check if this style was configured to be used
		if (!styles.hasOwnProperty(style)) {
			continue;
		}

		properties = obj[style];
		console.log(properties);

		for (property in properties) {
			data[property] = properties[property];
		}
	}

	console.log(data);
};

/**
 * Translate the style strings inside nodes to node data and style
 */
graph.Stylable.prototype.handleGraphLoaded = function (event, nodes, edges) {

	console.log("styling graph");

	var i,
		node;

	for (i = 0; i < nodes.length; i++) {
		node = nodes[i];

		this.parseStyleString(node);
	}

	this.graph.handleTick();
};

graph.Stylable.prototype.handleNodeStyled = function (event, node, data) {

	console.log("handling node style");

	var styleString = this.getStyleString(node, data);
	data._style = styleString;

	$(this.kernel).trigger(NodeEvent.UPDATED, [node, data, this.options.key, styleString]);
};

}(window, jQuery, d3));