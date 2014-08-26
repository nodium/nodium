(function (window, $, d3, undefined) {

'use strict';

var graph     = window.setNamespace('app.graph'),
	modules   = window.setNamespace('app.modules'),
    app       = window.use('app'),
    EdgeEvent = window.use('app.event.EdgeEvent');

/**
 * EdgeCD trait
 *
 * Adds functionality to link nodes by hovering them on top of each other
 */
modules.CRMEdgeCRUD = app.createClass(graph.EdgeCD, {
});

}(window, jQuery, d3));