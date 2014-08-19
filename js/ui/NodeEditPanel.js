(function (window, $, undefined) {
    'use strict';

    var ui = window.setNamespace('app.ui'),
        NodeEvent = window.use('app.event.NodeEvent'),
        Event = window.use('app.event.Event'),
        NodeEditPanel,
        _defaults;

    NodeEditPanel = function (selector, options, kernel) {

        if (false === (this instanceof NodeEditPanel)) {
            return new NodeEditPanel(arguments);
        }

        this.options = $.extend({}, _defaults, options);
        this.view = $(selector);
        this.name = 'Node Editor';
        this.icon = 'icon-pencil';
        this.kernel = kernel;

        // this is a temporary solution
        // mapping of node fields to ui field id
        this.exceptions = {
            'node-title': 'name'
        };
    };

    NodeEditPanel.prototype.init = function (container) {

        var collapseHandler = window.curry(this.handleCollapse, this),
            nodeCreatedHandler = window.curry(this.handleNodeCreated, this),
            nodeSelectedHandler = window.curry(this.handleNodeSelected, this),
            nodeUnselectedHandler = window.curry(this.handleNodeUnselected, this),
            focusOutHandler = window.curry(this.handleFocusOut, this),
            formSubmitHandler = window.curry(this.handleFormSubmit, this),
            newPropertyButtonClickHandler = window.curry(this.handleNewPropertyButtonClick, this),
            deletePropertyButtonClickHandler = window.curry(this.handleDeletePropertyButtonClick, this),
            newLabelButtonClickHandler = window.curry(this.handleNewLabelButtonClick, this),
            deleteLabelButtonClickHandler = window.curry(this.handleDeleteLabelButtonClick, this);

        $(container).on('menu-collapse', collapseHandler);
        $(this.kernel).on(NodeEvent.SELECTED, nodeSelectedHandler);
        $(this.kernel).on(NodeEvent.UNSELECTED, nodeUnselectedHandler);
        $('#node-form', this.view).on(Event.SUBMIT, formSubmitHandler);
        $('#node-form', this.view).on(Event.FOCUS_OUT, 'textarea', focusOutHandler);
        $('#node-form', this.view).on(Event.FOCUS_OUT, 'input', focusOutHandler);
        $('#new-property', this.view).on(Event.CLICK, newPropertyButtonClickHandler);
        $('#node-form', this.view).on(Event.CLICK, '.delete-property', deletePropertyButtonClickHandler);
        $('#new-label', this.view).on(Event.CLICK, newLabelButtonClickHandler);
        $('#node-form', this.view).on(Event.CLICK, '.delete-label', deleteLabelButtonClickHandler);

        return this;
    };

    NodeEditPanel.prototype.destroy = function () {
        this.view.remove();
    };

    NodeEditPanel.prototype.hide = function () {

        this.isVisible = false;
        this.view.removeClass('active');
    };

    NodeEditPanel.prototype.show = function () {

        var titleField = $('#node-title', this.view);

        this.isVisible = true;
        this.view.addClass('active');

        // delay setting focus to titleField to prevent breaking the layout
        window.setTimeout(function () {
            titleField.focus();
        }, 200);
        $(this.kernel).trigger('mode-change', 'select');
    };

    NodeEditPanel.prototype.createProperty = function () {

        var fieldHTML,
            propertiesList = $('#node-fields', this.view);

        fieldHTML = window.createFromPrototype(propertiesList, {
            field: '',
            value: '',
            rows: 1
        });

        $('input', $(fieldHTML).appendTo(propertiesList)).focus();
    };

    NodeEditPanel.prototype.createListElement = function (selector, data) {

        var fieldHTML,
            elementList = $(selector, this.view);

        fieldHTML = window.createFromPrototype(elementList, data);

        $('input', $(fieldHTML).appendTo(elementList)).focus();
    };

    NodeEditPanel.prototype.createListElements = function (selector, data) {

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
    };

    NodeEditPanel.prototype.destroyProperty = function (deleteButton) {


        var field = $(deleteButton).closest('.node-field'),
            property = $('input', field).val();

        delete this.nodeData[property];

        field.remove();

        $(this.kernel).trigger(NodeEvent.UPDATE, [null, this.nodeData]);
    };

    NodeEditPanel.prototype.destroyListElement = function (deleteButton, event) {


        var element = $(deleteButton).closest('li');
        //     property = $('input', field).val();

        // delete this.nodeData[property];

        element.remove();

        $(this.kernel).trigger(event, [null, this.nodeData]);
    };

    NodeEditPanel.prototype.updateProperty = function (field) {
        var property,
            value,
            nodeField;

        // catch the special property fields
        if (this.exceptions.hasOwnProperty(field.id)) {
            property = this.exceptions[field.id];
            value = $(field).val();
        } else {
            nodeField = $(field).closest('.node-field');
            property = $('input', nodeField).val();
            value = $('textarea', nodeField).val();
        }

        // TODO currently this doesn't take into account when the property name
        // was updated. This is still handled in nodeCD.handleNodeUpdate (which
        // doesn't yet use the this.nodeData that's being passed to it)

        console.log("ui update property: " + property + ": " + value);

        // only update when the value was changed
        if (this.nodeData[property] != value && value != '') {
            this.nodeData[property] = value;

            $(this.kernel).trigger(NodeEvent.UPDATE, [null, this.nodeData]);
        }
    };

    NodeEditPanel.prototype.updateLabel = function (field) {

        var label = $(field).val();

        // move updating full labels array to here instead of nodecd?
        $(this.kernel).trigger(NodeEvent.UPDATELABEL, [null, this.nodeData]);
    };

    NodeEditPanel.prototype.setData = function (data) {

        var propertiesList = $('#node-fields', this.view),
            fieldHTML,
            fieldName,
            titleField = this.kernel.getNodeTitleKey(), // this will not work soon
            value,
            i;

        this.nodeData = data;

        // set the title field
        value = data[titleField] || '';

        $('#node-title', this.view).val(value);

        // create the html form elements
        propertiesList.empty();

        for (i = data._fields.length; i > 0; i--) {

            fieldName = data._fields[i - 1];

            // the title property is rendered differently
            if (fieldName === titleField) {
                continue;
            }

            fieldHTML = window.createFromPrototype(propertiesList, {
                field: fieldName,
                value: data[fieldName],
                rows: 1
            });

            propertiesList.append(fieldHTML);
        }

        this.createListElements('#node-labels', data._labels);
    };

    NodeEditPanel.prototype.unsetData = function (data) {

        var propertiesList = $('#node-fields', this.view);
        var labelsList = $('#node-labels', this.view);

        $('#node-title', this.view).val('');

        // create the html form elements
        propertiesList.empty();
        labelsList.empty();
        this.nodeData = null;
    };


    /**
     * Event handlers
     */

    NodeEditPanel.prototype.handleCollapse = function (event) {

        if (this.isVisible) {
            this.hide();
        }
    };

    NodeEditPanel.prototype.handleDeletePropertyButtonClick = function (event) {

        this.destroyProperty(event.currentTarget);
    };

    NodeEditPanel.prototype.handleDeleteLabelButtonClick = function (event) {

        this.destroyListElement(event.currentTarget, NodeEvent.UPDATELABEL);
    };

    NodeEditPanel.prototype.handleFocusOut = function (event) {

        // check if we're updating property or label
        console.log(event.currentTarget);
        if ($(event.currentTarget).hasClass('node-label-value')) {
            console.log("updating label");
            this.updateLabel(event.currentTarget);
        } else {
            this.updateProperty(event.currentTarget);
        }
    };

    NodeEditPanel.prototype.handleFormSubmit = function (event) {

        event.preventDefault();
        event.stopPropagation();

        $(this.kernel).trigger(NodeEvent.DESTROY, [null, this.nodeData]);
        this.view.trigger('panel-hide', [this]);
    };

    NodeEditPanel.prototype.handleNewPropertyButtonClick = function (event) {

        // this.createProperty();

        this.createListElement('#node-fields', {
            field: '',
            value: '',
            rows: 1
        });
    };

    NodeEditPanel.prototype.handleNewLabelButtonClick = function (event) {

        this.createListElement('#node-labels', {
            label: ''
        });
    }

    NodeEditPanel.prototype.handleNodeSelected = function (event, node, data) {

        this.setData(data);
        this.view.trigger('panel-show', [this]);
    };

    NodeEditPanel.prototype.handleNodeUnselected = function (event, node, data) {

        this.unsetData();
        this.view.trigger('panel-hide', [this]);
    };

    ui.NodeEditPanel = NodeEditPanel;

}(window, window.jQuery));