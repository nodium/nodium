const
	gulp    = require('gulp'),
	Builder = require ('./Builder');


gulp.task('build', function () {
	Builder.build({
		srcDir: '../js'
		output: '../dist/nodium.js',
		fixedOrder: [
			'Util.js',
			'snippet/Super.js'
		];
	});
});