(function (window, $, _, undefined) {

'use strict';

var ui          = window.setNamespace('app.ui'),
    app         = window.use('app'),
    model       = window.use('app.model'),
    NodeEvent   = window.use('app.event.NodeEvent'),
    Event       = window.use('app.event.Event'),
    List        = window.use('app.ui.List'),
    _defaults;

ui.NodeEditPanel = app.createClass(ui.UIPanel, {

    construct: function (selector, options, kernel) {

        this.initialize(selector, kernel);

        this.options = $.extend({}, _defaults, options);
        this.name = 'Node Editor';
        this.icon = 'icon-pencil';

        // TODO put list item empty data somewhere else?
        this.propertyList = new List('#node-fields', '#node-form', {
            new:    '#new-property', // new handle
            delete: '.delete-property', // delete handle
            empty:  {
                field: '',
                value: '',
                rows:  1
            } // data needed to create empty item from prototype
        });

        this.labelList    = new List('#node-labels', '#node-form', {
            new:    '#new-label', // new handle
            delete: '.delete-label', // delete handle
            empty:  {
                label: ''
            } // data needed to create empty item from prototype
        });

        this.edgeList     = new List('#edges', '#node-form', {
            delete: '.delete-edge'
        });

        // mapping of node fields to ui field id
        // generalize this with options
        this.exceptions = {
            'node-title': 'name'
        };

        // this.bloodhound = new Bloodhound({
        //     name: 'labels',
        //     local: this.kernel
        // });
        // this.bloodhound.initialize();
    },

    init: function (container) {

        $(container).on('menu-collapse', this.handleMenuCollapse.bind(this));
        // $(this.kernel).on(NodeEvent.SELECTED, nodeSelectedHandler);
        this.kernel
            .on(this, NodeEvent.SELECTED)
            .on(this, NodeEvent.UNSELECTED)
            .on(this, NodeEvent.UPDATED);
        // $(this.kernel).on(NodeEvent.UNSELECTED, nodeUnselectedHandler);

        this
            .on(this, '#node-form', Event.FOCUS_OUT, 'textarea')
            .on(this, '#node-form', Event.FOCUS_OUT, 'input');

        $(this.labelList).on('list-delete', this.handleDeleteElement.bind(this, 'label'));
        $(this.propertyList).on('list-delete', this.handleDeleteElement.bind(this, 'property'));

        $('#delete-node-button', this.view).on(Event.CLICK, this.handleDeleteNodeButtonClick.bind(this));

        return this;
    },

    show: function () {

        var titleField = $('#node-title', this.view);

        this.super('show');

        // delay setting focus to titleField to prevent breaking the layout
        window.setTimeout(function () {
            titleField.focus();
        }, 200);
        $(this.kernel).trigger('mode-change', 'select');
    },

    unset: function (data, type) {

        console.log('unsetting data: ' + type);
        var update = new model.Update();

        if (type === 'label') {
            // data is the value
            update.unsetLabel(data);
        } else if (type === 'property') {
            // data is the property name
            update.unsetProperty(data);
        } else if (type === 'edge') {
            // ???
        }

        $(this.kernel).trigger(NodeEvent.UPDATE, [null, this.nodeData, update]);
    },

    /**
     * Create an object that can be given to the list renderer
     */
    parseLabel: function (value) {

        return {
            label: value
        };
    },

    /**
     * Create an object that can be given to the list renderer
     */
    parseProperty: function (value, key) {

        return {
            field: key,
            value: value,
            rows: 1
        };
    },

    /**
     * Gets the labels from the html fields
     */
    getLabels: function () {

        var data = this.labelList.get();

        return _.chain(data)
            .map(_.first) // every item has one element
            .pluck('value')
            .filter(function (value) {return value != '';})
            .valueOf();
    },

    /**
     * Gets the properties from the html fields
     */
    getProperties: function () {

        // TODO generalize field selectors
        // var fields = $('#node-fields').children(),
        var data = this.propertyList.get(),
            selector,
            key,
            value,
            properties = {};

        // handle the special fields
        for (selector in this.exceptions) {

            if (!this.exceptions.hasOwnProperty(selector)) {
                continue;
            }

            key = this.exceptions[selector];
            value = $('#' + selector).val();

            if (key == '' || value == '') {
                continue;
            }

            properties[key] = value;
        }

        // handle the regular property fields
        _.forEach(data, function (row) {
            key = row[0].value;
            value = row[1].value;
            if (key != '' && value != '') {
                properties[key] = value;
            }
        });

        return properties;
    },

    updateLabels: function (label) {

        var labels,
            update = new model.Update();

        // we don't have an object to update
        if (!this.nodeData) {
            return;
        }
        
        // update.setLabel(label);
        // console.log(update);
        labels = this.getLabels();
        update.setLabels(labels);

        $(this.kernel).trigger(NodeEvent.UPDATE, [null, this.nodeData, update]);
    },

    updateProperties: function () {

        var properties,
            update = new model.Update();

        // we don't have an object to update
        if (!this.nodeData) {
            return;
        }

        properties = this.getProperties();
        update.setProperties(properties);

        $(this.kernel).trigger(NodeEvent.UPDATE, [null, this.nodeData, update]);
    },

    setData: function (data) {

        var propertiesList = $('#node-fields', this.view),
            fieldHTML,
            fieldName,
            titleField = 'name', // TODO use this.exceptions
            propertyData,
            labelData,
            value,
            i;

        this.nodeData = data || {};

        // set the title field
        value = data._properties[titleField] || '';

        $('#node-title', this.view).val(value);

        // TODO use exceptions thing for title
        propertyData = _.map(data._properties, this.parseProperty)
                        .filter(function (element) {
                            return element.field !== titleField;
                        });

        labelData    = _.map(data._labels, this.parseLabel);

        this.propertyList.set(propertyData);
        this.labelList.set(labelData);
    },

    unsetData: function (data) {

        var propertiesList = $('#node-fields', this.view);
        var labelsList = $('#node-labels', this.view);

        $('#node-title', this.view).val('');

        // create the html form elements
        propertiesList.empty();
        labelsList.empty();
        this.nodeData = null;
    },


    /**
     * Event handlers
     */

    handleDeleteElement: function (type, event, data) {

        var key = data[0].value;

        if (key) {
            this.unset(key, type);
        }
    },

    handleDeleteNodeButtonClick: function (event) {

        event.preventDefault();
        event.stopPropagation();

        $(this.kernel).trigger(NodeEvent.DESTROY, [null, this.nodeData]);
    },

    handleFocusout: function (event) {

        // check if we're updating property or label
        if ($(event.currentTarget).hasClass('node-label-value')) {
            var label = $(event.currentTarget).val();
            this.updateLabels(label);
        } else {
            this.updateProperties();
        }
    },

    handleNewEdgeSubmit: function (event) {

        var value = $('#new-edge').val();

        if (value && value !== '') {
            this.edgeList.add({
                name: value
            });

            // update the node's edge data
        }
    },

    handleNodeSelected: function (event, node, data) {

        this.setData(data);
        this.view.trigger('panel-show', [this]);
    },

    handleNodeUnselected: function (event, node, data) {

        this.unsetData();
        this.view.trigger('panel-hide', [this]);
    },

    handleNodeUpdated: function (event, node, data, update) {

        if (this.isVisible && this.nodeData.index === data.index) {

            this.setData(data);
        }
    }
});

}(window, window.jQuery, window._));