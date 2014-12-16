(function (window, $, undefined) {

'use strict';

var ui          = window.setNamespace('app.ui'),
    app         = window.use('app'),
    model       = window.use('app.model'),
    Event       = window.use('app.event.Event'),
    _defaults;

ui.List = app.createClass({

    /**
     * @param object options The elements that should catch add, delete events
     */
    construct: function (selector, view, options) {

        /** the selector for the list object */
        this.selector = selector;

        /** the environment */
        this.view = view;

        /** the actual list */
        this.$list = $(this.selector, this.view);

        /** bind the event handlers */

        // gives off an event whenever an element is clicked
        $(this.selector).on(Event.CLICK, this.handleElementClick.bind(this));

        if (options && options.delete) {
            $(this.selector, this.view).on(
                Event.CLICK,
                options.delete,
                this.handleDeleteElementButtonClick.bind(this)
            );
        }

        if (options && options.new) {
            $(options.new, this.view).on(
                Event.CLICK,
                _.partialRight(
                    this.handleNewElementButtonClick.bind(this),
                    options.empty
                )
            );
        }
    },

    /**
     * @param data  The data to be used in creating the element
     * @param focus Selector of the element to be focused
     *
     * @return The added element
     */
    add: function (data) {

        var element = window.createFromPrototype(this.$list, data);

        return $(element).appendTo(this.$list);
    },

    /**
     * @param data  The data to be used in creating the element
     * @param input Selector of the element to be focused
     */
    addAndFocus: function (data, input) {

        var $element = this.add(data);

        $(input, $element).focus();

        return $element;
    },

    clear: function () {

        this.$list.empty();
    },

    /**
     * Removes an element from the list
     */
    delete: function (element) {

        // first get the data
        var data = this.getItemData(element);

        element.remove();

        return data;
    },

    /**
     * Removes a list item by sub-element
     */
    deleteByElement: function (element) {

        var element = $(element).closest('li');

        return this.delete(element);
    },

    /**
     * @return Array All data from the list
     * Each list item is represented as an array objects describing the fields
     * as class, id, type, value
     */
    get: function () {

        return _.map(this.$list.children(), this.getItemData, this);
    },

    getItemData: function (item) {

        var fields = $('input[type="text"], textarea', item);
        return _.map(fields, this.getFieldData, this);
    },

    /**
     * Reads the data from an input element
     *
     * @return object
     */
    getFieldData: function (inputElement) {

        var $element = $(inputElement);

        return {
            class: $element.attr('class'),
            id:    $element.attr('id'),
            value: $element.val(),
            data:  $element.data()
        };
    },

    /**
     * Recreates the complete list from the data
     */
    set: function (data) {

        this.$list.empty();
        data.forEach(this.add, this);

        return this;
    },


    /*
     * Event handlers
     */

    handleDeleteElementButtonClick: function (event) {

        var data = this.deleteByElement(event.currentTarget);

        $(this).trigger('list-delete', [data]);
    },

    /**
     * add list element and focus on created input field
     */
    handleNewElementButtonClick: function (event, empty) {

        this.addAndFocus(empty, 'input');
    },

    handleElementClick: function (event) {

        var element     = event.target,
            item        = $(element).closest('li'),
            elementData = this.getFieldData(element),
            itemData    = this.getItemData(item);

        $(this).trigger('list-click', [elementData, itemData]);
    }
});

}(window, window.jQuery));