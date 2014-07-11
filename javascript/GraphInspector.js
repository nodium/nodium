(function (window, $, undefined) {
	var graph = window.setNamespace('app.graph');

	graph.GraphInspector = function (inspectorSelector, listViewSelector, nodesArray) {

		// enforce use of new on constructor
		if ((this instanceof graph.GraphInspector) === false) {
			return new graph.GraphInspector(arguments);
		}

		this.data = nodesArray;
		this.visibleData = nodesArray;
		this.view = $(inspectorSelector);
		this.listView = $(listViewSelector);

		this.listView.on('click', 'li', this.handleItemClicked)
	};

	graph.GraphInspector.prototype.createListItem = function (itemData, index) {

		var prototype = '<li class=".skill" data-id="__id__"><span>__name__</span></li>',
			domObject = prototype.replace(/__id__/g, itemData.id)
				.replace(/__name__/g, itemData.name);

		return domObject;
	};

	graph.GraphInspector.prototype.filter = function (query) {

		var i,
			data = this.data,
			visibleData = this.visibleData;

		visibleData = [];

		if(typeof query !== 'undefined') {
			for(i = 0; i < data.length; i++) {
				if(data[i].name.toLowerCase().indexOf(query.toLowerCase()) !== -1) {
					visibleData.push(data[i]);
				}
			}
		} else {
			visibleData = data;
		}

		this.visibleData = visibleData;
		this.renderView();
	};

	/**
	 * Read the node into the edit form
	 */
	graph.GraphInspector.prototype.loadNode = function (node) {
		var name = node.name,
			content = node.content || "",
			id = node.id;

		$('#node-id').val(id);
		$('#node-name').val(name);
		$('#node-content').val(content);

		// TODO fully generic/dynamic creation of node's fields
		
	}

	graph.GraphInspector.prototype.renderView = function () {

		var visibleData = this.visibleData,
			dataHandler = this.createListItem;

		this.listView
			.empty()
			.append($.map(visibleData, dataHandler));
	};

	/**
	 * Sets the view to one of the modes: filter, node
	 */
	graph.GraphInspector.prototype.setView = function (mode) {
		if (mode == "node") {
			$('#inspector-filter').css('display', 'none');
			$('#inspector-node').css('display', 'block');
		} else if (mode == "filter") {
			$('#inspector-node').css('display', 'none');
			$('#inspector-filter').css('display', 'block');
		} else {
			// ??
		}
	};

	/**
	 * Event Handlers
	 */

	graph.GraphInspector.prototype.handleItemClicked = function (event) {
	
		$(event.currentTarget)
			.toggleClass('selected')
			.siblings()
				.removeClass('selected');
	};

}(window, jQuery));