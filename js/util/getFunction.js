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
     * Try to get a function from a namespace
     */
    context.getFunction = function (functionPath) {

        var components = functionPath.split('.'),
            parent = context,
            child;

        while (child = components.shift()) {
            if (!parent[child]) {
                return null;
            }

            parent = parent[child];
        }

        if (typeof(parent) === 'function') {
            return parent;
        } else {
            return null;
        }
    };
}(this));

