(function (context, undefined) {
	var event = context.setNamespace('app.event'),
		EdgeEvent;

	EdgeEvent = {
		CREATE: 'edge-create',
		REPLACE: 'edge-replace',
		UPDATE: 'edge-update',
		DESTROY: 'edge-delete',
		SELECT: 'edge-select',
		UNSELECT: 'edge-unselect',
		CREATED: 'edge-created',
		REPLACED: 'edge-replaced',
		UPDATED: 'edge-updated',
		DESTROYED: 'edge-destroyed',
		SELECTED: 'edge-selected',
		UNSELECTED: 'edge-unselected',
		DRAWN: 'edge-drawn',
		MODECHANGE: 'edge-mode-change',
		MODECHANGED: 'edge-mode-change'
	};

	event.EdgeEvent = EdgeEvent;
}(this));
