(function (window, undefined) {
	var model = window.setNamespace('app.model');

	const propertiesPath = '_properties';
	const labelsPath	 = '_labels';
	const idPath 		 = '_id';
	const shapePath      = '_shape';

	model.Node = {

		create: function (properties, labels, id) {

			var node = {};

			// TODO lol this makes no sense?
			node[propertiesPath] = properties || {};
			node[labelsPath] = labels || [];
			node[idPath] = id === undefined ? window.uuid() : id; // force id usage

			return node;
	    },

	    getId: function (data) {

	    	return window.getObjectValueByPath(data, idPath);
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

	    /**
	     * Filters this node's edges from the given array
	     */
	    filterEdges: function (data, edges) {

	    	var id = this.getId(data);

	    	return edges.filter(function (edge) {
	    		var sourceId = this.getId(edge.source);
	    		var targetId = this.getId(edge.target);
	    		return sourceId === id || targetId === id;
	    	}, this);
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