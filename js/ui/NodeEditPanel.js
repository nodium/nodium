(function(window, $, undefined) {
	'use strict';

	var ui = window.setNamespace('app.ui'),
		NodeEditPanel,
		_defaults;

	NodeEditPanel = function (selector, options) {

		if (false === (this instanceof NodeEditPanel)) {
			return new NodeEditPanel(arguments);
		}

		this.options = $.extend({}, _defaults, options);
		this.view = $(selector);
		this.name = 'Node Editor';
		this.icon = 'icon-pencil';
	};

	NodeEditPanel.prototype.init = function (container) {

		var collapseHandler = window.curry(this.handleCollapse, this),
			nodeSelectedHandler = window.curry(this.handleNodeSelected, this);

		$(container).on('menu-collapse', collapseHandler);
		$(window).on('node-selected', nodeSelectedHandler);

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

		this.isVisible = true;
		this.view.addClass('active');

		$(this).trigger('panel-show');
	};

	NodeEditPanel.prototype.setData = function (node, data) {

		var propertiesList = $('#node-fields', this.view),
			fieldHTML,
			fieldName,
			titleField = this.getNodeTitleKey();

		// set and focus the title field
		var value = data[titleField] || '';

		$('#node-title', this.view)
			.val(value)
			.focus();
		// if (data.hasOwnProperty(titleField)) {
		// 	$('#node-title').val(data[titleField]);
		// }
		// $('#node-title').focus();

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

			// fieldHTML = fieldPrototype
			// 	.replace(/__field__/g, fieldName)
			// 	.replace(/__value__/, data[fieldName])
			// 	.replace(/__rows__/, 1);
			propertiesList.append(fieldHTML);
		}
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

		this.setData(node, data);
	};

	ui.NodeEditPanel = NodeEditPanel;

}(window, window.jQuery));