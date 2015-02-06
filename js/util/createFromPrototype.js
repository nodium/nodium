/**
 * This file is part of the StarApple CRM package
 *
 * (c) StarApple B.V. <developers@starapple.nl>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/**
 * @author Niko van Meurs <niko@starapple.nl>
 */
(function (context, undefined) {

    var util = context.setNamespace('app.util');

    /**
     * Returns a HTML string composed from the view's data-prototype and initialized with params
     * @param {jQuery} view
     * @param {Object} parameters
     * returns {String}
     */
    function createFromPrototype (view, parameters) {

        var prototype = view.data('prototype');

        return util.stringFromTemplate(prototype, parameters);
    }

    util.createFromPrototype = createFromPrototype;
}(this));