(function (context, undefined) {
	var event = context.setNamespace('app.event'),
		HoldEvent;

	HoldEvent = {
		NODE: 'holding-node',
		CANVAS: 'holding-canvas',
		DRAGDOWN: 'hold-drag-down',
		DRAGUP: 'hold-drag-up',
		DRAGLEFT: 'hold-drag-left',
		DRAGRIGHT: 'hold-drag-right'
	};

	event.HoldEvent = HoldEvent;
}(this));
