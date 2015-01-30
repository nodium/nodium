(function (context, undefined) {
	var event = context.setNamespace('app.event');

	const NodeEvent = {
		CREATE: 'node-create',
		UPDATE: 'node-update',
		UPDATEPROPERTY: 'node-update-property',
		UPDATELABEL: 'node-update-label',
		DESTROY: 'node-delete',
		SELECT: 'node-select',
		UNSELECT: 'node-unselect',
		CREATED: 'node-created',
		UPDATED: 'node-updated',
		UPDATEDPROPERTY: 'node-updated-property',
		UPDATEDLABEL: 'node-updated-label',
		DESTROYED: 'node-destroyed',
		SELECTED: 'node-selected',
		UNSELECTED: 'node-unselected',
		FILTER: 'node-filter',
		FILTERED: 'node-filtered',
		FILTER_UNSET: 'node-filter-unset',
		DRAWN: 'node-drawn',
		LOADED: 'graph-loaded'
	};

	event.NodeEvent = NodeEvent;
}(this));
