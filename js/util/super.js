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
(function (context, undefined) {

    var util = context.setNamespace('app.util');

    /**
     * Used to retrieve a function with name functionName from a superClass's prototype object
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/getPrototypeOf|Object.getPrototypeOf()}
     * @param {String} functionName
     * @returns {Function}
     */
    util.super = function (functionName) {

        var prototype = Object.getPrototypeOf(Object.getPrototypeOf(this)),
            functionName,
            args;

        args = [].slice.call(arguments, 1);

        if (prototype.hasOwnProperty(functionName)) {
            return prototype[functionName].apply(this, args);
        }
    };
}(this));
