(function (window, $, d3, undefined) {

'use strict';

var app           = window.setNamespace('app'),
    graph         = window.setNamespace('app.graph'),
    modules       = window.setNamespace('app.modules'),
    transformer   = window.setNamespace('app.transformer'),
    ui            = window.setNamespace('app.ui'),
    animations    = window.setNamespace('app.graph.animations'),
    NodeEvent     = window.use('app.event.NodeEvent'),
    DragEvent     = window.use('app.event.DragEvent'),
    HoldEvent     = window.use('app.event.HoldEvent'),
    KeyboardEvent = window.use('app.event.KeyboardEvent');

/**
 * A generic neo4j user interface
 */
graph.Neo4jGUI = app.createClass(graph.Graph, {

    construct: function (selector, kernel) {

        var self = this;
        this.mode = '';

        this.api = new graph.API();

        // centralized module initialization and configuration

        this
        .register(new modules.Zoomable({
            doubleclick: false
        }))
        .register(new modules.Selectable(), [
            ['node-clicked', 'handleNodeSelect'],
            [NodeEvent.SELECTED, 'app.graph.graphics.handleClassNode', 'selected'],
            [NodeEvent.UNSELECTED, 'app.graph.graphics.handleUnclassNode', 'selected'],
            [NodeEvent.DESTROYED, 'handleNodeUnselect']
        ])
        .register(new modules.NodeCRUD(), [
            [HoldEvent.DRAGDOWN, 'handleNodeDestroy'],
            // [HoldEvent.DRAGUP, 'handleCreateChildNode'],
            [HoldEvent.CANVAS, 'handleNodeCreate']
        ])
        // .register(new modules.EdgeCRUD(), [
        //     [DragEvent.END, 'handleLinking']
        // ])
        // CRM
        .register(new modules.CRMEdgeCRUD({
            modes: {
                LINK: 'LINK',
                SYNONYM: 'SYNONYM',
                INFLUENCE: 'INFLUENCE'
            }
        }), [
            [DragEvent.END, 'handleLinking']
        ])
        .register(new modules.Holdable({
            'duration': 500
        }),[['mouse-down', 'handleHoldStart'],
            [DragEvent.DRAG, 'handleHoldDrag'],
            [DragEvent.END, 'handleHoldEnd'],
            ['mouse-up', 'handleHoldEnd'],
            [DragEvent.END, 'app.graph.graphics.handleNodeScale', 1],
            [HoldEvent.NODE, 'app.graph.graphics.handleNodeScale', 1.3],
            // [HoldEvent.NODE, 'app.graph.graphics.handleNodeColor', '#ffcc00'],
        ])
        .register(new modules.Pinnable(), [
            [HoldEvent.DRAGUP, 'handleNodePinned']
        ])
        .register(new modules.Filterable(), [
            [NodeEvent.DRAWN, 'handleNodeDrawn'],
            [NodeEvent.FILTER, 'handleNodeFilter'],
            [NodeEvent.FILTER_UNSET, 'handleNodeFilterUnset']
        ])
        .register(new modules.Validatable(), [
            [HoldEvent.DRAGLEFT, 'handleDenyNode'],
            [HoldEvent.DRAGRIGHT, 'handleAcceptNode']
        ])
        // .register(new modules.Colorable({
        //     labels: {
        //         test: '#cccc66'
        //     },
        //     properties: {
        //         status: {
        //             'accepted': '#5cc6b8',
        //             'denied': '#e97777'
        //         }
        //     }
        // }), [
        //     [NodeEvent.DRAWN, 'handleColorNodes'],
        //     [NodeEvent.UPDATED, 'handleColorNodes'],
        //     [NodeEvent.UPDATEDLABEL, 'handleColorNodes']
        // ])
        .register(new modules.Classable({
            properties: {
                status: {
                    'accepted': 'accepted',
                    'denied': 'denied'
                }
            }
        }), [
            [NodeEvent.DRAWN, 'handleClassNodes'],
            [NodeEvent.UPDATED, 'handleClassNodes']
        ])
        .register(this.api)
        // TODO event flow:
        // - handleNodeStyled should be able to check if one of the values was changed
        // - pinnable storable should check if fixed == true before updating
        .register(new modules.Storable({
			storables: {
				pinnable: ['fixed', 'x', 'y', 'px', 'py']
			}
		}), [
			['node-pinned', 'handleNodeStyled'],
			[DragEvent.END, 'handleNodeStyled']
		]);

        // initialize transformers
        new transformer.Neo4jTransformer({
            map: {
                __nodestyle: '_style'
            }
        });

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

    createForce: function () {

        var self = this,
            force,
            tickHandler;

        force = d3.layout.force()
        .gravity(0.005)
        .charge(-2000)
        .chargeDistance(1500)
        .linkDistance(function (data) {
            return self.getLinkDistance(data);
        })
        .size([10000, 10000])
        .nodes(this.nodes)
        .links(this.edges)
        .linkStrength(function (data) {
            return 1;
        })

        return force;
    },

    getLinkDistance: function (linkData){
        var distance = 150,
            r1,
            r2;

        if(linkData.source.r && linkData.target.r) {
            distance += (linkData.source.r + linkData.target.r );
        } else {
            r1 = this.getNodeRadius(linkData.source);
            r2 = this.getNodeRadius(linkData.target);

            distance += (r1 + r2);
        }
        
        return distance;
    },

    getGraphData: function () {
        this.api.get(window.curry(this.handleGraphData, this));
    },

    // CRM
    getLinkClassValue: function (data) {

        var value = 'link';

        if (data.type) {
            value += ' ' + data.type.toLowerCase() + '-link';
        }

        return value;
    },

    // CRM
    drawLinkEnter: function (linkEnter) {

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