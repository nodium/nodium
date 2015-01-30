(function (context, $, undefined) {

'use strict';

var transformer = context.setNamespace('app.transformer'),
    app         = context.use('app'),
    _defaults   = {
    	map: {} // the non property values
    };

transformer.AbstractDataTransformer = app.createClass({

	construct: function (options) {

		this.options = $.extend({}, _defaults, options);
	},

	from: function () {
		throw 'The data transformer should implement a "from" function';
	},

	to: function () {
		throw 'The data transformer should implement a "to" function';
	},

	getMappedProperties: function (data) {
		return this.filterAndChangePropertyKeys(data, this.options.map);
	},

	/**
     * Returns an object with the database field linked to the data value
     */
    filterAndChangePropertyKeys: function (data, obj) {

        var mapped = {},
            dataField,
            mappedField,
            value;

        for (mappedField in obj) {

        	if (!obj.hasOwnProperty(mappedField)) {
        		continue;
        	}

            dataField = obj[mappedField];
            value = data[dataField];

            if (!value) {
                continue;
            }

            mapped[mappedField] = value;
        }

        return mapped;
    }
});

}(this, jQuery));