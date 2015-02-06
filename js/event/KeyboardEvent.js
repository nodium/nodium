(function (context, undefined) {
	var event = context.setNamespace('app.event');

	const KeyboardEvent = {
		ESCAPE: 'key-escape',
	};

	event.KeyboardEvent = KeyboardEvent;
}(this));
