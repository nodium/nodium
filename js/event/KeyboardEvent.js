(function (window, undefined) {
	var event = window.setNamespace('app.event');

	const KeyboardEvent = {
		ESCAPE: 'key-escape',
	};

	event.KeyboardEvent = KeyboardEvent;
}(window));
