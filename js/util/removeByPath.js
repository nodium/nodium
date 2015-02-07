/**
 * This file is part of the Nodium core package
 *
 * (c) Niko van Meurs & Sid Mijnders
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/**
 * @author Sid Mijnders <sid@starapple.nl>
 */
 (function (context, undefined) {

    /**
     * there are several options:
     *   value is passed or undefined
     *   path points to an array or object
     *
     * If value is defined
     *   array: find the value in the array and splice
     *   object: ??? // throws error for now, maybe some sort of key-value check?
     *
     * If value is undefined
     *   array: path should end in an index; remove the element at index
     *   object: path should end in a key; delete the key
     */
    context.removeByPath = function (obj, path, value) {

        var array = context.getPathArray(path),
            key,
            depth = value === undefined ? array.length - 1 : array.length;

        for (;depth;depth--) {
            key = array.shift();
            if (key in obj) {
                obj = obj[key];
            } else {
                return false;
            }
        }

        if (value === undefined) {

            // array contains final key
            key = array.shift();

            if (Array.isArray(obj)) {

                // we need an int
                key = parseInt(key, 10);
                if (isNaN(key)) {
                    return false;
                }

                obj.splice(key, 1);
                return true;
            } else if (typeof obj === 'object') {
                delete obj[key];
                return true;
            } else {
                return false;
            }
        } else {
            if (Array.isArray(obj)) {
                key = obj.indexOf(value);

                if (key === -1) {
                    return false;
                } else {
                    obj.splice(key, 1);
                    return true;
                }
            } else if (typeof obj === 'object') {
                throw 'Cannot remove value from object';
                return false;
            } else {
                throw 'Cannot remove value from this type';
                return false;
            }
        }  
    };
}(this));
