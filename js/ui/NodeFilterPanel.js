(function (window, $, undefined) {
    'use strict';

    var ui = window.setNamespace('app.ui'),
        NodeEvent = window.use('app.event.NodeEvent'),
        Event = window.use('app.event.Event'),
        NodeFilterPanel,
        _defaults;

    NodeFilterPanel = function (selector, options, kernel) {

        if (false === (this instanceof NodeFilterPanel)) {
            return new NodeFilterPanel(arguments);
        }

        this.options = $.extend({}, _defaults, options);
        this.view = $(selector);
        this.name = 'Node Filter';
        this.icon = 'icon-filter';
        this.kernel = kernel;
    };

    NodeFilterPanel.prototype.init = function (container) {

        var collapseHandler = window.curry(this.handleCollapse, this),
            filterUnsetHandler = window.curry(this.handleFilterUnset, this),
            filterChangeHandler = window.curry(this.handleFilterChange, this),
            nodeFilteredHandler = window.curry(this.handleNodeFiltered, this),
            queryChangeHandler = window.curry(this.handleQueryChange, this);

        $(container).on('menu-collapse', collapseHandler);
        $(this.kernel)
            .on(NodeEvent.FILTER_UNSET, filterUnsetHandler)
            .on(NodeEvent.FILTERED, nodeFilteredHandler);
        $('#node-query', this.view).on([
                Event.INPUT,
                Event.PASTE,
            ].join(' '), queryChangeHandler);

        return this;
    };

    NodeFilterPanel.prototype.destroy = function () {
        this.view.remove();
    };

    NodeFilterPanel.prototype.hide = function () {

        this.isVisible = false;
        this.view.removeClass('active');
    };

    NodeFilterPanel.prototype.show = function () {

        var filterField = $('#node-query', this.view);

        this.isVisible = true;
        this.view.addClass('active');

        // delay setting focus to filterField to prevent breaking the layout
        window.setTimeout(function () {
            filterField.focus();
        }, 200);

        $(this.kernel).trigger('mode-change', 'filter');
    };

    NodeFilterPanel.prototype.setData = function (data) {

        var nodesList = $('#node-filter-result', this.view),
            listItemHTML,
            nodeName,
            titleField = this.kernel.getNodeTitleKey(),
            value,
            i;

        this.nodesData = data;
        console.log('setData');

        // create the html form elements
        nodesList.empty();

        for (i = data.length; i > 0; i--) {

            nodeName = data[i - 1][titleField];

            console.log(nodeName);

            listItemHTML = window.createFromPrototype(nodesList, {
                name: nodeName,
            });

            nodesList.append(listItemHTML);
        }
    };

    NodeFilterPanel.prototype.unsetData = function (data) {

        console.log('unsetData');
        var nodesList = $('#node-filter-result', this.view);

        $('#node-query', this.view).val('');

        // create the html form elements
        nodesList.empty();
        this.nodesData = null;
    };


    /**
     * Event handlers
     */

    NodeFilterPanel.prototype.handleCollapse = function (event) {

        if (this.isVisible) {
            this.hide();
        }
    };

    NodeFilterPanel.prototype.handleNodeFiltered = function (event, nodes, data) {
        this.setData(data);
    };

    NodeFilterPanel.prototype.handleFilterUnset = function (event) {

        this.unsetData();
        this.view.trigger('panel-hide', [this]);
    };

    NodeFilterPanel.prototype.handleQueryChange = function (event) {

        this.query = $(event.target).val();
        $(this.kernel).trigger(NodeEvent.FILTER, [this.query]);
    };

    ui.NodeFilterPanel = NodeFilterPanel;

}(window, window.jQuery));