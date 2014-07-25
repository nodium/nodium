(function (window, undefined) {
	var event = window.setNamespace('app.event'),
		NodeEvent;

	NodeEvent = {
		CREATE: 'node-create',
		UPDATE: 'node-update',
		DESTROY: 'node-delete',
		SELECT: 'node-selected',
		UNSELECT: 'node-unselected',
		CREATED: 'node-created',
		UPDATED: 'node-updated',
		DESTROYED: 'node-destroyed'
	};

	event.NodeEvent = NodeEvent;
}(window));