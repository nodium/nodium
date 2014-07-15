(function (window, $, d3, undefined) {
	var graph = window.setNamespace('app.graph'),
		app   = window.setNamespace('app');

	/**
	 * Stylable trait
	 *
	 * Adds functionality to store node style in the database
	 */
	graph.Stylable = function () {

		if ((this instanceof graph.Stylable) === false) {
			return new graph.Stylable(arguments);
		}
	};

	/**
	 * Generate a style string from this node
	 * so we only need to store waste one field in the database
	 */
	graph.Stylable.prototype.getStyleString = function (node) {
		
	};

	/**
	 * Parse a style string into an object with node style properties
	 */
	graph.Stylable.prototype.parseStyleString = function (styleString) {

	};

	/**
	 * This is actually a toggle to either pin or unpin a node
	 */
	graph.Stylable.prototype.handleNodeStyled = function (event, node, data) {

		
	};

}(window, jQuery, d3));