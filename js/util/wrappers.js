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

var app                 = context.setNamespace('app');

    app.clearTimeout    = context.clearTimeout.bind(context),
    app.setTimeout      = context.setTimeout.bind(context),
    app.open            = context.open.bind(context);

}(this));
