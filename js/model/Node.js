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

	    getLabelsPath: function (label) {

	    	var path = labelsPath;

	    	// find the label index if given??

	    	return path;
	    },

	    getIdPath: function () {

	    	return idPath;
	    },


	    /*
	     * Move these to a better place (maybe a separate update class?)
	     */


	    /**
	     * Checks the update object for a path
	     */
	    pathInDifference: function (difference, path) {

	    	var i,
	    		diff;

	    	for (i = 0; i < difference.length; i++) {

	    		diff = difference[i];

	    		if (!diff.path) {
	    			continue;
	    		}

	    		if (diff.path.join('.') === path) {
	    			return true;
	    		}
	    	}

	    	return false;
	    },


	    setPropertiesForUpdate: function (update, properties, value) {

	    	var path;

	    	if (update.set === undefined) {
	    		update.set = [];
	    	}

	    	// if we're passing a value, set one property
	    	if (value === undefined) {
	    		path = model.Node.getPropertiesPath();
	    		value = properties;
	    	} else {
	    		path = model.Node.getPropertiesPath(property);
	    	}

	    	update.set.push([path, value]);
	    },

	    unsetPropertyForUpdate: function (update, property) {

	    	if (update.unset === undefined) {
	    		update.unset = [];
	    	}

	    	update.unset.push([model.Node.getPropertiesPath(property)]);
	    },

	    setLabelsForUpdate: function (update, labels) {

	    	var path = model.Node.getLabelsPath();

	    	if (update.set === undefined) {
	    		update.set = [];
	    	}

	    	update.set.push([path, labels]);
	    }

	    /* we're updating the labels with set for now
	    unsetLabelForUpdate: function (update, label) {

	    	if (update.unset === undefined) {
	    		update.unset = [];
	    	}

	    	update.unset.push([model.Node.getLabelsPath(label)]);
	    }
	    */
	};

}(window));