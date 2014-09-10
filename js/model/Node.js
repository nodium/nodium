(function (window, undefined) {
	var model = window.setNamespace('app.model');

	const labelsPath	 = '_labels';
	const idPath 		 = '_id';
	const propertiesPath = '_properties';

	model.Node = {

		create: function (properties, id, labels) {

			var node = {};

			node[propertiesPath] = properties || {};
			node[idPath] = id || null,
			node[labelsPath] = labels || [];

			return node;
	    },

	    getPropertiesPath: function (property) {

	    	var path = propertiesPath;

	    	if (property) {
	    		path += '.' + property;
	    	}

	    	return path;
	    },

	    getLabelsPath: function (index) {

	    	var path = labelsPath;

	    	if (index) {
	    		path += '.' + index;
	    	}

	    	return path;
	    },

	    getIdPath: function () {

	    	return idPath;
	    }
	};

}(window));