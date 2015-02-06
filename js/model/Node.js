(function (context, _, undefined) {
	var model = context.setNamespace('app.model');

	const
		idPath 		 	= '_id',
		labelsPath	 	= '_labels',
		propertiesPath 	= '_properties',
		shapePath      	= '_shape';

	model.Node = {

		create: function (properties, labels, id) {

			var node = {};

			// TODO use setters from util for this
			node[propertiesPath] = properties || {};
			node[labelsPath] = labels || [];
			node[idPath] = id === undefined ? _.uniqueId() : id; // force id usage

			// console.log('CREATING NODE');
			// console.log(node);

			return node;
	    },

	    getId: function (data) {

	    	return context.getObjectValueByPath(data, idPath);
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

	    	return context.getObjectValueByPath(data, labelsPath);
	    },

	    /**
	     * Return the properties object
	     */
	    getProperties: function (data) {

	    	return context.getObjectValueByPath(data, propertiesPath);
	    },

		getPropertyValue: function (data, property) {

	    	var path = this.getPropertiesPath(property);

	    	return context.getObjectValueByPath(data, path);
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

	    	return context.getObjectValueByPath(data, path) !== undefined;
	    },

	    hasPropertyWithValue: function (data, property, value) {

	    	var path = this.getPropertiesPath(property),
	    		propertyValue = context.getObjectValueByPath(data, path);

	    	return value === propertyValue;
	    },

	    hasLabel: function (data, label) {

	    	var labels = model.Node.getLabels(data);

	    	return labels.indexOf(label) !== -1;
	    }
	};

}(this, _));