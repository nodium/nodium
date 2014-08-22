(function (window, $, undefined) {

'use strict';

var ui      = window.setNamespace('app.ui'),
    app     = window.use('app'),
    _defaults = {
        expanded: false
    };

ui.PanelContainer = app.createClass({

    construct: function (selector, options) {

        this.options = $.extend({}, _defaults, options);

        console.log(selector);
        console.log(arguments);

        this.view = $(selector);
    },

    init: function () {
        this.panels = {};
        this.isExpanded = this.options.expanded;

        var menuClickHandler = window.curry(this.handleMenuButtonClicked, this);
        $('.panel-navigation', this.view).on('click', 'button', menuClickHandler);

        var keyDownHandler = window.curry(this.handleKeyDown, this);
        $(window).on('keydown', keyDownHandler);

        var showHandler = window.curry(this.handlePanelShow, this);
        $(this.view).on('panel-show', '.panel', showHandler);

        var hideHandler = window.curry(this.handlePanelHide, this);
        $(this.view).on('panel-hide', '.panel', hideHandler);

        return this;
    },

    destroy: function () {

    },

    addPanel: function (panel) {

        console.log(this);

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

        console.log(menu);

        menuItem = window.createFromPrototype(menu, {
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

}(window, window.jQuery));