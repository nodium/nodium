(function (window, $, _, undefined) {
'use strict';

var ui          = window.setNamespace('app.ui'),
    app         = window.use('app'),
    NodeEvent   = window.use('app.event.NodeEvent'),
    Event       = window.use('app.event.Event'),
    _defaults;

ui.NodeFilterPanel = app.createClass({

    construct: function (selector, options, kernel) {

        this.options = $.extend({}, _defaults, options);
        this.view = $(selector);
        this.name = 'Node Filter';
        this.icon = 'icon-filter';
        this.kernel = kernel;
    },

    init: function (container) {

        var collapseHandler = window.curry(this.handleCollapse, this),
            filterUnsetHandler = window.curry(this.handleFilterUnset, this),
            filterChangeHandler = window.curry(this.handleFilterChange, this),
            nodeFilteredHandler = window.curry(this.handleNodeFiltered, this),
            listItemClickHandler = window.curry(this.handleListItemClicked, this),
            queryChangeHandler = window.curry(this.handleQueryChange, this);

        $(container).on('menu-collapse', collapseHandler);
        $(this.kernel)
            .on(NodeEvent.FILTER_UNSET, filterUnsetHandler)
            .on(NodeEvent.FILTERED, nodeFilteredHandler);
        $('#node-query', this.view).on([
                Event.INPUT,
                Event.PASTE,
            ].join(' '), queryChangeHandler);

        $(this.view).on(Event.CLICK, 'li', listItemClickHandler);

        return this;
    },

    destroy: function () {
        this.view.remove();
    },

    hide: function () {

        this.isVisible = false;
        this.view.removeClass('active');
    },

    show: function () {

        var filterField = $('#node-query', this.view);

        this.isVisible = true;
        this.view.addClass('active');

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
            titleField = this.kernel.getNodeTitleKey(),
            value,
            i,
            nodesData;

        nodesData = _.sortBy(data, titleField);        

        // create the html form elements
        nodesList.empty();

        for (i = nodesData.length; i > 0; i--) {

            nodeName = nodesData[i - 1][titleField];

            listItemHTML = window.createFromPrototype(nodesList, {
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

    handleCollapse: function (event) {

        if (this.isVisible) {
            this.hide();
        }
    },

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

}(window, window.jQuery, window._));