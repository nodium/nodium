(function (window, $, undefined) {

    'use strict';

    var ui = window.setNamespace('app.ui'),
        PanelContainer,
        _defaults = {};

    PanelContainer = function (selector, options) {

        if (false === (this instanceof PanelContainer)) {
            return new PanelContainer(arguments);
        }

        $.extend({}, _defaults, options);

        this.view = $(selector);
    };

    PanelContainer.prototype.init = function () {
        this.panels = {};

        var menuClickHandler = window.curry(this.handleMenuButtonClicked, this);
        $('.panel-navigation', this.view).on('click', 'button', menuClickHandler);

        var keyDownHandler = window.curry(this.handleKeyDown, this);
        $(window).on('keydown', keyDownHandler);

        return this;
    };

    PanelContainer.prototype.destroy = function () {

    };

    PanelContainer.prototype.addPanel = function (panel) {

        this.createMenuItem(panel.icon);
        this.panels[panel.icon] = panel;

        panel.init(this);

        return this;
    };

    PanelContainer.prototype.removePanel = function (panel) {
        var index = this.panels.indexOf(panel);

        if (index === -1) {
            throw new Error('Could not remove panel.');
            return;
        }

        this.panels.splice(index, 1);
        $('.panel-navigation .' + panel.icon, this.view).remove();

        panel.destroy();

        return this;
    };

    PanelContainer.prototype.expand = function (icon) {
        // $(this).trigger('expand', []);
        this.panels[icon].show();
        this.view.addClass('expanded');
    };

    PanelContainer.prototype.collapse = function () {

        this.view.removeClass('expanded');
        $(this).trigger('menu-collapse');
    };

    PanelContainer.prototype.createMenuItem = function (icon) {

        var menu = $('.panel-navigation', this.view),
            menuItem;

        menuItem = window.createFromPrototype(menu, {
            icon: icon
        });

        menu.append(menuItem);
    };

    /**
     * Event Handlers
     */

    PanelContainer.prototype.handleMenuButtonClicked = function (event) {

        this.expand(event.currentTarget.className);
    };

    PanelContainer.prototype.handleKeyDown = function (event) {

        if (event.keyCode === 27) {
            this.collapse();
        }
    };

    ui.PanelContainer = PanelContainer;

}(window, window.jQuery));