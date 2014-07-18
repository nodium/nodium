(function(window, $, undefined) {
	'use strict';

	var ui = window.setNamespace('app.ui'),
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
			nodeUnselectedHandler = window.curry(this.handleNodeUnselected, this);

		$(container).on('menu-collapse', collapseHandler);
		$(this.graph).on('node-selected', nodeSelectedHandler);
		$(this.graph).on('node-unselected', nodeUnselectedHandler);

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

		window.setTimeout(function () {
			titleField.focus()
		}, 200);
	};

	NodeEditPanel.prototype.setData = function (data) {

		var propertiesList = $('#node-fields', this.view),
			fieldHTML,
			fieldName,
			titleField = this.graph.getNodeTitleKey();

		// set and focus the title field
		var value = data[titleField] || '';

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