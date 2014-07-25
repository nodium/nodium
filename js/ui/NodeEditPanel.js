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
    };

    NodeEditPanel.prototype.init = function (container) {

        var collapseHandler = window.curry(this.handleCollapse, this),
            nodeCreatedHandler = window.curry(this.handleNodeCreated, this),
            nodeSelectedHandler = window.curry(this.handleNodeSelected, this),
            nodeUnselectedHandler = window.curry(this.handleNodeUnselected, this),
            focusOutHandler = window.curry(this.handleFocusOut, this),
            formSubmitHandler = window.curry(this.handleFormSubmit, this),
            newPropertyButtonClickHandler = window.curry(this.handleNewPropertyButtonClick, this),
            deletePropertyButtonClickHandler = window.curry(this.handleDeletePropertyButtonClick, this);

        $(container).on('menu-collapse', collapseHandler);
        $(this.kernel).on(NodeEvent.SELECTED, nodeSelectedHandler);
        $(this.kernel).on(NodeEvent.UNSELECTED, nodeUnselectedHandler);
        $('#node-form', this.view).on(Event.SUBMIT, formSubmitHandler);
        $('#node-form', this.view).on(Event.FOCUS_OUT, 'textarea', focusOutHandler);
        $('#new-property', this.view).on(Event.CLICK, newPropertyButtonClickHandler);
        $('#node-form', this.view).on(Event.CLICK, '.delete-property', deletePropertyButtonClickHandler);

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

    NodeEditPanel.prototype.destroyProperty = function (deleteButton) {


        var field = $(deleteButton).closest('.node-field'),
            property = $('input', field).val();

        delete this.nodeData[property];

        field.remove();

        $(this.kernel).trigger(NodeEvent.UPDATE, [null, this.nodeData]);
    };

    NodeEditPanel.prototype.updateProperty = function (field) {
        var property,
            value;

        property = $('input', $(field).closest('.node-field')).val();
        value = $(field).val();

        this.nodeData[property] = value;

        $(this.kernel).trigger(NodeEvent.UPDATE, [null, this.nodeData]);
    };

    NodeEditPanel.prototype.setData = function (data) {

        var propertiesList = $('#node-fields', this.view),
            fieldHTML,
            fieldName,
            titleField = this.kernel.getNodeTitleKey(),
            value,
            i;

        this.nodeData = data;

        // set the title field
        value = data[titleField] || '';

        $('#node-title', this.view).val(value);

        // create the html form elements
        propertiesList.empty();

        for (i = data._fields.length; i > 0; i--) {

            fieldName = data._fields[i];

            // the title property is rendered differently
            if (fieldName === titleField) {
                continue;
            }

            fieldHTML = window.createFromPrototype(propertiesList, {
                field: fieldName,
                value: data[fieldName],
                rows: 1
            });

            propertiesList.prepend(fieldHTML);
        }
    };

    NodeEditPanel.prototype.unsetData = function (data) {

        var propertiesList = $('#node-fields', this.view);

        $('#node-title', this.view).val('');

        // create the html form elements
        propertiesList.empty();
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

    NodeEditPanel.prototype.handleFocusOut = function (event) {

        this.updateProperty(event.currentTarget);
    };

    NodeEditPanel.prototype.handleFormSubmit = function (event) {

        event.preventDefault();
        event.stopPropagation();

        $(this.kernel).trigger(NodeEvent.DESTROY);
        this.view.trigger('panel-hide', [this]);
    };

    NodeEditPanel.prototype.handleNewPropertyButtonClick = function (event) {

        this.createProperty();
    };

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