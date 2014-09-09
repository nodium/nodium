(function (window, $, undefined) {

'use strict';

var ui          = window.setNamespace('app.ui'),
    app         = window.use('app'),
    model       = window.use('app.model'),
    NodeEvent   = window.use('app.event.NodeEvent'),
    Event       = window.use('app.event.Event'),
    _defaults;

ui.NodeEditPanel = app.createClass(ui.UIPanel, {

    construct: function (selector, options, kernel) {

        this.initialize(selector, kernel);

        this.options = $.extend({}, _defaults, options);
        this.name = 'Node Editor';
        this.icon = 'icon-pencil';

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

        var // nodeCreatedHandler = this.handleNodeCreated.bind(this),
            // nodeSelectedHandler = window.curry(this.handleNodeSelected, this),
            // nodeUnselectedHandler = window.curry(this.handleNodeUnselected, this),
            newPropertyButtonClickHandler = this.handleNewPropertyButtonClick.bind(this),
            deletePropertyButtonClickHandler = this.handleDeletePropertyButtonClick.bind(this),
            newLabelButtonClickHandler = this.handleNewLabelButtonClick.bind(this),
            deleteLabelButtonClickHandler = this.handleDeleteLabelButtonClick.bind(this);

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

        $('#new-property', this.view).on(Event.CLICK, newPropertyButtonClickHandler);
        $('#node-form', this.view).on(Event.CLICK, '.delete-property', deletePropertyButtonClickHandler);
        $('#new-label', this.view).on(Event.CLICK, newLabelButtonClickHandler);
        $('#node-form', this.view).on(Event.CLICK, '.delete-label', deleteLabelButtonClickHandler);

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

    createProperty: function () {

        var fieldHTML,
            propertiesList = $('#node-fields', this.view);

        fieldHTML = window.createFromPrototype(propertiesList, {
            field: '',
            value: '',
            rows: 1
        });

        $('input', $(fieldHTML).appendTo(propertiesList)).focus();
    },

    createListElement: function (selector, data) {

        var fieldHTML,
            elementList = $(selector, this.view);

        fieldHTML = window.createFromPrototype(elementList, data);

        $('input', $(fieldHTML).appendTo(elementList)).focus();
    },

    createListElements: function (selector, data) {

        var elementList = $(selector, this.view),
            elementHTML,
            label,
            i;

        // create the html form elements
        elementList.empty();

        for (i = data.length; i > 0; i--) {

            // make object creation generic
            elementHTML = window.createFromPrototype(elementList, {
                label: data[i - 1]
            });

            elementList.append(elementHTML);
        }
    },

    destroyListElement: function (deleteButton, type) {


        var element = $(deleteButton).closest('li'),
            key = $('.node-key', element).val(),
            update = {};

        console.log("destroying element");
        console.log(key);

        element.remove();

        if (type === 'label') {

            // set complete labels array
            // TODO is it safe to use the index??
            var labels = this.getLabels();
            model.Node.setLabelsForUpdate(update, labels);

        } else if (type === 'property') {

            // unset single property
            model.Node.unsetPropertyForUpdate(update, key);
        }

        $(this.kernel).trigger(NodeEvent.UPDATE, [null, this.nodeData, update]);
    },

    /**
     * Gets the labels from the html fields
     */
    getLabels: function () {

        var fields = $('#node-labels').children(),
            i,
            labels = [],
            value;

        for (i = 0; i < fields.length; i++) {
            value = $('.node-label-value', fields[i]).val();

            // skip if the key is empty
            if (value == '') {
                continue;
            }

            labels.push(value);
        }

        return labels;
    },

    /**
     * Gets the properties from the html fields
     */
    getProperties: function () {

        // TODO generalize field selectors
        var fields = $('#node-fields').children(),
            i,
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
        for (i = 0; i < fields.length; i++) {
            key = $('.node-key', fields[i]).val();
            value = $('.node-value', fields[i]).val();

            // skip if the key is empty
            if (key == '' || value == '') {
                continue;
            }

            properties[key] = value;
        }

        return properties;
    },

    updateLabels: function () {

        var labels,
            update = {};

        // we don't have an object to update
        if (!this.nodeData) {
            return;
        }

        labels = this.getLabels();

        // TODO panel shouldn't know about model?
        model.Node.setLabelsForUpdate(update, labels);

        $(this.kernel).trigger(NodeEvent.UPDATE, [null, this.nodeData, update]);
    },

    updateProperties: function () {

        var properties,
            update = {};

        // we don't have an object to update
        if (!this.nodeData) {
            return;
        }

        properties = this.getProperties();

        // TODO panel shouldn't know about model?
        model.Node.setPropertiesForUpdate(update, properties);

        $(this.kernel).trigger(NodeEvent.UPDATE, [null, this.nodeData, update]);
    },

    setData: function (data) {

        var propertiesList = $('#node-fields', this.view),
            fieldHTML,
            fieldName,
            titleField = 'name', // TODO use this.exceptions
            value,
            i;

        this.nodeData = data || {};

        // set the title field
        value = data._properties[titleField] || '';

        $('#node-title', this.view).val(value);

        // create the html form elements
        propertiesList.empty();

        for (fieldName in data._properties) {

            if (!data._properties.hasOwnProperty(fieldName)) {
                continue;
            }

            // the title property is rendered differently
            // TODO not generic enough
            if (fieldName === titleField) {
                continue;
            }

            fieldHTML = window.createFromPrototype(propertiesList, {
                field: fieldName,
                value: data._properties[fieldName],
                rows: 1
            });

            propertiesList.append(fieldHTML);
        }

        this.createListElements('#node-labels', data._labels);
        // $('.node-label-values').typeahead()
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

    handleDeletePropertyButtonClick: function (event) {

        this.destroyListElement(event.currentTarget, 'property');
    },

    handleDeleteLabelButtonClick: function (event) {

        this.destroyListElement(event.currentTarget, 'label');
    },

    handleDeleteNodeButtonClick: function (event) {

        event.preventDefault();
        event.stopPropagation();

        $(this.kernel).trigger(NodeEvent.DESTROY, [null, this.nodeData]);
    },

    handleFocusout: function (event) {

        // check if we're updating property or label
        if ($(event.currentTarget).hasClass('node-label-value')) {
            this.updateLabels();
        } else {
            this.updateProperties();
        }
    },

    handleNewPropertyButtonClick: function (event) {

        this.createListElement('#node-fields', {
            field: '',
            value: '',
            rows: 1
        });


    },

    handleNewLabelButtonClick: function (event) {

        this.createListElement('#node-labels', {
            label: ''
        });
    },

    handleNodeSelected: function (event, node, data) {

        this.setData(data);
        this.view.trigger('panel-show', [this]);
    },

    handleNodeUnselected: function (event, node, data) {

        this.unsetData();
        this.view.trigger('panel-hide', [this]);
    },

    handleNodeUpdated: function (event, node, data) {

        if (this.isVisible && this.nodeData.index === data.index) {

            this.setData(data);
        }
    }
});

}(window, window.jQuery));