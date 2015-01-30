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
     * Sets the current namespace
     * @param string namespace
     * @return object
     */
    context.setNamespace = function (namespace) {

        // declare variables
        var namespaceCompenents = namespace.split("."),
            parent = context,
            component,
            i,
            length;

        // loop through namespaceComponents and create new sub-objects for each component
        for (i = 0, length = namespaceCompenents.length; i < length; i++) {
            component = namespaceCompenents[i];
            parent[component] = parent[component] || {};
            parent = parent[component];
        }

        // return the namespace object
        return parent;
    };

}(this));

