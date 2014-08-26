(function (window, $, d3, undefined) {

'use strict';

var app        = window.setNamespace('app'),
    graph      = window.setNamespace('app.graph'),
    modules    = window.setNamespace('app.modules'),
    ui         = window.setNamespace('app.ui'),
    animations = window.setNamespace('app.graph.animations'),
    NodeEvent  = window.use('app.event.NodeEvent');

/**
 * A generic neo4j user interface
 */
graph.Neo4jGUI = app.createClass(graph.Graph, {

    construct: function (selector) {

        var self = this;

        this.selector = selector;
        this.mode = '';
        this.kernel = this;

        this.api = new graph.API({
			special: {
				__nodestyle: '_style'
			}
		});

        // here we put the actual linking of traits to events
        // so that the traits contain only the logic and are kept generic

        this
        .register(new modules.Zoomable({
            doubleclick: false
        }))
        .register(new graph.NodeCD(), [
            ['node-clicked', 'handleNodeSelect'],
            [NodeEvent.SELECTED, 'app.graph.graphics.handleNodeSelected'],
            [NodeEvent.UNSELECTED, 'app.graph.graphics.handleNodeUnselected'],
            [NodeEvent.DESTROYED, 'handleNodeUnselect'],
            ['drag-down', 'handleNodeDestroy'],
            ['drag-up', 'handleCreateChildNode'],
            ['holding-canvas', 'handleCanvasHold']
        ])
        // .register(new modules.EdgeCRUD(), [
        //     ['drag-end', 'handleLinking']
        // ])
        // CRM
        .register(new modules.CRMEdgeCRUD({
            modes: {
                LINK: 'LINK',
                SYNONYM: 'SYNONYM',
                INFLUENCE: 'INFLUENCE'
            }
        }), [
            ['drag-end', 'handleLinking']
        ])
        .register(new graph.Holdable({
            'duration': 500
        }),[['mouse-down', 'handleHoldStart'],
            ['drag', 'handleHoldDrag'],
            ['drag-end', 'handleHoldEnd'],
            ['mouse-up', 'handleHoldEnd'],
            ['drag-end', 'app.graph.graphics.handleNodeScale', 1],
            ['holding-node', 'app.graph.graphics.handleNodeScale', 1.3],
        ])
        .register(new graph.Pinnable(), [
            ['drag-right', 'handleNodePinned']
        ])
        .register(new graph.Filterable(), [
            [NodeEvent.DRAWN, 'handleNodeDrawn'],
            [NodeEvent.FILTER, 'handleNodeFilter'],
            [NodeEvent.FILTER_UNSET, 'handleNodeFilterUnset']
        ])
        .register(new graph.Colorable({
            labels: {
                test: '#cccc66'
            }
        }), [
            [NodeEvent.DRAWN, 'handleColorNodes'],
            [NodeEvent.UPDATEDLABEL, 'handleColorNode']
        ])
        .register(this.api)
        .register(new graph.Stylable({
			key: '__nodestyle',
			styles: {
				pinnable: ['fixed', 'x', 'y', 'px', 'py']
			}
		}), [
			['node-pinned', 'handleNodeStyled'],
			['drag-end', 'handleNodeStyled']
		]);

        // ui
        this
        .register(new ui.EdgeModePanel({}, '#edit-mode'));

        // UI handlers that initiate an action event
        var keyDownHandler = window.curry(this.handleKeyDown, this);
        $(window).on('keydown', keyDownHandler);

        $(this)
            .on('mode-change', this.handleModeChange.bind(this))
            .on(KeyboardEvent.ESCAPE, this.handleEscapeKey.bind(this));


        // mouse events
        d3.select(this.selector).select('.graph-content')
        .on('mousedown', function () {
            var position = d3.mouse(this);
            $(self.kernel).trigger('mouse-down', [undefined, undefined, { x: position[0], y: position[1] }]);
        })
        .on('mouseup', function () {
            var position = d3.mouse(this);
            $(self.kernel).trigger('mouse-up', [undefined, undefined, { x: position[0], y: position[1] }]);
        });

        this.initialize();
    },

    getGraphData: function () {
        this.api.get(window.curry(this.handleGraphData, this), this.addNodeMetadata);
    },

    // CRM
    getLinkClassValue: function (data) {

        console.log("getting link class value");
        var value = 'link';

        if (data.type) {
            value += ' ' + data.type.toLowerCase() + '-link';
        }

        return value;
    },

    // CRM
    drawLinkEnter: function (linkEnter) {

        console.log("ehehehee");
        var proto = Object.getPrototypeOf(Object.getPrototypeOf(this));
        proto.drawLinkEnter.call(this, linkEnter);

        linkEnter.attr("marker-mid", function (data) {
            var linkType = null;
            if (data.type) {
                linkType = data.type.toUpperCase();
            }

            if (linkType === 'INFLUENCE') {
                return 'url(#influence-arrow)';
            } else if (linkType === 'SYNONYM') {
                return 'url(#synonym-arrow)';
            } else {
                return 'url(#arrow)';
            }
        });
    },

    handleKeyDown: function (event) {

        if (event.keyCode === 27) {
            $(this).trigger(KeyboardEvent.ESCAPE);
        } else if (event.keyCode === 70 && (event.ctrlKey || event.metaKey)) {
            console.log('ctrl+f');
        } else if (event.keyCode === 90 && (event.ctrlKey || event.metaKey)) {
            console.log("ctrl+z");
        } else if (event.keyCode === 78 && (event.ctrlKey || event.metaKey)) {

            event.preventDefault();
            event.stopPropagation();

            console.log('ctrl+n');
            $(this).trigger(NodeEvent.CREATE);
        }
    },

    handleModeChange: function (event, mode) {
        this.mode = mode;
    },

    handleEscapeKey: function (event) {

        var eventType;

        console.log(this.mode);

        switch (this.mode) {
            case 'select':
                eventType = NodeEvent.UNSELECT;
                break;
            case 'filter':
                eventType = NodeEvent.FILTER_UNSET;
                break;
            default: // do nothing
                return;
        }

        $(this).trigger(eventType);
        this.mode = '';
    }
});

}(window, jQuery, d3));