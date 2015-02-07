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
(function (context, _, undefined) {

    var util = context.setNamespace('app.util');

    /**
     * Creates a string by replacing the params in template
     * @param {String} template
     * @param {Object} params
     * returns {String}
     */
    function stringFromTemplate (template, params) {

        return _.reduce(params, replace, template);
    }

    /**
     * Replaces {needle} with value in haystack
     * @param {String} haystack
     * @param {*} value
     * @param {String} needle
     * @returns {String}
     */
    function replace (haystack, value, needle) {
        return haystack.replace(new RegExp('\{' + needle + '\}'), value);
    };

    util.stringFromTemplate = stringFromTemplate;
}(this, _));