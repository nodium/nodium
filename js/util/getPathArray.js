/**
 * This file is part of the Nodium Core package
 *
 * (c) StarApple B.V. <developers@starapple.nl>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/**
 * @author Niko van Meurs <niko@starapple.nl>
 * @author Sid Mijnders <sid@starapple.nl>
 */
 (function (context, undefined) {

    /**
     * Note: if an array is passed, this returns a reference to this same array
     */
    context.getPathArray = function (path) {

        var array;

        if (typeof path === 'string') {
            // convert indexes to properties
            path = path.replace(/\[(\w+)\]/g, '.$1');

            // strip a leading dot
            path = path.replace(/^\./, '');

            array = path.split('.');
        } else {
            array = path;
        }

        return array;
    };
}(this));

