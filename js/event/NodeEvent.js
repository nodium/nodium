(function (window, undefined) {
	var event = window.setNamespace('app.event'),
		NodeEvent;

	NodeEvent = {
		CREATE: 'node-create',
		UPDATE: 'node-update',
		DESTROY: 'node-delete',
		SELECT: 'node-select',
		UNSELECT: 'node-unselect',
		CREATED: 'node-created',
		UPDATED: 'node-updated',
		DESTROYED: 'node-destroyed',
		SELECTED: 'node-selected',
		UNSELECTED: 'node-unselected',
		FILTER: 'node-filter',
		FILTERED: 'node-filtered',
		FILTER_UNSET: 'node-filter-unset',
	};

	event.NodeEvent = NodeEvent;
}(window));