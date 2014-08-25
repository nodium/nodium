(function (window, $, undefined) {

'use strict';

var ui          = window.setNamespace('app.ui'),
    app         = window.use('app'),
    EdgeEvent   = window.use('app.event.EdgeEvent'),
    Event       = window.use('app.event.Event'),
    _defaults;

ui.EdgeModePanel = app.createClass({

    construct: function (options, selector) {

        this.options = $.extend({}, _defaults, options);
        this.name = 'Edge mode';
        this.selector = selector;
        this.edgeMode = this.EdgeModes.NORMAL;

        // $(this.kernel).on(EdgeEvent.MODECHANGE, this.handleModeChange.bind(this));
        $('edit-mode').on(Event.CHANGE, 'input[type=radio]', this.handleModeChange.bind(this));
    },

    initialize: function () {

    	// have the edge module know how to deduce edge type
    	$(this.kernel).trigger(EdgeEvent.MODECHANGED, [this.getEdgeType.bind(this)]);
    },

    /**
     * set the edge mode variable
     */
    handleModeChange: function (event) {

        console.log('handling edge mode change');

        var target = event.target;
        // get the active one and stuff

        this.edgeMode = $(target).children().first().val();
    },

    /**
     * Calculates the edge type to use for these nodes
     * and with the selected mode
     */
    getEdgeType: function (source, target) {
    	var edgeType = this.edgeMode;

    	if (edgeType === this.EdgeModes.NORMAL) {
    		if (source.type == 'test' || target.type == 'test') {
    			edgeType = 'LOLZ';
    		}
    	}
    },

    // stuff this into something else?
    EdgeModes: {
    	NORMAL: 'NORMAL',
    	SYNONYM: 'SYNONYM',
    	INFLUENCE: 'INFLUENCE'
    }
});