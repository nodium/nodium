(function (window, $, d3, Mousetrap, undefined) {

'use strict';

var graph    = window.setNamespace('app.graph');
    app      = window.use('app'),
    graphAPI = graph.api;

graph.GraphEditor = app.createClass({

    construct: function () {

        var dataHandler,
            // filterHandler,
            // filterClearHandler,
            modeChangeHandler,
            skillClickHandler;

        this.selectedNode = null;
        this.editMode = graph.EditModes.MOVE;

        $(window).on('resize', this.handleWindowResize);

        modeChangeHandler = window.curry(this.handleModeChange, this);
        $('#edit-mode > label').watch('class', modeChangeHandler);
        // $('#edit-mode').on('change', 'input[type=radio]', modeChangeHandler);

        nodeHandler = window.curry(this.handleNodeUpdate, this);
        $('#node-submit').on('click', nodeHandler);

        nodeHandler = window.curry(this.handleNodeUpdate, this);
        $('#node-title').on('keydown', nodeHandler);

        filterHandler = window.curry(this.handleFilterInput, this);
        $('#filter-input').on('input', filterHandler);

        filterClearHandler = window.curry(this.handleFilterClear, this);
        $('#filter-clear').on('click', filterClearHandler);

        nodeChangeHandler = window.curry(this.handleNodeChange, this);
        $('#node-form').on('submit', nodeChangeHandler);

        skillClickHandler = window.curry(this.handleSkillClick, this);
        $('#node-list').on('click', 'li', skillClickHandler);

        $('#navigation').on('click', 'label', this.handleNavigationClick);

        Mousetrap.bind(graph.KeyBinding.MOVE, this.handleKeyDown);
        Mousetrap.bind(graph.KeyBinding.OK, this.handleKeyDown);
        Mousetrap.bind(graph.KeyBinding.DENY, this.handleKeyDown);
        Mousetrap.bind(graph.KeyBinding.LINK, this.handleKeyDown);
        Mousetrap.bind(graph.KeyBinding.UNLINK, this.handleKeyDown);
        Mousetrap.bindGlobal(graph.KeyBinding.UNSELECT, this.handleUnselectClicked);

        dataHandler = window.curry(this.handleData, this);
        graphAPI.get(dataHandler);

        this.handleWindowResize();
    },

    filterNodes: function (query) {
        this.graph.filter(query);
        this.graphInspector.filter(query);
    },

    /**
     * Node CRUD actions
     */

    createNode: function (name, type) {

        var node,
            nodes = this.graph.nodes,
            dragStartHandler = window.curry(this.graph.handleNodeDragStart, this.graph),
            dragHandler = window.curry(this.graph.handleNodeDrag, this.graph);

        if (this.editMode !== graph.EditModes.ADD) {
            return;
        }

        node = {
            'name': name,
            'type': type,
            'status': "pending"
        };
        nodes.push(node);

        graphAPI.createNode(node, function (data) {
            node.id = data.node.id;
        });

        this.graph.drawNodes({
            'dragstart': dragStartHandler,
            'drag': dragHandler,
            'click': this.graph.handleMouseClick,
            'mouseover': this.graph.handleMouseOver,
            'mouseout': this.graph.handleMouseOut
        });
        
        this.graph.force.start();
    },

    deleteNode: function (node) {

        graphAPI.deleteNode({'id': node.id});
    },

    updateNode: function (node) {

        graphAPI.updateNode(node);
    },

    /**
     * Link CRUD actions
     */

    createLink: function (sourceNodeData, targetNodeData) {
        var edgeType = 'Shoots',
            edge,
            json,
            edges = this.graph.edges;

        if (this.editMode === graph.EditModes.SYNONYM) {
            edgeType = 'Synonym';
        } 
        // else if (sourceNodeData.type == 'category' ||
        //      targetNodeData.type == 'category') {

        //  edgeType = 'CATEGORY';
        // }

        edge = {
            id: edges.length,
            source: sourceNodeData.index,
            target: targetNodeData.index,
        };

        edges.push(edge);

        data = {
            from: sourceNodeData.id,
            to: targetNodeData.id,
            type: edgeType
        };

        graphAPI.createEdge(data, function (data, status, jqXHR) {
            edge.id = data.edge.id;
        });

        this.graph
            .drawLinks()
            .force.start();
    },

    destroyLink: function (sourceNodeData, targetNodeData) {
        var edge,
            i,
            json,
            graph = this.graph,
            edges = graph.edges
            targets = [sourceNodeData.id, targetNodeData.id],
            targetEdges = [];

        for (i = 0; i < edges.length; i++) {

            if (targets.indexOf(edges[i].source.id) !== -1 &&
                targets.indexOf(edges[i].target.id) !== -1) {

                targetEdges.push(edges[i]);

                edges.splice(i, 1);

                i--;
            }
        }

        if (targetEdges.length > 0) {

            graphAPI.deleteEdges(targetEdges);

            graph.drawLinks();
            graph.force.start();
        }
    },

    editAction: function (node, data) {

        // load the node form in the side bar
        this.graphInspector.setView('node');

        this.graphInspector.loadNode(data);
    },

    /**
     * Allow / Deny
     */

    allowAction: function (node, data) {

        data.status = "accepted";

        this.graph.setAccepted(node);
        this.updateNode(data);
    },

    denyAction: function (node, data) {

        data.status = "denied";

        this.graph.setDenied(node);
        this.updateNode(data);
    },

    /**
     * Link / Unlink
     */

    linkAction: function (node, data) {

        var selectedNode = this.selectedNode;

        if (selectedNode === null || selectedNode === undefined) {
            selectedNode = {
                data: data,
                domObject: node
            };

            this.graph.setSelected(node, true);

        } else {

            this.createLink(selectedNode.data, data);

            this.graph.setSelected(selectedNode.domObject, false);
            selectedNode = null;
        }

        this.selectedNode = selectedNode;
    },

    unlinkAction: function (node, data) {

        var selectedNode = this.selectedNode;

        if (selectedNode === null || selectedNode === undefined) {
            selectedNode = {
                data: data,
                domObject: node
            };

            this.graph.setSelected(node, true);

        } else {

            this.destroyLink(selectedNode.data, data);

            this.graph.setSelected(selectedNode.domObject, false);
            selectedNode = null;
        }

        this.selectedNode = selectedNode;
    },

    /**
     * Delete
     */

    deleteAction: function (node, data) {

        // view update
        this.graph.deleteNode(data.id);

        // database update
        this.deleteNode(data);
    },

    /**
     * Event handlers
     */

    handleData: function (data) {
        var nodes = data.nodes,
            edges = data.edges,
            dragStartHandler,
            dragHandler,
            tickHandler;

        for(var i = 0; i < edges.length; i++) {
            edges[i].weight = 1;
        }

        this.graph = new graph.Graph('#graph', nodes, edges);
        this.graph.force.start();
        this.graph.drawLinks();

        dragStartHandler = window.curry(this.graph.handleNodeDragStart, this.graph);
        dragHandler = window.curry(this.graph.handleNodeDrag, this.graph);

        this.graph.drawNodes({
            'dragstart': dragStartHandler,
            'drag': dragHandler,
            'click': this.graph.handleMouseClick,
            'mouseover': this.graph.handleMouseOver,
            'mouseout': this.graph.handleMouseOut
        });

        tickHandler = window.curry(this.graph.handleTick, this.graph);
        this.graph.force.on('tick', tickHandler);

        this.graphInspector = new graph.GraphInspector('#inspector', '#node-list', this.graph.nodes);
        this.graphInspector.setView('filter');
        this.graphInspector.renderView();
    },

    handleNodeUpdate: function (event) {

        var name = $('#node-title').val();
        var type = $('#node-type-select').val();

        if (event.type === "keydown") {
            if (event.keyCode != 13) {
                return;
            } else {
                event.preventDefault();
            }
        }

        $('#node-title').val("");

        if (name.length > 0) {
            this.createNode(name, type);
        }
    },

    handleNodeChange: function (event) {

        event.preventDefault();

        var obj = {
            'id': $('#node-id').val(),
            'name': $('#node-name').val(),
            'content': $('#node-content').val()
        }

        // if (event.type === "keydown") {
        //  if (event.keyCode != 13) {
        //      return;
        //  } else {
        //      event.preventDefault();
        //  }
        // }

        this.updateNode(obj);
    },

    handleFilterClear: function (event) {

        this.filterNodes();

        $(event.currentTarget)
            .addClass('hidden')
            .prev().val('');
    },

    handleFilterInput: function (event) {

        var inputBox = $(event.currentTarget),
            clearButton = inputBox.next(),
            query = $(event.currentTarget).val();

        this.graphInspector.setView('filter');

        if (inputBox.val().length > 0) {
            clearButton.removeClass('hidden');
        }

        this.filterNodes(query);
    },

    handleKeyDown: function (event) {

        // map keyCode to radioIndex
        var keyMapping = {
            113: 0,
            119: 1,
            101: 2,
            114: 3,
            116: 4
        },
            radioIndex = keyMapping[event.keyCode];

        // only set the action if a valid key is pressed
        if (typeof radioIndex === 'number') {
            $('input[type=radio]')[radioIndex].click();
        }
    },

    handleModeChange: function (event) {

        var target = event.target;
        if (target.className !== "active") {
            return;
        }

        this.graph.dragEnabled = false;
        this.editMode = $(target).children().first().val();
        
        if(this.editMode === graph.EditModes.MOVE) {
            this.graph.dragEnabled = true;
        }
    },

    handleNavigationClick: function (event) {

        $(event.currentTarget)
            .addClass('active')
            .siblings().removeClass('active');
    },

    handleUnselectClicked: function (event) {

        $('#filter-clear').click();
    },

    handleSkillClick: function (event) {

        var target = $(event.currentTarget),
            nodes = d3.select('#nodes').selectAll('g'),
            selectedNode;

        if (! target.hasClass('selected')) {
            nodes.classed('selected', function (data) {
                var isSelected = false;

                if(data.id == target.data('id')) {
                    isSelected = true;

                    selectedNode = {
                        data: data,
                        domObject: this
                    };
                }

                return isSelected;
            });
        } else {
            nodes.classed('selected', false);
        }

        if(selectedNode != null) {
            this.selectedNode = selectedNode;
        }
    },

    handleWindowResize: function (event) {
        var graphSelector = '#graph',
            width = $(window).width(),
            height = $(window).height();

        $(graphSelector)
            .attr('width', width)
            .attr('height', height);
    }
});

graph.EditModes = {
    MOVE:    'move',
    OK:      'allow',
    DENY:    'deny',
    LINK:    'link',
    UNLINK:  'unlink',
    EDIT:    'edit',
    SYNONYM: 'synonym',
    ADD:     'add',
    DELETE:  'delete',
    MERGE:   'merge'
};

graph.KeyBinding = {
    MOVE:     'q',
    OK:       'w',
    DENY:     'e',
    LINK:     'r',
    UNLINK:   't',
    UNSELECT: 'esc'
};

}(window, jQuery, d3, Mousetrap));