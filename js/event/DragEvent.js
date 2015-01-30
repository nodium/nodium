(function (context, undefined) {
	var event = context.setNamespace('app.event'),
		DragEvent;

	DragEvent = {
		START: 'drag-start',
		DRAG: 'drag',
		END: 'drag-end'
	};

	event.DragEvent = DragEvent;
}(this));
