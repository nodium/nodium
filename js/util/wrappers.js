(function (window, undefined) {

/*
 * window wrappers
 */

app.setTimeout = function () {
	window.setTimeout(arguments);
};


app.clearTimeout = function () {
	window.clearTimeout(arguments);
};

app.open = function () {
	window.open(arguments);
};

})(this);