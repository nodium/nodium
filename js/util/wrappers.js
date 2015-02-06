(function (context, undefined) {

/*
 * window wrappers
 * the context passed should be the window object
 */


// doesn't work yet!
var app = context.use('app');

app.setTimeout = function () {
	console.log(context);
	console.log(app);
	console.log(arguments);
	context.setTimeout.apply(context, arguments);
};


app.clearTimeout = function () {
	context.clearTimeout.apply(context, arguments);
};

app.open = function () {
	context.open.apply(context, arguments);
};

}(this));