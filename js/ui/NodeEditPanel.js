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

    updateProperty: function (field) {
        var property,
            value,
            nodeField;

        if (!this.nodeData) {
            return;
        }

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
    },

    updateLabel: function (field) {

        // var label = $(field).val();

        // move updating full labels array to here instead of nodecd?
        $(this.kernel).trigger(NodeEvent.UPDATELABEL, [null, this.nodeData]);
    },

    setData: function (data) {

        var propertiesList = $('#node-fields', this.view),
            fieldHTML,
            fieldName,
            titleField = this.kernel.getNodeTitleKey(), // this will not work soon
            value,
            i;

        this.nodeData = data || {};
        console.log(this.nodeData);

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

        // this.createListElements('#node-labels', data._labels);
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

        console.log(this.nodeData);

        $(this.kernel).trigger(NodeEvent.DESTROY, [undefined, this.nodeData]);
    },

    handleFocusout: function (event) {

        // check if we're updating property or label
        console.log(event.currentTarget);
        if ($(event.currentTarget).hasClass('node-label-value')) {
            console.log("updating label");
            this.updateLabel(event.currentTarget);
        } else {
            this.updateProperty(event.currentTarget);
        }
    },

    handleSubmit: function (event) {

        event.preventDefault();
        event.stopPropagation();

        $(this.kernel).trigger(NodeEvent.DESTROY, [null, this.nodeData]);
        this.view.trigger('panel-hide', [this]);
    },

    handleNewPropertyButtonClick: function (event) {

        // this.createProperty();

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