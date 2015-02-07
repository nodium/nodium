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

    /**
     * Returns an object based on a fully qualified classname
     * @param string fullyQualifiedClassName
     * @return mixed
     */
    context.use = function (fullyQualifiedClassName) {

        var components = fullyQualifiedClassName.split('.'),
            parent = context,
            child;

        while (child = components.shift()) {

            parent = parent[child] || {};
        }

        return parent;
    };
}(this));

