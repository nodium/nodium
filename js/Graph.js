(function (context, $, d3, _, undefined) {

'use strict';

var graph       = context.setNamespace('app.graph'),
    event       = context.use('app.event'),
    app         = context.use('app'),
    NodeEvent   = context.use('app.event.NodeEvent'),
    DragEvent   = context.use('app.event.DragEvent'),
    HoldEvent   = context.use('app.event.HoldEvent'),
    self;

graph.Graph = app.createClass({

    construct: function (selector, kernel) {

        // if (!selector) throw 'No selector passed to graph';
        this.selector = selector;

        this.kernel = kernel || new event.Kernel();

        // to distinguish between node and canvas drags e.a.
        // TODO to Draggable module
        this.draggedNode = null;
        this.dragging = false;
        this.dragDirection = 0;

        // the node that is being hovered
        // needed for drag starts
        // TODO try to move to hoverable?
        this.hoveredNode = null;

        this.visibleNodes = null;
        this.visibleEdges = null;

        this.options = {
            shapes: {
                generator: 'symbol'
            }
        }

        self = this;
    },

    /**
     * Register a module to this graph and its kernel
     */
    register: function (module, events) {

        module.graph = this;

        this.kernel.register(module, events);

        return this;
    },

    /*
     * Graph initialization and utility functions
     */

    /**
     * Get the data from the graph html and clear it
     */
    getGraphData: function () {

        var graphData = $(this.selector).data('graph');
        $(this.selector).attr('data-graph', null);

        this.handleGraphData(graphData);
    },

    /**
     * asynchronous callback function incase of database call
     * expects a graph object with nodes and edges properties
     */
    handleGraphData: function (graphData) {

        var tickHandler;

        this.nodes = graphData.nodes || [];
        this.edges = graphData.edges || [];

        // draw the graph
        this.force = this.createForce();
        this.force.start();
        this.drawLinks();
        this.drawNodes();

        // NOTE: handleTick currently is dependent on this.node initialized in drawNodes()
        tickHandler = _.bind(this.handleTick, this);
        this.force.on('tick', tickHandler);

        this.handleWindowResize();

        $(this.kernel).trigger(NodeEvent.LOADED, [this.nodes, this.edges]);
    },

    createForce: function () {

        var force,
            tickHandler;

        force = d3.layout.force()
        .charge(-2500)
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

    /**
     * Add event handlers in this method
     */
    initialize: function () {

        // put in resizable module?
        var windowResizeHandler = _.bind(this.handleWindowResize, this);
        $(context).on('resize', windowResizeHandler);

        // initialize the viewport translation and scale
        this.initializeViewport();

        this.getGraphData();
    },

    initializeViewport: function () {
        d3.select(this.selector + ' .graph-viewport')
            .attr('transform', function (data) {

                var scale = 0.2,
                    translate = "-220, -700",
                    prototype = 'translate(__translate__) scale(__scale__)',
                    transform = prototype
                        .replace(/__translate__/g, translate)
                        .replace(/__scale__/g, scale)
                ;

                return transform;
            });
    },

    getNodeRadius: function (data) {
        return 25;
    },

    getLinkDistance: function (linkData){
        var distance = 50,
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

    /**
     * Example events object with all the events we've used so far
     */
    getEventsObject: function () {

        var eventsObject = {
            'dragstart': _.partial(this.handleNodeDragStart, this),
            'drag': _.partial(this.handleNodeDrag, this),
            'dragend': _.partial(this.handleNodeDragEnd, this),
            'mouseover': _.partial(this.handleMouseOver, this),
            'mouseout': _.partial(this.handleMouseOut, this),
            'click': _.partial(this.handleMouseClick, this),
            'mouseup': _.partial(this.handleMouseUp, this),
            'mousedown': _.partial(this.handleMouseDown, this)
        };

        return eventsObject;
    },

    getNodeClassValue: function (data) {
        return "node";
    },

    getLinkClassValue: function (data) {
        return "link";
    },


    /*
     * Drawing the graph
     */

    /*
     * Drawing the nodes
     */

    getVisibleNodes: function () {
        return this.nodes;
    },

    /**
     * Removes all nodes and redraws them
     */
    redrawNodes: function () {
        d3.select(this.selector + ' .nodes').selectAll('.node').remove();

        this.drawNodes();
    },

    /**
     * Remove and redraw one node
     */
    redrawNode: function (node, data) {

        if (!node && !data) {
            return;
        }

        if (!node && data !== undefined) {
            node = $('.node').get(data.index);
        }

        d3.select(node).remove();
        this.drawNodes();
    },

    drawNodes: function () {

        // in case you only want to draw a subset
        var nodes = this.getVisibleNodes(),
            node = d3.select(this.selector + ' .nodes').selectAll('.node')
                .data(nodes, function (d, i) { 
                    if (d.hasOwnProperty('_id')) {
                        return d._id;
                    } else {
                        return i;
                    }
                }),
            nodeEnter = node.enter().append('g');

        this.drawNodeExit(node.exit());
        this.attachNodeEvents(nodeEnter);
        this.drawNodeEnter(nodeEnter);

        this.node = node;

        return this;
    },

    attachNodeEvents: function (nodeEnter) {
        var eventsObject = this.getEventsObject();

        nodeEnter
            .on('click', eventsObject['click'])
            .on('mouseover', eventsObject['mouseover'])
            .on('mouseout', eventsObject['mouseout'])
            .on('mouseup', eventsObject['mouseup'])
            .on('mousedown', eventsObject['mousedown'])
            .call(d3.behavior.drag()
                .on('dragstart', eventsObject['dragstart'])
                .on('drag', eventsObject['drag'])
                .on('dragend', eventsObject['dragend']));
    },

    getNodeShapeGenerator: function () {

        var generator = this.options.shapes.generator;

        if (generator == 'symbol') {
            return d3.svg.symbol()
                .type('circle')
                .size(function (data) {
                    // note: size is set in square pixels, hence the pow
                    // note2: yeah the formula is nonsense
                    return Math.pow(self.getNodeRadius(data)*Math.PI, 2);
                });
        } else {
            return d3.superformula()
                .type('circle')
                .size(function (data) {
                    // note: size is set in square pixels, hence the pow
                    return Math.pow(self.getNodeRadius(data)*Math.PI, 2);
                })
                .segments(50);
        }
    },

    drawNodeEnter: function (nodeEnter) {

        var shapeGenerator = this.getNodeShapeGenerator();

        nodeEnter.attr('class', function (data) {
            return self.getNodeClassValue(data);
        });

        nodeEnter.append('path')
            .attr('d', function (data, i) {
                var path = shapeGenerator(data, i);

                // store path data in the node for scaling
                // or other transformations
                data._shape = {
                    path: path,
                    scale: {x: 1, y: 1},
                    shape: 'circle'
                };

                return path;
            })
            .attr('class', 'top-circle');

        this.drawNodeTexts(nodeEnter);

        $(this.kernel).trigger(NodeEvent.DRAWN, [nodeEnter]);
    },

    drawNodeExit: function (nodeExit) {
        nodeExit.remove();
    },

    splitNodeText: function (name, treshold) {

        var parts,
            part,
            half,
            halfLength = name.length / 2,
            diffLength;

        treshold = treshold || 10;

        if (!name || name.length < treshold || name === "") {
            return [name];
        }

        parts = name.split(' ');

        half = parts[0];

        for (var i = 1; i < parts.length; i++) {
            part = parts[i];

            // the current difference with half
            diffLength = Math.abs(halfLength - half.length);

            // check if adding the current part still decreases the difference
            if (Math.abs(halfLength - (half.length + part.length + 1)) < diffLength) {
                half += " " + part;
            } else {
                return [half, parts.slice(i).join(' ')];
            }
        }

        return [name];
    },

    getNodeTextDY: function (data, slices) {
        if (slices <= 1) {
            return 5;
        }

        return -3;
    },

    /**
     * Get the text that should be shown on the node from the data
     * Should return null when text not there
     */
    getNodeTitleKey: function (data) {
        return 'name';
    },

    getNodeText: function (data) {
        return data._properties[this.getNodeTitleKey()];
    },

    drawNodeTexts: function (nodeEnter) {

        var self = this,
            textNode = nodeEnter.append('text')
                .attr('text-anchor', 'middle');

        // var textDrawer = _.bind(this.drawNodeText, this);
        // textNode.each(textDrawer);
        textNode.each(function (data) {
            self.drawNodeText.apply(self, [this, data]);
        });
    },

    drawNodeText: function (node, data) {

        var text = this.getNodeText(data),
            textParts = [],
            element = d3.select(node);

        if (!text) {
            return;
        }

        // clear the element
        element.text('');

        textParts = this.splitNodeText(text);

        element.attr('dy', this.getNodeTextDY(data, textParts.length));

        // we have max. 2 text parts
        for (var i = 0; i < textParts.length; i++) {
            var tspan = element.append('tspan').text(textParts[i]);
            if (i > 0) {
                tspan.attr('x', 0).attr('dy', 20);
            }
        }
    },

    setNodeText: function (node, data) {

        var text = $('text', node).get(0);
        // this.drawNodeText.apply(text, [data]);
        this.drawNodeText(text, data);
    },

    /*
     * Drawing the links
     */

    getVisibleLinks: function () {
        return this.edges;
    },

    /**
     * Remove all links and draw everything
     */
    redrawLinks: function () {
        d3.select(this.selector + ' .links').selectAll('.link').remove();

        this.drawLinks();
    },

    drawLinks: function () {

        // in case you only want to draw a subset
        var links = this.getVisibleLinks(),
            link = d3.select(this.selector + ' .links').selectAll('.link')
                .data(links, function (data) {
                    // compute a unique hash to bind the data
                    return data.source.index + '#' + data.target.index + '#' + data.type;
                }),
                linkEnter = link.enter().append('polyline');
            
        this.drawLinkExit(link.exit());
        this.drawLinkEnter(linkEnter);

        this.link = link;

        return this;
    },

    drawLinkEnter: function (linkEnter) {
        linkEnter.attr('class', function (data) {
            return self.getLinkClassValue(data);
        });
    },

    drawLinkExit: function (linkExit) {
        linkExit.remove();
    },

    getNodeFromData: function (data) {

        var nodes;
        
        if (data) {
            // NOTE this won't work if not all nodes are drawn
            // return $('.node').get(data.index);
            return d3.selectAll('.node').filter(function (d) {
                return d.index == data.index;
            }).node();
        }

        return null;
    },

    resolveNode: function (node, data) {
        
        if (node) {
            return node;
        }

        return this.getNodeFromData(data);
    },

    getDataFromNode: function (node) {

        if (node) {
            return d3.select(node).datum();
        }

        return null;
    },

    resolveData: function (node, data) {

        if (data) {
            return data;
        }

        return this.getDataFromNode(node);
    },


    /*
     * Handlers
     */

    /*
     * Mousing
     */

    handleMouseOver: function (graph, data) {

        graph.hoveredNode = {
            data: data,
            node: this
        };
    },

    handleMouseOut: function (graph, data) {

        graph.hoveredNode = null;
    },

    handleMouseClick: function (graph, data) {

        // don't click after a drag event
        if (d3.event.defaultPrevented) {
            return;
        }

        $(graph.kernel).trigger('node-clicked', [this, data]);
    },

    handleMouseDown: function (graph, data) {

        $(graph.kernel).trigger('mouse-down', [this, data]);
    },  

    handleMouseUp: function (graph, data) {

        $(graph.kernel).trigger('mouse-up');
    },  

    /*
     * Dragging
     */

    /**
     * Keep track of data about the drag, such as direction and distance
     */
    updateDragData: function (x, y) {

        var xAbs,
            yAbs,
            distance;
        
        if (!this.draggedNode) {
            return;
        }

        this.xChange = this.xChange + x;
        this.yChange = this.yChange + y;
        xAbs = Math.abs(this.xChange);
        yAbs = Math.abs(this.yChange);
        this.dragDistance = Math.sqrt(Math.pow(xAbs, 2) + Math.pow(yAbs, 2));

        if (this.xChange > 0 && yAbs < xAbs) {
            this.dragDirection = graph.Drag.RIGHT;
        } else if (this.xChange < 0 && yAbs < xAbs) {
            this.dragDirection = graph.Drag.LEFT;
        } else if (this.yChange > 0 && xAbs < yAbs) {
            this.dragDirection = graph.Drag.DOWN;
        } else if (this.yChange < 0 && xAbs < yAbs) {
            this.dragDirection = graph.Drag.UP;
        }
    },

    handleNodeDrag: function (graph, data) {

        // update the distance and direction of the drag
        graph.updateDragData(d3.event.dx, d3.event.dy);

        $(graph.kernel).trigger(d3.event, [this, data]);

        // if (graph.dragging && !d3.event.sourceEvent.defaultPrevented) {
        if (graph.dragDistance != 0 && !graph.holding /* && !d3.event.sourceEvent.defaultPrevented*/) {

        	graph.dragging = true;

            this.style['pointerEvents'] = 'none';
            
            // node drag functionality

            data.px += d3.event.dx;
            data.py += d3.event.dy;

            data.x += d3.event.dx;
            data.y += d3.event.dy;

            // update the visuals while dragging
            graph.handleTick();
        }
    },

    handleNodeDragStart: function (graph, data) {

        console.log('node drag start');
        console.log(graph);
        console.log(this);

        // use d3 event?
        $(graph.kernel).trigger(DragEvent.START, [this, data]);

        // used to stop canvas from dragging too
        d3.event.sourceEvent.stopPropagation();

        graph.xChange = 0;
        graph.yChange = 0;

        // also log the start location of the node
        graph.draggedNode = {
            data: data,
            node: this
        };

        graph.force.stop();
    },

    handleNodeDragEnd: function (graph, data) {

        // use d3 event?
        $(graph.kernel).trigger(DragEvent.END, [this, data]);

        if (graph.dragDistance !== 0) {
            graph.force.resume();
        }

        // clean up
        graph.draggedNode.node.style['pointerEvents'] = 'auto';
        graph.draggedNode = null;
        graph.dragging = false;
        graph.dragDistance = 0;
    },


    /*
     * Other
     */

    handleWindowResize: function (event) {
        var width = $(context).width(),
            height = $(context).height();

        $(this.selector)
            .attr('width', width)
            .attr('height', height);
    },

    handleTick: function () {

        var link = this.link,
            node = this.node;
                
        node.attr('transform', function (data) {

            var translation = 'translate(__x__, __y__)',
                w = 10000,
                h = 10000,
                r = self.getNodeRadius(data) * 2,
                position = {
                    x: Math.max(r, Math.min(w - r, data.x)),
                    y: Math.max(r, Math.min(h - r, data.y))
                };

            data.x = position.x;
            data.y = position.y;

            return translation.replace(/__x__/g, position.x).replace(/__y__/g, position.y);
        });

        if (link) {
            link.attr("points", function (data) {
                return data.source.x + "," + data.source.y + " " + 
                    (data.source.x + data.target.x)/2 + "," +
                    (data.source.y + data.target.y)/2 + " " +
                    data.target.x + "," + data.target.y;
            });
        }
    }
});

/*
 * Constants
 */

graph.Drag = {
    LEFT: 1,
    RIGHT: 2,
    UP: 3,
    DOWN: 4
};


}(this, jQuery, d3, _));
