(function (window, $, d3, undefined) {
	var graph = window.setNamespace('app.graph'),
		app   = window.setNamespace('app');

	/**
	 * NodeEditor trait
	 *
	 * Adds functionality to create new nodes
	 */
	graph.NodeCD = function () {

		// enforce use of new on constructor
		if ((this instanceof graph.NodeCD) === false) {
			return new graph.NodeCD(arguments);
		}

		$(this).on('trait', this.attachNodeCD);
	};

	/**
	 * Initializes variables and attaches events used for creating edges
	 */
	graph.NodeCD.prototype.attachNodeCD = function () {

		var createNode = window.curry(this.handleNodeCreate, this);
		var deleteNode = window.curry(this.handleNodeDelete, this);
		var updateNode = window.curry(this.handleNodeUpdate, this);
		var loadNode = window.curry(this.handleNodeSelected, this);
		$(this).on('drag-down', deleteNode);
		this.holdActions[graph.Drag.DOWN] = "Delete";
		$('#new-node-form').on('submit', createNode);
		$('#node-form').on('submit', updateNode);
		$(this).on('drag-up', loadNode);
	};

	graph.NodeCD.prototype.handleNodeCreate = function (event) {

		event.preventDefault();
        event.stopPropagation();

        var input = $('#new-node-name').val();
        $('#new-node-name').val('');

        this.createNode(input);
	};

	graph.NodeCD.prototype.createNode = function (name) {

		console.log("name");

		if (name == '') {
			return;
		}

		var data = {
			name: name
		};

		console.log(data);

		this.nodes.push(data);

		this.drawNodes();
		this.force.start();

		$(this).trigger('node-created', [data]);
	};

	graph.NodeCD.prototype.handleNodeDelete = function (event, node, data) {

		event.preventDefault();
        event.stopPropagation();

		this.deleteNode(data);
	};

	graph.NodeCD.prototype.deleteLinksForNode = function (nodeIndex) {

		var link;

		// start from top to remove multiple links correctly
		for (var i = this.edges.length-1; i >= 0; i--) {
			link = this.edges[i];
			if (link.source.index == nodeIndex || link.target.index == nodeIndex) {
				this.edges.splice(i, 1);
			}
		}
	};

	/**
	 * Handles the delete-node event
	 */
	graph.NodeCD.prototype.deleteNode = function (data) {

		this.deleteLinksForNode(data.index);

		// remove the node at the index
		this.nodes.splice(data.index, 1);

		// update the indices of all nodes behind it
		for (var i = data.index; i < this.nodes.length; i++) {
			this.nodes[i].index = i;
		}

		this.drawLinks();
		this.drawNodes();
		this.force.start();

		$(this).trigger('node-deleted', [data]);
	};

	graph.NodeCD.prototype.getFieldSelector = function (name) {
		return '#node-' + name;
	}

	/**
	 * Read the node into the edit form
	 */
	graph.NodeCD.prototype.handleNodeSelected = function (event, node, data) {

		console.log("handling node selected");
		console.log(data);

		// fix this differently
		this.selectedNode = {
			node: node,
			data: data
		};

		var fieldPrototype = '<textarea id="node-__field__" rows="__rows__" placeholder="__field__">__value__</textarea>',
			fieldHTML,
			fieldName;

		// create the html form elements
		$('#node-fields').empty();

		for (var i = 0; i < data.fields.length; i++) {
			fieldName = data.fields[i];
			console.log(data[fieldName]);
			fieldHTML = fieldPrototype
				.replace(/__field__/g, fieldName)
				.replace(/__value__/, data[fieldName])
				.replace(/__rows__/, fieldName == 'name' ? 1 : 5);
			$('#node-fields').append(fieldHTML);
		}
	}

	graph.NodeCD.prototype.handleNodeUpdate = function (event) {

		var data = {},
			fieldName;

		event.preventDefault();

		console.log("handling node update");

		if (!this.selectedNode) {
			return;
		}

		// build the data to send
		for (var i = 0; i < this.selectedNode.data.fields.length; i++) {
			fieldName = this.selectedNode.data.fields[i];
			data[fieldName] = $(this.getFieldSelector(fieldName)).val();
		};

		var selectedData = this.selectedNode.data;
		$.extend(selectedData, data);

		this.redrawNodes();
		this.force.start();

		$(this).trigger('node-updated', [data, this.selectedNode.data.id]);
	};

}(window, jQuery, d3));