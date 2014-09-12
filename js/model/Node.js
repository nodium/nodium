(function (window, undefined) {
	var model = window.setNamespace('app.model');

	const labelsPath	 = '_labels';
	const idPath 		 = '_id';
	const propertiesPath = '_properties';

	model.Node = {

		create: function (properties, id, labels) {

			var node = {};

			node[propertiesPath] = properties || {};
			node[idPath] = id,
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

	    /**
	     * Return the labels array
	     */
	    getLabels: function (data) {

	    	return window.getObjectValueByPath(data, labelsPath);
	    },

	    hasLabel: function (label, data) {

	    	var labels = model.Node.getLabels(data);

	    	return labels.indexOf(label) !== -1;
	    },

	    getIdPath: function () {

	    	return idPath;
	    }
	};

}(window));