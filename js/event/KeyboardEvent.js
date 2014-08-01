(function (window, undefined) {
	var event = window.setNamespace('app.event'),
		NodeEvent;

	KeyboardEvent = {
		ESCAPE: 'key-escape',
	};

	event.NodeEvent = NodeEvent;
}(window));