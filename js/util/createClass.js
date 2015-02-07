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
 * @author Sid Mijnders
 */
 (function (context, undefined) {

    var util    = context.setNamespace('app.util'),
        app     = context.use('app'),
        superFn = context.use('app.util.super');

    var _shouldConstructSuper = false;

    /**
     * Creates a class constructor
     * @param {Function} [SuperClass]
     * @param {Object} prototype
     */
    app.createClass = function () {

        var Constructor,
            SuperClass,
            prototype,
            props,
            p,
            args;

        args = [].slice.call(arguments, 0);

        if (typeof args[0] === 'function') {
            SuperClass = args.shift();
        }

        props = args.shift();

        /**
         * The class constructor
         * @constructor
         */
        Constructor = function () {
            
            if (false === (this instanceof Constructor)) {
                return new Constructor(arguments);
            }

            // Super constructor should be called if this class doesn't have its own construct function
            if (!Object.getPrototypeOf(this).hasOwnProperty('construct')) {
                _shouldConstructSuper = true;
            }

            // Call construct throughout the prototype chain
            if (this.construct && typeof this.construct === 'function') {

                var args = [].slice.call(arguments, 0);

                args.unshift('construct');
                this.super.apply(this, args);

                if (!_shouldConstructSuper) {
                    this.construct.apply(this, args.slice(1));
                }
            }
            _shouldConstructSuper = false;
        };

        // Construct the prototype
        if (null != SuperClass) {
            _shouldConstructSuper = true;
            prototype = new SuperClass();

            for (p in props) {

                if (props.hasOwnProperty(p)) {
                    prototype[p] = props[p];
                }
            }
        } else {
            // Add super to the prototype chain if SuperClass is undefined
            props.super = superFn;
        }

        Constructor.prototype = prototype || props;

        return Constructor;
    };
}(this));

