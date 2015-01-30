(function (context, $, d3, undefined) {

'use strict';

var modules       = context.setNamespace('app.modules'),
    app           = context.use('app'),
    Node          = context.use('app.model.Node'),

    _defaults = {
        link: ['link'] // the properties to be checked for uris
    };

/**
 * Hyperlinkable module
 *
 * Adds functionality to follow a link in a node property
 */
modules.Hyperlinkable = app.createClass({

    construct: function (options) {

        this.options = $.extend({}, _defaults, options);
    },

    checkURI: function () {
        // TODO find a better javascript URL validation
        return true;
    },

    followLink: function (uri) {

        window.open(uri);
    },

    handleFollowLink: function (event, node, data) {

        var linkProperties = this.options.link,
            property,
            uris = [],
            uri,
            i;

        for (i = 0; i < linkProperties.length; i++) {
            property = linkProperties[i];

            uri = Node.getPropertyValue(data, property);
            if (uri && this.checkURI(uri)) {
                uris.push(uri);
            }
        }

        // follow the first for now
        if (uris.length > 0) {
            this.followLink(uris[0]);
        } else {
            console.log("no links");
        }
    }
});

}(this, jQuery, d3));