(function (window, $, d3, undefined) {

'use strict';

var modules   = window.setNamespace('app.modules'),
    app       = window.use('app'),
    EdgeEvent = window.use('app.event.EdgeEvent'),
    _defaults;

/**
 * EdgeCD trait
 *
 * Adds functionality to link nodes by hovering them on top of each other
 */
modules.CRMEdgeCRUD = app.createClass(modules.EdgeCRUD, {

	construct: function (options) {

		this.options = $.extend({}, _defaults, options);

		this.mode = 'LINK';
	},

	initialize: function () {
		
		$(this.kernel).on(EdgeEvent.MODECHANGE, this.handleModeChange.bind(this));
	},

	handleModeChange: function (event, mode) {

		console.log("new mode: " + mode);

		this.mode = mode;
	},

	/**
     * Calculates the edge type to use for these nodes
     * and with the selected mode
     */
    resolveEdgeType: function (source, target) {
    	var edgeType = this.mode,
    		modes = this.options.modes;

        console.log("resolving edge type");
        console.log(edgeType);

    	if (edgeType === modes.LINK) {
    		if (source.type == 'test' || target.type == 'test') {
    			edgeType = 'LOLZ';
    		}
    	}

        return edgeType;
    }
});

}(window, jQuery, d3));