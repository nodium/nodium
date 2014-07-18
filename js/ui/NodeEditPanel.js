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

		collapseHandler = window.curry(this.handleCollapse, this);
		$(container).on('collapse', collapseHandler);

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
	};

	/**
	 * Event handlers
	 */

	NodeEditPanel.prototype.handleCollapse = function (event) {


		if (this.isVisible) {
			this.hide();
		}
	}

	ui.NodeEditPanel = NodeEditPanel;

}(window, window.jQuery));