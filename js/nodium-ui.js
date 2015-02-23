(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * This file is part of the Nodium core package
 *
 * (c) Niko van Meurs & Sid Mijnders
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/**
 * @author Niko van Meurs <nikovanmeurs@gmail.com>
 * @author Sid Mijnders
 */
 (function (window, undefined) {

    'use strict';

    require('./nodium-ui')(window.Nodium);

}(window));
},{"./nodium-ui":2}],2:[function(require,module,exports){
/**
 * This file is part of the Nodium core package
 *
 * (c) Niko van Meurs & Sid Mijnders
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/**
 * @author Niko van Meurs <nikovanmeurs@gmail.com>
 * @author Sid Mijnders
 */
module.exports = function (Nodium, undefined) {

    var context = Nodium.context,
        jQuery  = context.jQuery,
        _       = context._;

    Nodium.ui   = Nodium.ui || {};

    require('./ui/UIElement')(Nodium, jQuery);
    require('./ui/UIPanel')(Nodium, jQuery);
    require('./ui/PanelContainer')(Nodium, jQuery);
    require('./ui/List')(Nodium, jQuery);
    require('./ui/EdgeEditor')(Nodium, jQuery, _);
    require('./ui/EdgeModePanel')(Nodium, jQuery);
    require('./ui/NodeEditPanel')(Nodium, jQuery, _);
    require('./ui/NodeExplorerPanel')(Nodium, jQuery, _);
    require('./ui/NodeFilterPanel')(Nodium, jQuery, _);
};

},{"./ui/EdgeEditor":3,"./ui/EdgeModePanel":4,"./ui/List":5,"./ui/NodeEditPanel":6,"./ui/NodeExplorerPanel":7,"./ui/NodeFilterPanel":8,"./ui/PanelContainer":9,"./ui/UIElement":10,"./ui/UIPanel":11}],3:[function(require,module,exports){
/**
 * This file is part of the Nodium core package
 *
 * (c) Niko van Meurs & Sid Mijnders
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/**
 * @author Niko van Meurs <nikovanmeurs@gmail.com>
 * @author Sid Mijnders
 */
module.exports = function (Nodium, $, _, undefined) {

    'use strict';

    var model       = Nodium.model,
        ui          = Nodium.ui,
        util        = Nodium.util,
        Event       = Nodium.event.Event,
        NodeEvent   = Nodium.event.NodeEvent,
        _defaults   = {};

    ui.EdgeEditor = Nodium.createClass({

        construct: function (selector, options, kernel) {

            this.initialize(selector, kernel);

            this.options = $.extend({}, _defaults, options);
            this.name = 'Edge Editor';
        },

        init: function (container) {

            var // nodeCreatedHandler = this.handleNodeCreated.bind(this),
                // nodeSelectedHandler = _.bind(this.handleNodeSelected, this),
                // nodeUnselectedHandler = _.bind(this.handleNodeUnselected, this),
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

            fieldHTML = util.createFromPrototype(propertiesList, {
                field: '',
                value: '',
                rows: 1
            });

            $('input', $(fieldHTML).appendTo(propertiesList)).focus();
        },

        createListElement: function (selector, data) {

            var fieldHTML,
                elementList = $(selector, this.view);

            fieldHTML = util.createFromPrototype(elementList, data);

            $('input', $(fieldHTML).appendTo(elementList)).focus();
        },

        createListElements: function (selector, data) {

            var elementList = $(selector, this.view),
                elementHTML,
                label,
                i;

            // create the html form elements
            elementList.empty();

            for (i = 0; i < data.length; i++) {

                // make object creation generic
                elementHTML = util.createFromPrototype(elementList, {
                    label: data[i]
                });

                elementList.append(elementHTML);
            }
        },

        destroyListElement: function (deleteButton, type) {


            var element = $(deleteButton).closest('li'),
                key = $('.node-key', element).val(),
                update = new model.Update(),
                labels;

            element.remove();

            if (type === 'label') {
                update.unsetLabel(key);
            } else if (type === 'property') {
                update.unsetProperty(key);
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

                fieldHTML = util.createFromPrototype(propertiesList, {
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

            // TODO this shouldn't be necessary
            if ($(event.currentTarget).hasClass('delete-label')) {
                return;
            }

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
                var label = $(event.currentTarget).val();
                this.updateLabels(label);
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

        handleNodeUpdated: function (event, node, data, update) {

            if (this.isVisible && this.nodeData.index === data.index) {

                this.setData(data);
            }
        }
    });
};

},{}],4:[function(require,module,exports){
/**
 * This file is part of the Nodium core package
 *
 * (c) Niko van Meurs & Sid Mijnders
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/**
 * @author Niko van Meurs <nikovanmeurs@gmail.com>
 * @author Sid Mijnders
 */
module.exports = function (Nodium, $, undefined) {

    'use strict';

    var ui          = Nodium.ui,
        EdgeEvent   = Nodium.event.EdgeEvent,
        Event       = Nodium.event.Event,
        _defaults   = {};

    ui.EdgeModePanel = Nodium.createClass({

        construct: function (options, selector) {

            this.options = $.extend({}, _defaults, options);
            this.name = 'Edge mode';
            this.selector = selector;

            $(selector).on(Event.CHANGE, 'input[type=radio]', this.handleChange.bind(this));
            $('input[value=LINK]').click();
        },

        /**
         * set the edge mode variable
         */
        handleChange: function (event) {

            var target = event.target,
                mode = $(target).val();

            $(target)
                .parent()
                .addClass('selected')
                .siblings()
                .removeClass('selected');

            $(this.kernel).trigger(EdgeEvent.MODECHANGE, [mode]);
        }
    });
};

},{}],5:[function(require,module,exports){
/**
 * This file is part of the Nodium core package
 *
 * (c) Niko van Meurs & Sid Mijnders
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/**
 * @author Niko van Meurs <nikovanmeurs@gmail.com>
 * @author Sid Mijnders
 */
module.exports = function (Nodium, $, undefined) {

    'use strict';

    var model       = Nodium.model,
        ui          = Nodium.ui,
        util        = Nodium.util,
        Event       = Nodium.event.Event,
        _defaults;

    ui.List = Nodium.createClass({

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

            var element = util.createFromPrototype(this.$list, data);

            return $(element).appendTo(this.$list);
        },

        /**
         * @param data  The data to be used in creating the element
         * @param input Selector of the element to be focused
         */
        addAndFocus: function (data, input) {

            console.log(data);

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

        // Event handlers

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
};

},{}],6:[function(require,module,exports){
/**
 * This file is part of the Nodium core package
 *
 * (c) Niko van Meurs & Sid Mijnders
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/**
 * @author Niko van Meurs <nikovanmeurs@gmail.com>
 * @author Sid Mijnders
 */
module.exports = function (Nodium, $, _, undefined) {

    'use strict';

    var ui          = Nodium.ui,
        Event       = Nodium.event.Event,
        EdgeEvent   = Nodium.event.EdgeEvent,
        NodeEvent   = Nodium.event.NodeEvent,
        model       = Nodium.model,
        Node        = model.Node,
        List        = ui.List,
        _defaults;

    ui.NodeEditPanel = Nodium.createClass(ui.UIPanel, {

        construct: function (selector, options, kernel) {

            this.initialize(selector, kernel);

            this.options = $.extend({}, _defaults, options);
            this.name = 'Node Editor';
            this.icon = 'icon-pencil';

            // TODO put list item empty data somewhere else?
            this.propertyList = new List('#node-fields', '#node-form', {
                new:    '#new-property', // new handle
                delete: '.delete-property', // delete handle
                empty:  { field: '', value: '', rows:  1 } // empty prototype data
            });

            this.labelList = new List('#node-labels', '#node-form', {
                new:    '#new-label', // new handle
                delete: '.delete-label', // delete handle
                empty:  { label: '' } // empty prototype    data
            });

            this.edgeList = new List('#node-edges', '#node-form', {
                delete: '.delete-edge'
            });

            // mapping of node fields to ui field id
            // generalize this with options
            this.explicits = {
                'node-title': 'name'
            };

            /*
             * Typeahead using bloodhound
             * Initialization is done when the graph is loaded
             * and reinitialization when a node is updated
             */
            this.bloodhound = new Bloodhound({
                name: 'edges',
                local: this.getTypeaheadNodes.bind(this),
                datumTokenizer: function (node) {
                    return Bloodhound.tokenizers.whitespace(
                        Node.getPropertyValue(node, 'name')
                    );
                },
                queryTokenizer: Bloodhound.tokenizers.whitespace
            });

            $('#new-edge-target').typeahead(null, {
                source:     this.bloodhound.ttAdapter(),
                displayKey: function (node) {
                    return Node.getPropertyValue(node, 'name');
                }
            });
        },

        init: function (container) {

            $(container).on('menu-collapse', this.handleMenuCollapse.bind(this));
            this.kernel
                .on(this, NodeEvent.SELECTED)
                .on(this, NodeEvent.UNSELECTED)
                .on(this, NodeEvent.UPDATED);

            $(this.kernel).on(NodeEvent.LOADED, this.handleGraphLoaded.bind(this));
            $(this.kernel).on(EdgeEvent.CREATED, this.handleEdgeCreated.bind(this));
            $(this.kernel).on(EdgeEvent.DESTROYED, this.handleEdgeDestroyed.bind(this));

            this
                .on(this, '#node-form', Event.FOCUS_OUT, 'textarea')
                .on(this, '#node-form', Event.FOCUS_OUT, 'input');

            this.view.find('#node-form').on('keydown', function (event) { event.keyCode === 13 && event.preventDefault() });
            this.view.find('#new-edge').on('click', this.handleCreateEdge.bind(this));

            $(this.labelList).on('list-delete', this.handleDeleteElement.bind(this, 'label'));
            $(this.propertyList).on('list-delete', this.handleDeleteElement.bind(this, 'property'));
            $(this.edgeList).on('list-delete', this.handleDeleteEdge.bind(this));
            $(this.edgeList).on('list-click', this.handleEdgeElementClicked.bind(this));
            $('#new-edge-target').on('typeahead:selected', this.handleCreateEdge.bind(this));

            $('#delete-node-button', this.view).on(Event.CLICK, this.handleDeleteNodeButtonClick.bind(this));

            return this;
        },

        getTypeaheadNodes: function () {

            // filter all nodes
            if (this.nodes) {
                return this.nodes.filter(function (node) {
                    return Node.hasProperty(node, 'name');
                });
            } else {
                return [];
            }
        },

        keyEdgesByNode: function () {

            var sourceId,
                targetId,
                currentId = Node.getId(this.nodeData),
                otherId,
                edges = {};

            // delete the edge from the nodeEdges
            this.nodeEdges.forEach(function (edge, i) {

                sourceId = Node.getId(edge.source);
                targetId = Node.getId(edge.target);

                if (currentId == sourceId) {
                    direction = 'from';
                    otherId = targetId;
                } else if (currentId == targetId) {
                    direction = 'to';
                    otherId = sourceId;
                }

                if (!edges.hasOwnProperty(nodeId)) {
                    edges[nodeId] = [];
                }

                edges[nodeId].push({
                    direction: direction,
                    edge:      edge,
                    other:     otherId
                });
            }, this);
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

            var update = new model.Update();

            if (type === 'label') {
                // data is the value
                update.unsetLabel(data);
            } else if (type === 'property') {
                // data is the property name
                update.unsetProperty(data);
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

        parseEdge: function (edge) {

            if (!this.nodeData) {
                return;
            }

            var id = Node.getId(this.nodeData),
                otherId,
                name,
                source = edge.source,
                target = edge.target,
                from   = Node.getId(source) == id;

            if (from) {
                otherId = Node.getId(target);
                name = Node.getPropertyValue(target, 'name');
            } else {
                otherId = Node.getId(source);
                name = Node.getPropertyValue(source, 'name');
            }

            return {
                edgeId:    edge._id,
                nodeId:    otherId,
                name:      name || '',
                direction: from ? 'right' : 'left'
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
                .filter(function (value) {return value !== '';})
                .valueOf();
        },

        /**
         * Gets the properties from the html fields
         */
        getProperties: function () {

            var data = this.propertyList.get(),
                key,
                value,
                properties;

            // get properties from the explicit fields first
            properties = _.chain(this.explicits)
                .invert() // put property names as keys
                .mapValues(function (selector) { return $('#' + selector).val() })
                .pick(_.identity) // filter where value is empty
                .valueOf();

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

        updateLabels: function () {

            var update = new model.Update();
            update.setLabels(this.getLabels());

            $(this.kernel).trigger(NodeEvent.UPDATE, [null, this.nodeData, update]);
        },

        updateProperties: function () {

            var update = new model.Update();
            update.setProperties(this.getProperties());

            $(this.kernel).trigger(NodeEvent.UPDATE, [null, this.nodeData, update]);
        },

        setData: function (data) {

            var propertyData,
                labelData,
                edgeData;

            this.nodeData  = data || {};
            this.nodeEdges = Node.filterEdges(data, this.edges);

            // set the explicit fields first
            _.forOwn(this.explicits, function (property, selector) {
                var value = Node.getPropertyValue(data, property) || '';
                $('#'+selector, this.view).val(value);
            }, this);

            propertyData = _.map(data._properties, this.parseProperty)
                            .filter(function (element) {
                                return !_.contains(_.values(this.explicits), element.field);
                            }, this);
            labelData    = _.map(data._labels, this.parseLabel);
            edgeData     = _.map(this.nodeEdges, this.parseEdge, this);

            this.propertyList.set(propertyData);
            this.labelList.set(labelData);
            this.edgeList.set(edgeData);
        },

        unsetData: function (data) {

            // clear the values that are not in a list
            _.forOwn(this.explicits, function (property, selector) {
                $('#'+selector, this.view).val('');
            }, this);

            // clear typeahead in the undocumented typeahead way...
            // $('#new-edge').typeahead('val', '');
            // $('#new-edge').val('');

            this.propertyList.clear();
            this.labelList.clear();
            this.edgeList.clear();

            this.nodeData = null;
            this.nodeEdges = null;
        },


        /*
         * Event handlers
         */
        
        handleAutocompleteSelected: function (event, node) {

            if (!this.nodeData) {
                return;
            }

            // put stuff in edgelist
            this.selectedEdgePoint = node;
        },

        handleCreateEdge: function (event, node) {

            var edgeType,
                endpoint,
                endpointName,
                find;

            find = this.view.find.bind(this.view);

            if (!this.nodeData) {
                return;
            }

            edgeType = find('#new-edge-type').val();

            // put stuff in edgelist
            if (this.selectedEdgePoint) {
                endpoint = this.selectedEdgePoint
            } else {
                
                endpointName = find('#new-edge-target').val();

                if (!endpointName) {
                    return;
                }

                endpoint = _.find(this.nodes, function (node) {
                    return endpointName === Node.getPropertyValue('name');
                });

                if (!endpoint) {
                    return;
                }
            }

            $(this.kernel).trigger(EdgeEvent.CREATE, [this.nodeData, endpoint, edgeType]);

            $('#new-edge-target')
                .val('')
                .focus();

            // $('#new-edge').typeahead('val', '').focus();
        },

        handleDeleteEdge: function (event, data) {

            var sourceId,
                targetId,
                nodeId = Node.getId(this.nodeData),
                otherId = data[0].data.nodeid;

            // delete the edge from the nodeEdges
            this.nodeEdges.forEach(function (edge, i) {

                sourceId = Node.getId(edge.source);
                targetId = Node.getId(edge.target);

                if (nodeId == sourceId && otherId == targetId ||
                    nodeId == targetId && otherId == sourceId) {

                    this.nodeEdges.splice(i, 1);
                    $(this.kernel).trigger(EdgeEvent.DESTROY, [edge.source, edge.target]);
                }
            }, this);
        },

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

        /**
         * Show the edge in the list
         */
        handleEdgeCreated: function (event, edge, source, target) {

            // TODO make nice check or remove event handlers
            if (!this.nodeData || (this.nodeData._id !== source._id && this.nodeData._id !== target._id)) {
                return;
            }

            this.edgeList.add(this.parseEdge({
                _id:    edge._id,
                source: source,
                target: target
            }));

            this.nodeEdges.push(edge);
        },

        /**
         * Show the edge in the list
         */
        handleEdgeDestroyed: function (event, edge) {

            var source = edge.source,
                target = edge.target,
                edgeData;

            this.nodeEdges = _.reject(this.nodeEdges, function (e) {
                return e.source._id === source._id && e.target._id === target._id;
            });

            // very nasty stuff here
            this.edgeList.clear();
            edgeData = _.map(this.nodeEdges, this.parseEdge, this);
            this.edgeList.set(edgeData);
        },

        handleEdgeElementClicked: function (event, element, item) {

            console.log('Node edit edge element clicked');
            console.log(element);
            console.log(item);

            /* doesn't work yet
            // TODO use actual Update class here
            var edges = this.keyEdgesByNode(),
                update = {};


            if (element.class === 'edge-direction') {
                if (element.value === '<--') {
                    update['direction'] = 'from';
                } else if (element.value === '-->') {
                    update['direction'] = 'to';
                }
            }

            $(this.kernel).trigger(EdgeEvent.UPDATE, [edge, update]);
            */
        },

        handleFocusout: function (event) {

            if (!this.nodeData) {
                return;
            }

            // check if we're updating property or label
            if ($(event.currentTarget).hasClass('node-label-value')) {
                var label = $(event.currentTarget).val();
                this.updateLabels(label);
            } else {
                this.updateProperties();
            }
        },

        /**
         * We have to know about the nodes in the graph for use in the typeahead
         */
        handleGraphLoaded: function (event, nodes, edges) {

            console.log('EDIT PANEL GRAPH LOADED');
            console.log(nodes);
            console.log(edges);

            this.nodes = nodes;
            this.edges = edges;
            // this.bloodhound.initialize();
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
};


},{}],7:[function(require,module,exports){
/**
 * This file is part of the Nodium core package
 *
 * (c) Niko van Meurs & Sid Mijnders
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/**
 * @author Niko van Meurs <nikovanmeurs@gmail.com>
 * @author Sid Mijnders
 */
module.exports = function (Nodium, $, _, undefined) {

    'use strict';

    var ui          = Nodium.ui,
        Event       = Nodium.event.Event,
        NodeEvent   = Nodium.event.NodeEvent,
        _defaults   = {};

    ui.NodeExplorerPanel = Nodium.createClass(ui.UIPanel, {

        construct: function (selector, options, kernel) {

        	this.initialize(selector, kernel);
        	this.options = $.extend({}, _defaults, options);
            this.name = 'Graph Explorer';
            this.icon = 'icon-globe';
        },

        init: function (container) {

            $(container).on('menu-collapse', this.handleMenuCollapse.bind(this));

            return this;
        },

        show: function () {

            this.super('show');

            $(this.kernel).trigger('mode-change', 'explorer');
        }
    });
};
},{}],8:[function(require,module,exports){
/**
 * This file is part of the Nodium core package
 *
 * (c) Niko van Meurs & Sid Mijnders
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/**
 * @author Niko van Meurs <nikovanmeurs@gmail.com>
 * @author Sid Mijnders
 */
module.exports = function (Nodium, $, _, undefined) {

    'use strict';

    var ui          = Nodium.ui,
        util        = Nodium.util,
        Event       = Nodium.event.Event,
        NodeEvent   = Nodium.event.NodeEvent,
        _defaults   = {};

    ui.NodeFilterPanel = Nodium.createClass(ui.UIPanel, {

        construct: function (selector, options, kernel) {

            this.options = $.extend({}, _defaults, options);
            this.view = $(selector);
            this.name = 'Node Filter';
            this.icon = 'icon-filter';
            this.kernel = kernel;
        },

        init: function (container) {

            var filterUnsetHandler   = _.bind(this.handleFilterUnset, this),
                // filterChangeHandler  = _.bind(this.handleFilterChange, this),
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

                listItemHTML = util.createFromPrototype(nodesList, {
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
};

},{}],9:[function(require,module,exports){
/**
 * This file is part of the Nodium core package
 *
 * (c) Niko van Meurs & Sid Mijnders
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/**
 * @author Niko van Meurs <nikovanmeurs@gmail.com>
 * @author Sid Mijnders
 */
module.exports = function (Nodium, $, undefined) {

    'use strict';

    var ui          = Nodium.ui,
        util        = Nodium.util,
        _defaults   = {
            expanded: false
        };

    ui.PanelContainer = Nodium.createClass({

        construct: function (selector, options) {

            this.options = $.extend({}, _defaults, options);
            this.view = $(selector);
            this.panels = {};
            this.isExpanded = this.options.expanded;

            $(window).on('keydown', this.handleKeyDown.bind(this));

            $(this.view)
                .on('panel-show', '.panel', this.handlePanelShow.bind(this))
                .on('panel-hide', '.panel', this.handlePanelHide.bind(this));

            $('.panel-navigation', this.view)
                .on('click', 'button', this.handleMenuButtonClicked.bind(this));

            return this;
        },

        destroy: function () {

        },

        addPanel: function (panel) {

            this.createMenuItem(panel.icon);
            this.panels[panel.icon] = panel;

            panel.init(this);

            return this;
        },

        removePanel: function (panel) {
            var index = this.panels.indexOf(panel);

            if (index === -1) {
                throw new Error('Could not remove panel.');
                return;
            }

            this.panels.splice(index, 1);
            $('.panel-navigation .' + panel.icon, this.view).remove();

            panel.destroy();

            return this;
        },

        expand: function (icon) {
            // $(this).trigger('expand', []);
            this.visiblePanel = icon;
            this.panels[icon].show();

            if (!this.isExpanded) {
                this.view.addClass('expanded');
            }

            this.isExpanded = true;
        },

        collapse: function () {

            if (this.isExpanded) {
                this.view.removeClass('expanded');
                $(this).trigger('menu-collapse');
            }

            this.isExpanded = false;
        },

        createMenuItem: function (icon) {

            var menu = $('.panel-navigation', this.view),
                menuItem;

            menuItem = util.createFromPrototype(menu, {
                icon: icon
            });

            menu.append(menuItem);
        },

        /**
         * Event Handlers
         */

        handleKeyDown: function (event) {

            if (event.keyCode === 27) {
                this.collapse();
            }
        },

        handleMenuButtonClicked: function (event) {

            this.expand(event.currentTarget.className);
        },

        handlePanelShow: function (event, panel) {

            if (!this.isExpanded) {
                this.expand(panel.icon);
                // this.panels[this.visiblePanel].hide();
            }

            // this.expand(panel.icon);
        },

        handlePanelHide: function (event, panel) {

            if (this.isExpanded) {
                this.collapse();
                // this.panels[this.visiblePanel].hide();
            }

            // this.expand(panel.icon);
        }
    });
};
},{}],10:[function(require,module,exports){
/**
 * This file is part of the Nodium core package
 *
 * (c) Niko van Meurs & Sid Mijnders
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/**
 * @author Niko van Meurs <nikovanmeurs@gmail.com>
 * @author Sid Mijnders
 */
module.exports = function (Nodium, $, undefined){

    'use strict';

    var ui          = Nodium.ui,
        EventAware  = Nodium.event.EventAware;

    ui.UIElement = Nodium.createClass(EventAware, {

        initialize: function (selector, kernel) {   

            this.view   = $(selector);
            this.kernel = kernel;
        },

        resolveSelector: function (selector) {

            if (selector) {
                return this.view.find(selector);
            }
            
            return this.view;
        }
    });
};

},{}],11:[function(require,module,exports){
/**
 * This file is part of the Nodium core package
 *
 * (c) Niko van Meurs & Sid Mijnders
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/**
 * @author Niko van Meurs <nikovanmeurs@gmail.com>
 * @author Sid Mijnders
 */
module.exports = function (Nodium, $, undefined) {

'use strict';

    var ui          = Nodium.ui;

    /**
     * @constructor
     */
    ui.UIPanel = Nodium.createClass(ui.UIElement, {

        destroy: function () {
            this.view.remove();
        },

        hide: function () {

            this.isVisible = false;
            this.view.removeClass('active');
        },

        show: function () {
            this.isVisible = true;
            this.view.addClass('active');
        },

        super: Nodium.util.super,

        /**
         * Event handlers
         */
        handleMenuCollapse: function (event) {

            if (this.isVisible) {
                this.hide();
            }
        }
    });
};

},{}]},{},[1]);
