(function (window, undefined) {
	var model = window.setNamespace('app.model');

	const labelKey 		= '_labels';
	const idKey 		= '_id';
	const propertyKey   = '_properties';

	model.Node = {

		create: function (properties, id, labels) {

			var node = {};

			node[propertyKey] = properties || {};
			node[idKey] = id || null,
			node[labelKey] = labels || [];

			return node;
	    }
	};

}(window));