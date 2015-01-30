(function (context, $, _, undefined) {
'use strict';

var ui          = context.setNamespace('app.ui'),
    app         = context.use('app'),
    NodeEvent   = context.use('app.event.NodeEvent'),
    Event       = context.use('app.event.Event'),
    _defaults;

ui.NodeFilterPanel = app.createClass(ui.UIPanel, {

    construct: function (selector, options, kernel) {

        this.options = $.extend({}, _defaults, options);
        this.view = $(selector);
        this.name = 'Node Filter';
        this.icon = 'icon-filter';
        this.kernel = kernel;
    },

    init: function (container) {

        var filterUnsetHandler   = _.bind(this.handleFilterUnset, this),
            filterChangeHandler  = _.bind(this.handleFilterChange, this),
            nodeFilteredHandler  = _.bind(this.handleNodeFiltered, this),
            listItemClickHandler = _.bind(this.handleListItemClicked, this);

        $(container).on('menu-collapse', this.handleMenuCollapse.bind(this));
        $(this.kernel)
            .on(NodeEvent.FILTER_UNSET, filterUnsetHandler)
            .on(NodeEvent.FILTERED, nodeFilteredHandler);
        $('#node-query', this.view).on([
                Event.INPUT,
                Event.PASTE,
            ].join(' '), _.bind(this.handleQueryChange, this));

        $(this.view).on(Event.CLICK, 'li', listItemClickHandler);

        return this;
    },

    show: function () {

        var filterField = $('#node-query', this.view);

        this.super('show');

        // delay setting focus to filterField to prevent breaking the layout
        window.setTimeout(function () {
            filterField.focus();
        }, 200);

        $(this.kernel).trigger('mode-change', 'filter');
    },

    setData: function (data) {

        var nodesList = $('#node-filter-result', this.view),
            listItemHTML,
            nodeName,
            titleField = 'name', // TODO generalize
            value,
            i,
            nodesData;

        nodesData = _.sortBy(data, titleField);

        // create the html form elements
        nodesList.empty();

        for (i = nodesData.length; i > 0; i--) {

            nodeName = nodesData[i - 1]._properties[titleField];

            listItemHTML = context.createFromPrototype(nodesList, {
                name: nodeName,
            });

            nodesList.prepend(listItemHTML);
        }

        this.nodesData = nodesData;
    },

    unsetData: function (data) {

        var nodesList = $('#node-filter-result', this.view);

        $('#node-query', this.view).val('');

        // create the html form elements
        nodesList.empty();
        this.nodesData = null;
    },

    getNodeData: function (target) {

        var index = $('#node-filter-result li', this.view).index($(target));

        return this.nodesData[index];
    },


    /**
     * Event handlers
     */

    handleListItemClicked: function (event) {

        var nodeData = this.getNodeData(event.currentTarget);

        $(this.kernel)
            .trigger(NodeEvent.FILTER_UNSET)
            .trigger(NodeEvent.SELECT, [undefined, nodeData]);
    },

    handleNodeFiltered: function (event, nodes, data) {
        this.setData(data);
    },

    handleFilterUnset: function (event) {

        this.unsetData();
        this.view.trigger('panel-hide', [this]);
    },

    handleQueryChange: function (event) {

        this.query = $(event.target).val();
        $(this.kernel).trigger(NodeEvent.FILTER, [this.query]);
    }
});

}(this, jQuery, _));