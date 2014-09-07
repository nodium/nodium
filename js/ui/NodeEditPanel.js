(function (window, $, undefined) {

'use strict';

var ui          = window.setNamespace('app.ui'),
    app         = window.use('app'),
    NodeEvent   = window.use('app.event.NodeEvent'),
    Event       = window.use('app.event.Event'),
    _defaults;

ui.NodeEditPanel = app.createClass(ui.UIPanel, {

    construct: function (selector, options, kernel) {

        this.initialize(selector, kernel);

        this.options = $.extend({}, _defaults, options);
        this.name = 'Node Editor';
        this.icon = 'icon-pencil';

        // this is a temporary solution
        // mapping of node fields to ui field id
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
            .on(this, '#node-form', Event.SUBMIT)
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

    destroyProperty: function (deleteButton) {


        var field = $(deleteButton).closest('.node-field'),
            property = $('input', field).val();

        delete this.nodeData[property];

        field.remove();

        $(this.kernel).trigger(NodeEvent.UPDATE, [null, this.nodeData]);
    },

    destroyListElement: function (deleteButton, event) {


        var element = $(deleteButton).closest('li');
        //     property = $('input', field).val();

        // delete this.nodeData[property];

        element.remove();

        $(this.kernel).trigger(event, [null, this.nodeData]);
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

        var labels;

        // we don't have an object to update
        if (!this.nodeData) {
            return;
        }

        labels = this.getLabels();

        $(this.kernel).trigger(NodeEvent.UPDATELABEL, [null, this.nodeData, labels]);
    },

    updateProperties: function () {

        var properties;

        // we don't have an object to update
        if (!this.nodeData) {
            return;
        }

        properties = this.getProperties();

        $(this.kernel).trigger(NodeEvent.UPDATE, [null, this.nodeData, properties]);
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

        this.destroyProperty(event.currentTarget);
    },

    handleDeleteLabelButtonClick: function (event) {

        this.destroyListElement(event.currentTarget, NodeEvent.UPDATELABEL);
    },

    handleDeleteNodeButtonClick: function (event) {

        // TODO maybe change this if the edit panel knows about the graph state?

        $(this.kernel).trigger(NodeEvent.DESTROY, [undefined, this.nodeData]);
    },

    handleFocusout: function (event) {

        // check if we're updating property or label
        if ($(event.currentTarget).hasClass('node-label-value')) {
            console.log("updating label");
            // this.updateLabel(event.currentTarget);
            this.updateLabels();
        } else {
            // this.updateProperty(event.currentTarget);
            this.updateProperties();
        }
    },

    handleSubmit: function (event) {

        event.preventDefault();
        event.stopPropagation();

        $(this.kernel).trigger(NodeEvent.DESTROY, [null, this.nodeData]);
        this.view.trigger('panel-hide', [this]);
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