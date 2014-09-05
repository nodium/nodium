(function (window, undefined) {

'use strict';

var transformer = window.setNamespace('app.transformer'),
    app         = window.use('app');

/**
 * An interface between the Neo4j data structure and the data structure
 * used by this framework
 */
transformer.Neo4jTransformer = app.createClass(transformer.DataTransformerInterface {

	/**
	 * Transform data from neo4j
	 */
	from: function (data) {
		return data;
	},

	/**
	 * Transform data to neo4j
	 */
	to: function (data) {
		return data;
	}
});

}(window));