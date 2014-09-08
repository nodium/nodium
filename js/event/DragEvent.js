(function (window, undefined) {
	var event = window.setNamespace('app.event'),
		DragEvent;

	DragEvent = {
		START: 'drag-start',
		DRAG: 'drag',
		END: 'drag-end'
	};

	event.DragEvent = DragEvent;
}(window));