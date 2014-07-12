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

		// start out hidden
		$('#node-form').addClass('hidden');

		var loadNode = window.curry(this.handleNodeSelected, this),
			unloadNode = window.curry(this.handleNodeUnselected, this),
			createNode = window.curry(this.handleNodeCreate, this),
			deleteNode = window.curry(this.handleNodeDelete, this),
			deleteNodeButton = window.curry(this.handleNodeDeleteButton, this),
			updateNode = window.curry(this.handleNodeUpdate, this),
			addProperty = window.curry(this.handlePropertyAdded, this),
			deleteProperty = window.curry(this.handlePropertyDeleted, this),

			createChildNode = window.curry(this.handleCreateChildNode, this);

		// select / deselect node
		$(this).on('node-clicked', loadNode);
		$(this).on('node-deleted', unloadNode);

		// node CRUD
		$('#new-node-form').on('submit', createNode);
		$(this).on('drag-down', deleteNode);
		this.holdActions[graph.Drag.DOWN] = "Delete";
		$('#node-form').on('submit', deleteNodeButton);
		$('#node-form').on('focusout', updateNode);

		// properties
		$('#new-property').on('click', addProperty);
		$('#node-fields').on('click', '.delete-property', deleteProperty);

		$(this).on('drag-up', createChildNode);
	};

	graph.NodeCD.prototype.handleNodeUnselected = function (event, data) {

		if (!this.selectedNode || this.selectedNode.data.index == data.index) {
			$('#node-form').addClass('hidden');
		}

		this.selectedNode = null;
	};

	graph.NodeCD.prototype.handleNodeCreate = function (event) {

		var newNode;

		event.preventDefault();
        event.stopPropagation();

        var input = $('#new-node-name').val();
        if (input == '') {
        	return;
        }

        $('#new-node-name').val('');

        newNode = this.createNode({name: input});
        $(this).trigger('node-created', [newNode]);
	};

	/**
	 * Create a node from a given set of key value pairs
	 */
	graph.NodeCD.prototype.createNode = function (data, x, y) {

		// then add node metadata
		this.addNodeMetadata(data);

		data.x = x;
		data.y = y;

		// then let d3 add other properties
		this.nodes.push(data);
		this.drawNodes();
		this.force.start();

		// $(this).trigger('node-created', [data]);

		return data;
	};

	graph.NodeCD.prototype.handleNodeDelete = function (event, node, data) {

		event.preventDefault();
        event.stopPropagation();

		this.deleteNode(data);
	};

	graph.NodeCD.prototype.handleNodeDeleteButton = function (event) {

		event.preventDefault();
        event.stopPropagation();

		if (!this.selectedNode) {
			return;
		}

		var data = this.selectedNode.data;

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

		console.log("node clicked");
		console.log(arguments);

		// fix this differently
		this.selectedNode = {
			node: node,
			data: data
		};

		var fieldPrototype = $('#node-fields').data('prototype'),
			fieldHTML,
			fieldName,
			titleField = this.getNodeTitleKey();

		$('#node-form').removeClass('hidden');

		// set and focus the title field
		$('#node-title').val('');
		if (data.hasOwnProperty(titleField)) {
			$('#node-title').val(data[titleField]);
		}
		$('#node-title').focus();

		// create the html form elements
		$('#node-fields').empty();

		for (var i = 0; i < data._fields.length; i++) {
			fieldName = data._fields[i];

			// the title property is rendered differently
			if (fieldName == titleField) {
				continue;
			}

			fieldHTML = fieldPrototype
				.replace(/__field__/g, fieldName)
				.replace(/__value__/, data[fieldName])
				.replace(/__rows__/, 1);
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
		data._fields = [titleField];

		// set the title field separately
		data[titleField] = $('#node-title').val();
		result[titleField] = data[titleField];

		for (var i = 0; i < fields.length; i++) {
			key = $('.node-key', fields[i]).val();
			value = $('.node-value', fields[i]).val();

			// skip if the key is empty
			if (key == "" || value == "") {
				continue;
			}

			data._fields.push(key);
			data[key] = value;
			result[key] = value;
		}

		// TODO maybe we should try to remove the unused fields from the node data,
		// but this is not strictly necessary, the fields metadata works as a filter

		return result;
	};

	graph.NodeCD.prototype.handleNodeUpdate = function (event) {

		if (!this.selectedNode) {
			return;
		}

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

		if (!data[titleField] || data[titleField] == "") {
			return;
		}

		$(this).trigger('node-updated', [data, nodeData.id]);
	};

	graph.NodeCD.prototype.handlePropertyAdded = function (event) {

		var fieldPrototype = $('#node-fields').data('prototype'),
			fieldHTML;

		event.preventDefault();

		fieldHTML = fieldPrototype
			.replace(/__field__/g, '')
			.replace(/__value__/, '')
			.replace(/__rows__/, 1);

		$('input', $(fieldHTML).appendTo('#node-fields')).focus();
	};

	graph.NodeCD.prototype.handlePropertyDeleted = function (event) {

		var nodeData = this.selectedNode.data,
			data;

		event.preventDefault();

		$(event.target).closest('li').remove();

		data = this.updateNodeDataWithFields(nodeData);

		$(this).trigger('node-updated', [data, nodeData.id]);
	};

	graph.NodeCD.prototype.handleCreateChildNode = function (event, node, data) {

		var self = this,
			newData = this.createNode({}, data.x + 20, data.y + 20),
			newNode = d3.select('.node:nth-child(' + (newData.index+1) + ')', this.selector);

		// make sure the held node remains fixed while linking
		data.fixed = true;

		// create the link after the node has its id
		$(this).trigger('node-created', [newData, function () {

			self.updateLink(data, newData);
		}]);

		// select node in inspector
		$(this).trigger('node-clicked', [newNode, newData]);

		data.fixed = false;
	};

}(window, jQuery, d3));