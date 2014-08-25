(function (window, undefined) {
	var event = window.setNamespace('app.event'),
		EdgeEvent;

	EdgeEvent = {
		CREATE: 'edge-create',
		UPDATE: 'edge-update',
		DESTROY: 'edge-delete',
		SELECT: 'edge-select',
		UNSELECT: 'edge-unselect',
		CREATED: 'edge-created',
		UPDATED: 'edge-updated',
		DESTROYED: 'edge-destroyed',
		SELECTED: 'edge-selected',
		UNSELECTED: 'edge-unselected',
		DRAWN: 'edge-drawn',
		MODECHANGE: 'edge-mode-change',
		MODECHANGED: 'edge-mode-change'
	};

	event.EdgeEvent = EdgeEvent;
}(window));