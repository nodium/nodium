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
		var addProperty = window.curry(this.handlePropertyAdded, this);
		var deleteProperty = window.curry(this.handlePropertyDeleted, this);
		$(this).on('drag-down', deleteNode);
		this.holdActions[graph.Drag.DOWN] = "Delete";
		$('#new-node-form').on('submit', createNode);
		$('#node-form').on('submit', updateNode);
		$(this).on('node-clicked', loadNode);
		$('#new-property').on('click', addProperty);
		$('#node-fields').on('click', '.delete-property', deleteProperty);
		// $('.delete-property').on('click', deleteProperty);
	};

	graph.NodeCD.prototype.handleNodeCreate = function (event) {

		event.preventDefault();
        event.stopPropagation();

        var input = $('#new-node-name').val();
        $('#new-node-name').val('');

        this.createNode(input);
	};

	graph.NodeCD.prototype.createNode = function (name) {

		if (name == '') {
			return;
		}

		var data = {
			name: name
		};

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
		console.log(data.index);
		this.nodes.splice(data.index, 1);

		// update the indices of all nodes behind it
		// yes? no?
		// for (var i = data.index; i < this.nodes.length; i++) {
		// 	console.log(i + ' ' + this.nodes[i].index);
		// 	this.nodes[i].index = i;
		// }

		console.log(this.nodes);

		this.drawLinks();
		this.redrawNodes();
		this.force.start();

		$(this).trigger('node-deleted', [data]);
	};

	/**
	 * Read the node into the edit form
	 */
	graph.NodeCD.prototype.handleNodeSelected = function (event, node, data) {

		// fix this differently
		this.selectedNode = {
			node: node,
			data: data
		};

		var fieldPrototype = $('#node-fields').data('prototype'),
			fieldHTML,
			fieldName,
			titleField = this.getNodeTitleKey();

		// set the title field
		$('#node-title').val('');
		if (data.hasOwnProperty(titleField)) {
			$('#node-title').val(data[titleField]);
		}

		// create the html form elements
		$('#node-fields').empty();

		for (var i = 0; i < data.fields.length; i++) {
			fieldName = data.fields[i];

			// the title property is rendered differently
			if (fieldName == titleField) {
				continue;
			}

			fieldHTML = fieldPrototype
				.replace(/__field__/g, fieldName)
				.replace(/__value__/, data[fieldName])
				.replace(/__rows__/, 5);
			$('#node-fields').append(fieldHTML);
		}
	};

	/**
	 * Update the data and return the filtered updated data
	 */
	graph.NodeCD.prototype.updateNodeDataWithFields = function (data) {

		var titleField = this.getNodeTitleKey(),
			fields = $('#node-fields').children(),
			key,
			value,
			result = {};

		// clear the fields metadata, we'll refill this
		data.fields = [titleField];

		// set the title field separately
		data[titleField] = $('#node-title').val();
		result[titleField] = data[titleField];

		for (var i = 0; i < fields.length; i++) {
			key = $('.node-key', fields[i]).val();
			value = $('.node-value', fields[i]).val();

			data.fields.push(key);
			data[key] = value;
			result[key] = value;
		}

		// TODO maybe we should try to remove the unused fields from the node data,
		// but this is not strictly necessary, the fields metadata works as a filter

		return result;
	};

	graph.NodeCD.prototype.handleNodeUpdate = function (event) {

		var data,
			fieldName,
			titleField = this.getNodeTitleKey(),
			nodeData = this.selectedNode.data;

		event.preventDefault();
		event.stopPropagation();

		console.log("handling node update");

		if (!this.selectedNode) {
			return;
		}

		data = this.updateNodeDataWithFields(nodeData);

		this.redrawNodes();
		this.force.start();

		$(this).trigger('node-updated', [data, nodeData.id]);
	};

	graph.NodeCD.prototype.handlePropertyAdded = function (event) {

		var fieldPrototype = $('#node-fields').data('prototype'),
			fieldHTML;

		event.preventDefault();

		fieldHTML = fieldPrototype
				.replace(/__field__/g, '')
				.replace(/__value__/, '')
				.replace(/__rows__/, 5);
			$('#node-fields').append(fieldHTML);
	};

	graph.NodeCD.prototype.handlePropertyDeleted = function (event) {

		var nodeData = this.selectedNode.data,
			data;

		event.preventDefault();

		$(event.target).closest('li').remove();

		data = this.updateNodeDataWithFields(nodeData);

		$(this).trigger('node-updated', [data, nodeData.id]);
	};

}(window, jQuery, d3));