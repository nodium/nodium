const
    gulp       = require('gulp'),
    browserify = require('browserify'),
    Builder    = require('./Builder'),
    source     = require('vinyl-source-stream');


gulp.task('build', function () {
    Builder.build({
        srcDir: '../js',
        output: '../dist/nodium.js',
        fixedOrder: [
        	'namespace',
        	'util/super.js',
            'util',
            'event/EventAware.js',
            'ui/UIElement.js',
            'ui/UIPanel.js'
        ]
    });

    var bundler,
    	stream;

    bundler = browserify({
    	entries: ['../dist/nodium.js']
    });

    stream = bundler.bundle();

    return stream
    	.pipe(source('../dist/nodium.js'))
    	.pipe(gulp.dest('../dist'));
});