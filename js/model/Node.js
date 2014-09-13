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

	    getIdPath: function () {

	    	return idPath;
	    },

	    getLabelsPath: function (index) {

	    	var path = labelsPath;

	    	if (index) {
	    		path += '.' + index;
	    	}

	    	return path;
	    },

	    getPropertiesPath: function (property) {

	    	var path = propertiesPath;

	    	if (property) {
	    		path += '.' + property;
	    	}

	    	return path;
	    },

	    /**
	     * Return the labels array
	     */
	    getLabels: function (data) {

	    	return window.getObjectValueByPath(data, labelsPath);
	    },

	    /**
	     * Return the properties object
	     */
	    getProperties: function (data) {

	    	return window.getObjectValueByPath(data, propertiesPath);
	    },

		getPropertyValue: function (data, property) {

	    	var path = this.getPropertiesPath(property);

	    	return window.getObjectValueByPath(data, path);
	    },

	    hasProperty: function (data, property) {

	    	var path = this.getPropertiesPath(property);

	    	return window.getObjectValueByPath(data, path) !== undefined;
	    },

	    hasPropertyWithValue: function (data, property, value) {

	    	var path = this.getPropertiesPath(property),
	    		propertyValue = window.getObjectValueByPath(data, path);

	    	return value === propertyValue;
	    },

	    hasLabel: function (data, label) {

	    	var labels = model.Node.getLabels(data);

	    	return labels.indexOf(label) !== -1;
	    }
	};

}(window));