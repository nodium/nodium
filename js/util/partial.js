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
     * @deprecated
     */
    context.partial = function (fn, scope) {
        var slice  = Array.prototype.slice,
            concat = Array.prototype.concat,
            args;

        if (scope) {
            args = slice.call(arguments, 2);
        } else {
            args = slice.call(arguments, 1);
        }

        // flatten the arguments
        args = concat.apply([], args);

        scope = scope || context;
      
        return function () {
            return fn.apply(scope, args.concat(slice.call(arguments)));
        };
    };
}(this));

