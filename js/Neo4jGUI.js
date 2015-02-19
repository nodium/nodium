(function (window, undefined) {

'use strict';

var $             = Nodium.context.jQuery,
    d3            = Nodium.context.d3,
    _             = Nodium.context._,
    api           = Nodium.api,
    graph         = Nodium.graph,
    modules       = Nodium.modules,
    transformer   = Nodium.transformer,
    ui            = Nodium.ui,
    animations    = Nodium.graph.animations,
    Node          = Nodium.model.Node,
    NodeEvent     = Nodium.event.NodeEvent,
    DragEvent     = Nodium.event.DragEvent,
    HoldEvent     = Nodium.event.HoldEvent,
    KeyboardEvent = Nodium.event.KeyboardEvent,
    self;

/**
 * A generic neo4j user interface
 */
window.Neo4jGUI = Nodium.createClass(graph.Graph, {

    construct: function (selector, kernel) {

        self = this;
        this.mode = '';

        this.api = new api.Neo4jAPI();

        // centralized module initialization and configuration

        this
        .register(new modules.Zoomable({
            doubleclick: false
        }))
        .register(new modules.Selectable(), [
            ['node-clicked', 'handleNodeSelect'],
            [NodeEvent.CREATED, 'handleNodeSelect'],
            [NodeEvent.SELECTED, 'Nodium.graph.graphics.handleClassNode', 'selected'],
            [NodeEvent.UNSELECTED, 'Nodium.graph.graphics.handleUnclassNode', 'selected'],
            [NodeEvent.DESTROYED, 'handleNodeUnselect']
        ])
        .register(new modules.NodeCRUD({
            properties: {
                status: 'accepted'
            },
            labels: ['yo'] // TODO make api store label using new transactional cypher
        }), [
            // [HoldEvent.DRAGDOWN, 'handleNodeDestroy'],
            // [HoldEvent.DRAGUP, 'handleCreateChildNode'],
            [HoldEvent.CANVAS, 'handleNodeCreate']
        ])
        .register(new modules.EdgeCRUD(), [
            [DragEvent.END, 'handleLinking']
        ])
        .register(new modules.Holdable({
            'duration': 500
        }),[['mouse-down', 'handleHoldStart'],
            [DragEvent.DRAG, 'handleHoldDrag'],
            [DragEvent.END, 'handleHoldEnd'],
            ['mouse-up', 'handleHoldEnd'],
            [DragEvent.END, 'Nodium.graph.graphics.handleNodeScale', 1],
            [HoldEvent.NODE, 'Nodium.graph.graphics.handleNodeScale', 1.3]
            // [HoldEvent.NODE, 'Nodium.graph.graphics.handleNodeColor', '#ffcc00'],
        ])
        .register(new modules.Pinnable(), [
            [HoldEvent.DRAGUP, 'handleNodePinned']
        ])
        .register(new modules.Hyperlinkable(), [
            [HoldEvent.DRAGDOWN, 'handleFollowLink']
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
        .register(new modules.Shapable({
            defaultValue: 'hexagon',
            paths: {
                tri: 'M150 0 L75 200 L225 200 Z'
            },
            shapes: {
                tri: ['star', 5, 5]
            },
            labels: {
                square: 'square',
                circle: 'circle',
                diamond: 'diamond',
                tri: 'tri',
                hex: 'hexagon',
                star: 'star'
            },
            properties: {
                status: {
                    accepted: 'circle',
                    denied: 'diamond'
                }
            }
        }), [
            [NodeEvent.DRAWN, 'handleShapeNodes'],
            [NodeEvent.UPDATED, 'handleShapeNodes']
        ])
        .register(this.api)
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
        var keyDownHandler = _.bind(this.handleKeyDown, this);
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
        .theta(1)
        .gravity(0.005)
        .charge(-2000)
        .chargeDistance(1500)
        // .linkDistance(function (data) {
        //     return self.getLinkDistance(data);
        // })
        .linkDistance(function (data) {
            var mod = Math.sqrt((data.source.weight-1)*(data.target.weight-1));
            var mod2 = Math.pow(mod, 2) / 40;
            return self.getLinkDistance(data) * (1+mod2);
        })
        .size([10000, 10000])
        .nodes(this.nodes)
        .links(this.edges)
        .linkStrength(function (data) {
            var mod = Math.sqrt((data.source.weight-1)*(data.target.weight-1));
            var mod2 = Math.pow(mod, 2) / 40;
            return 1 / (1+mod2);
        })

        return force;
    },

    getLinkDistance: function (linkData) {
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
        this.api.get(_.bind(this.handleGraphData, this));
    },

    // getVisibleNodes: function () {
    //     var nodes = [],
    //         i,
    //         node;

    //     for (i = 0; i < this.nodes.length; i++) {
    //         node = this.nodes[i];
    //         if (!Node.hasPropertyWithValue(node, 'status', 'denied')) {
    //             nodes.push(node);
    //         }
    //     }

    //     return nodes;
    // },

    // getVisibleLinks: function () {
    //     var edges = [],
    //         i,
    //         edge;

    //     for (i = 0; i < this.edges.length; i++) {
    //         edge = this.edges[i];
    //         if (!Node.hasPropertyWithValue(edge.source, 'status', 'denied') &&
    //             !Node.hasPropertyWithValue(edge.target, 'status', 'denied')) {
                
    //             edges.push(edge);
    //         }
    //     }

    //     return edges;
    // },

    getLinkClassValue: function (data) {

        var value = 'link';

        if (data.type) {
            value += ' ' + data.type.toLowerCase() + '-link';
        }

        return value;
    },

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
        } else if (event.keyCode === 13) {
            // event.preventDefault();
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
            case 'filter':
                eventType = NodeEvent.FILTER_UNSET;
                break;
            default: // try to unselect by default
                eventType = NodeEvent.UNSELECT;
                break;
        }

        $(this.kernel).trigger(eventType);
        this.mode = '';
    }
});

}(window));
