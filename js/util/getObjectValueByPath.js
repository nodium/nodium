/**
 * This file is part of the Nodium Core package
 *
 * (c) StarApple B.V. <developers@starapple.nl>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/**
 * @author Sid Mijnders <sid@starapple.nl>
 */
 (function (context, undefined) {

    /**
     */
    context.getObjectValueByPath = function (obj, path) {

        var array = context.getPathArray(path),
            key;

        while (array.length) {
            key = array.shift();
            if (key in obj) {
                obj = obj[key];
            } else {
                return;
            }
        }
        return obj;
    };

}(this));
