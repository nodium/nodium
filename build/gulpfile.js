/**
 * This file is part of the Nodium core package
 *
 * (c) Niko van Meurs & Sid Mijnders
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/**
 * @author Niko van Meurs <nikovanmeurs@gmail.com>
 */
const
    Builder    = require('./Builder'),
    browserify = require('browserify'),
    gulp       = require('gulp'),
    source     = require('vinyl-source-stream');


gulp.task('build', function () {
    Builder.build({
        srcDir: '../js',
        output: '../dist/nodium.js',
        fixedOrder: [
            'namespace',
            'util/wrappers.js',
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