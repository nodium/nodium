(function(window, $, undefined) {
	'use strict';

	var ui = window.setNamespace('app.ui'),
		NodeEvent = window.use('app.event.NodeEvent'),
		Event = window.use('app.event.Event'),
		NodeEditPanel,
		_defaults;

	NodeEditPanel = function (selector, options, graph) {

		if (false === (this instanceof NodeEditPanel)) {
			return new NodeEditPanel(arguments);
		}

		this.options = $.extend({}, _defaults, options);
		this.view = $(selector);
		this.name = 'Node Editor';
		this.icon = 'icon-pencil';
		this.graph = graph;
	};

	NodeEditPanel.prototype.init = function (container) {

		var collapseHandler = window.curry(this.handleCollapse, this),
			nodeSelectedHandler = window.curry(this.handleNodeSelected, this),
			nodeUnselectedHandler = window.curry(this.handleNodeUnselected, this),
			focusOutHandler = window.curry(this.handleFocusOut, this),
			formSubmitHandler = window.curry(this.handleFormSubmit, this),
			newPropertyButtonClickHandler = window.curry(this.handleNewPropertyButtonClick, this);

		$(container).on('menu-collapse', collapseHandler);
		$(this.graph).on(NodeEvent.SELECT, nodeSelectedHandler);
		$(this.graph).on(NodeEvent.UNSELECT, nodeUnselectedHandler);
		$('#node-form', this.view).on(Event.SUBMIT, formSubmitHandler);
		$('#node-form', this.view).on(Event.FOCUS_OUT, 'textarea' focusOutHandler);
		$('#new-property', this.view).on(Event.CLICK, newPropertyButtonClickHandler);

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
			titleField.focus()
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

	NodeEditPanel.prototype.updateData = function (field) {
		var property,
			value;

		property = $(field).prev().val();
		value = $(field).val();

		this.nodeData[property] = value;

		$(this.graph).trigger(NodeEvent.UPDATE, this.nodeData);
	};

	NodeEditPanel.prototype.setData = function (data) {

		var propertiesList = $('#node-fields', this.view),
			fieldHTML,
			fieldName,
			titleField = this.graph.getNodeTitleKey(),
			value;

		this.nodeData = data;

		// set and focus the title field
		value = data[titleField] || '';

		$('#node-title', this.view)
			.val(value)

		// create the html form elements
		propertiesList.empty();

		for (var i = 0; i < data._fields.length; i++) {
			fieldName = data._fields[i];

			// the title property is rendered differently
			if (fieldName == titleField) {
				continue;
			}

			fieldHTML = window.createFromPrototype(propertiesList, {
				field: fieldName,
				value: data[fieldName],
				rows: 1
			});

			propertiesList.append(fieldHTML);
		}
	};

	NodeEditPanel.prototype.unsetData = function (data) {

		var propertiesList = $('#node-fields', this.view);

		$('#node-title', this.view).val('');

		// create the html form elements
		propertiesList.empty();
	};


	/**
	 * Event handlers
	 */

	NodeEditPanel.prototype.handleCollapse = function (event) {

		if (this.isVisible) {
			this.hide();
		}
	};

	NodeEditPanel.prototype.handleFocusOut = function (event) {

		this.updateData(event.currentTarget);
	};

	NodeEditPanel.prototype.handleFormSubmit = function (event) {

		event.preventDefault();
		event.stopPropagation();

		$(this.graph).trigger(NodeEvent.DESTROY);
		$(this.view).trigger('panel-hide', [this]);
	};

	NodeEditPanel.prototype.handleNewPropertyButtonClick = function (event) {

		event.preventDefault();
		event.stopPropagation();

		console.log('stuff');

		this.createProperty();
	};

	NodeEditPanel.prototype.handleNodeSelected = function (event, node, data) {

		this.setData(data);
		$(this.view).trigger('panel-show', [this]);
		
	};

	NodeEditPanel.prototype.handleNodeUnselected = function (event, node, data) {

		this.unsetData();
		$(this.view).trigger('panel-hide', [this]);
	};

	ui.NodeEditPanel = NodeEditPanel;

}(window, window.jQuery));