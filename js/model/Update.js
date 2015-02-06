(function (context, _, undefined) {

'use strict';

var model = context.setNamespace('app.model'),
	Node  = context.use('app.model.Node');

model.Update = app.createClass({

	construct: function () {

		this._set = [];
		this._unset = [];

		// a map of the changes
		this.difference;

		// object with string representations of all (sub)paths
		// that are in the difference array
		this.paths;

		// the number of changes
		this.count;
	},

	/*
	 * Setting and unsetting
	 */

    set: function (path, value) {

    	this._set.push([path, value]);
    },

    unset: function (path, value) {

    	this._unset.push([path, value]);
    },

    /**
     * Replace all properties
     */
    setProperties: function (properties, value) {

    	this.set(Node.getPropertiesPath(), properties);
    },

    /**
     * Set a property value
     */
    setProperty: function (property, value) {

    	this.set(Node.getPropertiesPath(property), value);
    },

    unsetProperty: function (property) {

    	this.unset(Node.getPropertiesPath(property));
    },

    /**
     * Replace all labels
     */
    setLabels: function (labels) {

    	this.set(Node.getLabelsPath(), labels);
    },

    setLabel: function (label) {

    	// Pass index -1 to push
    	this.set(Node.getLabelsPath(-1), label);

    	console.log(this);
    },

    unsetLabel: function (label) {

    	this.unset(Node.getLabelsPath(), label);
    },


    /*
     * Processing and difference
     */


    /**
     * Updates the data with the update directives
     * The reason we use directives is that it allows for more
     * control in some cases. E.g. when you want to set a whole
     * sub-object at once.
     */
    process: function (data) {

        var set = this._set,
            unset = this._unset,
            i,
            directive,
            clone = _.cloneDeep(data),
            deepdiff;

        // we process unset first, so that at least
        // every property in set will be set

        if (unset) {

            for (i = 0; i < unset.length; i++) {
                directive = unset[i];
                context.removeByPath(data, directive[0], directive[1]);
            }
        }

        if (set) {

            for (i = 0; i < set.length; i++) {
                directive = set[i];
                context.setByPath(data, directive[0], directive[1]);
            }
        }

        deepdiff = DeepDiff.diff(clone, data);
        this.prepareDifference(deepdiff);
    },

    /**
     * Creates a difference object with the changes keyed by path
     */
    prepareDifference: function (deepdiff) {

    	var paths = {},
    		subpath,
    		diff,
    		count = 0,
    		i, j;

    	deepdiff = deepdiff || [];
    	this.difference = deepdiff;

    	if (!deepdiff) {
    		this.paths = paths;
    		this.count = 0;
    		return;
    	}

    	for (i = 0; i < deepdiff.length; i++) {

    		diff = deepdiff[i];

    		if (!diff.path) {
    			continue;
    		}

    		subpath = '';

    		for (j = 0; j < diff.path.length; j++) {

    			if (subpath !== '') {
    				subpath += '.';
    			}

    			subpath += diff.path[j];

    			paths[subpath] = 1;
    		}

    		count++;
    	}

    	this.paths = paths;
    	this.count = count;
    },

    /**
     * Checks the difference object for a path
     */
    changed: function (path) {

    	return this.paths.hasOwnProperty(path);
    }

});

}(this, _));