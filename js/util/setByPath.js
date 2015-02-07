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
 * @author Sid Mijnders <sid@starapple.nl>
 */
 (function (context, undefined) {

    /**
     * Path can be an array or a string
     * Array indices are expected as integers
     * If an index is given but the array doesn't exist, a subobject will be created
     * If the found subobject is an array, the value will be pushed onto it
     */
    context.setByPath = function (obj, path, value) {

        var array = context.getPathArray(path),
            key,
            newKey = false;

        while (array.length - 1) {
            key = array.shift();
            if (!(key in obj)) {
                newKey = true;
                obj[key] = {};
            }
            obj = obj[key];
        }

        key = array.shift();
        if (!(key in obj)) {
            newKey = true;
        }

        if (Array.isArray(obj)) {
            key = parseInt(key, 10);
            if (isNaN(key)) {
                return false;
            }

            if (key === -1) {
                obj.push(value);
            } else {
                obj.splice(key, 0, value);
            }
        } else if (typeof obj === 'object') {
            obj[key] = value;
        } else {
            throw 'Cannot remove value from this type';
            return false;
        }

        return newKey;
    };

}(this));
