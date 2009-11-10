/*
Copyright (c) 2009, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://developer.yahoo.net/yui/license.txt
version: 2.8.0r4
*/
/**
 * The YAHOO object is the single global object used by YUI Library.  It
 * contains utility function for setting up namespaces, inheritance, and
 * logging.  YAHOO.util, YAHOO.widget, and YAHOO.example are namespaces
 * created automatically for and used by the library.
 * @module yahoo
 * @title  YAHOO Global
 */

/**
 * YAHOO_config is not included as part of the library.  Instead it is an 
 * object that can be defined by the implementer immediately before 
 * including the YUI library.  The properties included in this object
 * will be used to configure global properties needed as soon as the 
 * library begins to load.
 * @class YAHOO_config
 * @static
 */

/**
 * A reference to a function that will be executed every time a YAHOO module
 * is loaded.  As parameter, this function will receive the version
 * information for the module. See <a href="YAHOO.env.html#getVersion">
 * YAHOO.env.getVersion</a> for the description of the version data structure.
 * @property listener
 * @type Function
 * @static
 * @default undefined
 */

/**
 * Set to true if the library will be dynamically loaded after window.onload.
 * Defaults to false 
 * @property injecting
 * @type boolean
 * @static
 * @default undefined
 */

/**
 * Instructs the yuiloader component to dynamically load yui components and
 * their dependencies.  See the yuiloader documentation for more information
 * about dynamic loading
 * @property load
 * @static
 * @default undefined
 * @see yuiloader
 */

/**
 * Forces the use of the supplied locale where applicable in the library
 * @property locale
 * @type string
 * @static
 * @default undefined
 */

if (typeof YAHOO == "undefined" || !YAHOO) {
    /**
     * The YAHOO global namespace object.  If YAHOO is already defined, the
     * existing YAHOO object will not be overwritten so that defined
     * namespaces are preserved.
     * @class YAHOO
     * @static
     */
    var YAHOO = {};
}

/**
 * Returns the namespace specified and creates it if it doesn't exist
 * <pre>
 * YAHOO.namespace("property.package");
 * YAHOO.namespace("YAHOO.property.package");
 * </pre>
 * Either of the above would create YAHOO.property, then
 * YAHOO.property.package
 *
 * Be careful when naming packages. Reserved words may work in some browsers
 * and not others. For instance, the following will fail in Safari:
 * <pre>
 * YAHOO.namespace("really.long.nested.namespace");
 * </pre>
 * This fails because "long" is a future reserved word in ECMAScript
 *
 * For implementation code that uses YUI, do not create your components
 * in the namespaces defined by YUI (
 * <code>YAHOO.util</code>, 
 * <code>YAHOO.widget</code>, 
 * <code>YAHOO.lang</code>, 
 * <code>YAHOO.tool</code>, 
 * <code>YAHOO.example</code>, 
 * <code>YAHOO.env</code>) -- create your own namespace (e.g., 'companyname').
 *
 * @method namespace
 * @static
 * @param  {String*} arguments 1-n namespaces to create 
 * @return {Object}  A reference to the last namespace object created
 */
YAHOO.namespace = function() {
    var a=arguments, o=null, i, j, d;
    for (i=0; i<a.length; i=i+1) {
        d=(""+a[i]).split(".");
        o=YAHOO;

        // YAHOO is implied, so it is ignored if it is included
        for (j=(d[0] == "YAHOO") ? 1 : 0; j<d.length; j=j+1) {
            o[d[j]]=o[d[j]] || {};
            o=o[d[j]];
        }
    }

    return o;
};

/**
 * Uses YAHOO.widget.Logger to output a log message, if the widget is
 * available.
 *
 * @method log
 * @static
 * @param  {String}  msg  The message to log.
 * @param  {String}  cat  The log category for the message.  Default
 *                        categories are "info", "warn", "error", time".
 *                        Custom categories can be used as well. (opt)
 * @param  {String}  src  The source of the the message (opt)
 * @return {Boolean}      True if the log operation was successful.
 */
YAHOO.log = function(msg, cat, src) {
    var l=YAHOO.widget.Logger;
    if(l && l.log) {
        return l.log(msg, cat, src);
    } else {
        return false;
    }
};

/**
 * Registers a module with the YAHOO object
 * @method register
 * @static
 * @param {String}   name    the name of the module (event, slider, etc)
 * @param {Function} mainClass a reference to class in the module.  This
 *                             class will be tagged with the version info
 *                             so that it will be possible to identify the
 *                             version that is in use when multiple versions
 *                             have loaded
 * @param {Object}   data      metadata object for the module.  Currently it
 *                             is expected to contain a "version" property
 *                             and a "build" property at minimum.
 */
YAHOO.register = function(name, mainClass, data) {
    var mods = YAHOO.env.modules, m, v, b, ls, i;

    if (!mods[name]) {
        mods[name] = { 
            versions:[], 
            builds:[] 
        };
    }

    m  = mods[name];
    v  = data.version;
    b  = data.build;
    ls = YAHOO.env.listeners;

    m.name = name;
    m.version = v;
    m.build = b;
    m.versions.push(v);
    m.builds.push(b);
    m.mainClass = mainClass;

    // fire the module load listeners
    for (i=0;i<ls.length;i=i+1) {
        ls[i](m);
    }
    // label the main class
    if (mainClass) {
        mainClass.VERSION = v;
        mainClass.BUILD = b;
    } else {
        YAHOO.log("mainClass is undefined for module " + name, "warn");
    }
};

/**
 * YAHOO.env is used to keep track of what is known about the YUI library and
 * the browsing environment
 * @class YAHOO.env
 * @static
 */
YAHOO.env = YAHOO.env || {

    /**
     * Keeps the version info for all YUI modules that have reported themselves
     * @property modules
     * @type Object[]
     */
    modules: [],
    
    /**
     * List of functions that should be executed every time a YUI module
     * reports itself.
     * @property listeners
     * @type Function[]
     */
    listeners: []
};

/**
 * Returns the version data for the specified module:
 *      <dl>
 *      <dt>name:</dt>      <dd>The name of the module</dd>
 *      <dt>version:</dt>   <dd>The version in use</dd>
 *      <dt>build:</dt>     <dd>The build number in use</dd>
 *      <dt>versions:</dt>  <dd>All versions that were registered</dd>
 *      <dt>builds:</dt>    <dd>All builds that were registered.</dd>
 *      <dt>mainClass:</dt> <dd>An object that was was stamped with the
 *                 current version and build. If 
 *                 mainClass.VERSION != version or mainClass.BUILD != build,
 *                 multiple versions of pieces of the library have been
 *                 loaded, potentially causing issues.</dd>
 *       </dl>
 *
 * @method getVersion
 * @static
 * @param {String}  name the name of the module (event, slider, etc)
 * @return {Object} The version info
 */
YAHOO.env.getVersion = function(name) {
    return YAHOO.env.modules[name] || null;
};

/**
 * Do not fork for a browser if it can be avoided.  Use feature detection when
 * you can.  Use the user agent as a last resort.  YAHOO.env.ua stores a version
 * number for the browser engine, 0 otherwise.  This value may or may not map
 * to the version number of the browser using the engine.  The value is 
 * presented as a float so that it can easily be used for boolean evaluation 
 * as well as for looking for a particular range of versions.  Because of this, 
 * some of the granularity of the version info may be lost (e.g., Gecko 1.8.0.9 
 * reports 1.8).
 * @class YAHOO.env.ua
 * @static
 */
YAHOO.env.ua = function() {

        var numberfy = function(s) {
            var c = 0;
            return parseFloat(s.replace(/\./g, function() {
                return (c++ == 1) ? '' : '.';
            }));
        },

        nav = navigator,

        o = {

        /**
         * Internet Explorer version number or 0.  Example: 6
         * @property ie
         * @type float
         */
        ie: 0,

        /**
         * Opera version number or 0.  Example: 9.2
         * @property opera
         * @type float
         */
        opera: 0,

        /**
         * Gecko engine revision number.  Will evaluate to 1 if Gecko 
         * is detected but the revision could not be found. Other browsers
         * will be 0.  Example: 1.8
         * <pre>
         * Firefox 1.0.0.4: 1.7.8   <-- Reports 1.7
         * Firefox 1.5.0.9: 1.8.0.9 <-- Reports 1.8
         * Firefox 2.0.0.3: 1.8.1.3 <-- Reports 1.8
         * Firefox 3 alpha: 1.9a4   <-- Reports 1.9
         * </pre>
         * @property gecko
         * @type float
         */
        gecko: 0,

        /**
         * AppleWebKit version.  KHTML browsers that are not WebKit browsers 
         * will evaluate to 1, other browsers 0.  Example: 418.9.1
         * <pre>
         * Safari 1.3.2 (312.6): 312.8.1 <-- Reports 312.8 -- currently the 
         *                                   latest available for Mac OSX 10.3.
         * Safari 2.0.2:         416     <-- hasOwnProperty introduced
         * Safari 2.0.4:         418     <-- preventDefault fixed
         * Safari 2.0.4 (419.3): 418.9.1 <-- One version of Safari may run
         *                                   different versions of webkit
         * Safari 2.0.4 (419.3): 419     <-- Tiger installations that have been
         *                                   updated, but not updated
         *                                   to the latest patch.
         * Webkit 212 nightly:   522+    <-- Safari 3.0 precursor (with native SVG
         *                                   and many major issues fixed).  
         * 3.x yahoo.com, flickr:422     <-- Safari 3.x hacks the user agent
         *                                   string when hitting yahoo.com and 
         *                                   flickr.com.
         * Safari 3.0.4 (523.12):523.12  <-- First Tiger release - automatic update
         *                                   from 2.x via the 10.4.11 OS patch
         * Webkit nightly 1/2008:525+    <-- Supports DOMContentLoaded event.
         *                                   yahoo.com user agent hack removed.
         *                                   
         * </pre>
         * http://developer.apple.com/internet/safari/uamatrix.html
         * @property webkit
         * @type float
         */
        webkit: 0,

        /**
         * The mobile property will be set to a string containing any relevant
         * user agent information when a modern mobile browser is detected.
         * Currently limited to Safari on the iPhone/iPod Touch, Nokia N-series
         * devices with the WebKit-based browser, and Opera Mini.  
         * @property mobile 
         * @type string
         */
        mobile: null,

        /**
         * Adobe AIR version number or 0.  Only populated if webkit is detected.
         * Example: 1.0
         * @property air
         * @type float
         */
        air: 0,

        /**
         * Google Caja version number or 0.
         * @property caja
         * @type float
         */
        caja: nav.cajaVersion,

        /**
         * Set to true if the page appears to be in SSL
         * @property secure
         * @type boolean
         * @static
         */
        secure: false,

        /**
         * The operating system.  Currently only detecting windows or macintosh
         * @property os
         * @type string
         * @static
         */
        os: null

    },

    ua = navigator && navigator.userAgent, 
    
    loc = window && window.location,

    href = loc && loc.href,
    
    m;

    o.secure = href && (href.toLowerCase().indexOf("https") === 0);

    if (ua) {

        if ((/windows|win32/i).test(ua)) {
            o.os = 'windows';
        } else if ((/macintosh/i).test(ua)) {
            o.os = 'macintosh';
        }
    
        // Modern KHTML browsers should qualify as Safari X-Grade
        if ((/KHTML/).test(ua)) {
            o.webkit=1;
        }

        // Modern WebKit browsers are at least X-Grade
        m=ua.match(/AppleWebKit\/([^\s]*)/);
        if (m&&m[1]) {
            o.webkit=numberfy(m[1]);

            // Mobile browser check
            if (/ Mobile\//.test(ua)) {
                o.mobile = "Apple"; // iPhone or iPod Touch
            } else {
                m=ua.match(/NokiaN[^\/]*/);
                if (m) {
                    o.mobile = m[0]; // Nokia N-series, ex: NokiaN95
                }
            }

            m=ua.match(/AdobeAIR\/([^\s]*)/);
            if (m) {
                o.air = m[0]; // Adobe AIR 1.0 or better
            }

        }

        if (!o.webkit) { // not webkit
            // @todo check Opera/8.01 (J2ME/MIDP; Opera Mini/2.0.4509/1316; fi; U; ssr)
            m=ua.match(/Opera[\s\/]([^\s]*)/);
            if (m&&m[1]) {
                o.opera=numberfy(m[1]);
                m=ua.match(/Opera Mini[^;]*/);
                if (m) {
                    o.mobile = m[0]; // ex: Opera Mini/2.0.4509/1316
                }
            } else { // not opera or webkit
                m=ua.match(/MSIE\s([^;]*)/);
                if (m&&m[1]) {
                    o.ie=numberfy(m[1]);
                } else { // not opera, webkit, or ie
                    m=ua.match(/Gecko\/([^\s]*)/);
                    if (m) {
                        o.gecko=1; // Gecko detected, look for revision
                        m=ua.match(/rv:([^\s\)]*)/);
                        if (m&&m[1]) {
                            o.gecko=numberfy(m[1]);
                        }
                    }
                }
            }
        }
    }

    return o;
}();

/*
 * Initializes the global by creating the default namespaces and applying
 * any new configuration information that is detected.  This is the setup
 * for env.
 * @method init
 * @static
 * @private
 */
(function() {
    YAHOO.namespace("util", "widget", "example");
    /*global YAHOO_config*/
    if ("undefined" !== typeof YAHOO_config) {
        var l=YAHOO_config.listener, ls=YAHOO.env.listeners,unique=true, i;
        if (l) {
            // if YAHOO is loaded multiple times we need to check to see if
            // this is a new config object.  If it is, add the new component
            // load listener to the stack
            for (i=0; i<ls.length; i++) {
                if (ls[i] == l) {
                    unique = false;
                    break;
                }
            }

            if (unique) {
                ls.push(l);
            }
        }
    }
})();
/**
 * Provides the language utilites and extensions used by the library
 * @class YAHOO.lang
 */
YAHOO.lang = YAHOO.lang || {};

(function() {


var L = YAHOO.lang,

    OP = Object.prototype,
    ARRAY_TOSTRING = '[object Array]',
    FUNCTION_TOSTRING = '[object Function]',
    OBJECT_TOSTRING = '[object Object]',
    NOTHING = [],

    // ADD = ["toString", "valueOf", "hasOwnProperty"],
    ADD = ["toString", "valueOf"],

    OB = {

    /**
     * Determines wheather or not the provided object is an array.
     * @method isArray
     * @param {any} o The object being testing
     * @return {boolean} the result
     */
    isArray: function(o) { 
        return OP.toString.apply(o) === ARRAY_TOSTRING;
    },

    /**
     * Determines whether or not the provided object is a boolean
     * @method isBoolean
     * @param {any} o The object being testing
     * @return {boolean} the result
     */
    isBoolean: function(o) {
        return typeof o === 'boolean';
    },
    
    /**
     * Determines whether or not the provided object is a function.
     * Note: Internet Explorer thinks certain functions are objects:
     *
     * var obj = document.createElement("object");
     * YAHOO.lang.isFunction(obj.getAttribute) // reports false in IE
     *
     * var input = document.createElement("input"); // append to body
     * YAHOO.lang.isFunction(input.focus) // reports false in IE
     *
     * You will have to implement additional tests if these functions
     * matter to you.
     *
     * @method isFunction
     * @param {any} o The object being testing
     * @return {boolean} the result
     */
    isFunction: function(o) {
        return (typeof o === 'function') || OP.toString.apply(o) === FUNCTION_TOSTRING;
    },
        
    /**
     * Determines whether or not the provided object is null
     * @method isNull
     * @param {any} o The object being testing
     * @return {boolean} the result
     */
    isNull: function(o) {
        return o === null;
    },
        
    /**
     * Determines whether or not the provided object is a legal number
     * @method isNumber
     * @param {any} o The object being testing
     * @return {boolean} the result
     */
    isNumber: function(o) {
        return typeof o === 'number' && isFinite(o);
    },
      
    /**
     * Determines whether or not the provided object is of type object
     * or function
     * @method isObject
     * @param {any} o The object being testing
     * @return {boolean} the result
     */  
    isObject: function(o) {
return (o && (typeof o === 'object' || L.isFunction(o))) || false;
    },
        
    /**
     * Determines whether or not the provided object is a string
     * @method isString
     * @param {any} o The object being testing
     * @return {boolean} the result
     */
    isString: function(o) {
        return typeof o === 'string';
    },
        
    /**
     * Determines whether or not the provided object is undefined
     * @method isUndefined
     * @param {any} o The object being testing
     * @return {boolean} the result
     */
    isUndefined: function(o) {
        return typeof o === 'undefined';
    },
    
 
    /**
     * IE will not enumerate native functions in a derived object even if the
     * function was overridden.  This is a workaround for specific functions 
     * we care about on the Object prototype. 
     * @property _IEEnumFix
     * @param {Function} r  the object to receive the augmentation
     * @param {Function} s  the object that supplies the properties to augment
     * @static
     * @private
     */
    _IEEnumFix: (YAHOO.env.ua.ie) ? function(r, s) {
            var i, fname, f;
            for (i=0;i<ADD.length;i=i+1) {

                fname = ADD[i];
                f = s[fname];

                if (L.isFunction(f) && f!=OP[fname]) {
                    r[fname]=f;
                }
            }
    } : function(){},
       
    /**
     * Utility to set up the prototype, constructor and superclass properties to
     * support an inheritance strategy that can chain constructors and methods.
     * Static members will not be inherited.
     *
     * @method extend
     * @static
     * @param {Function} subc   the object to modify
     * @param {Function} superc the object to inherit
     * @param {Object} overrides  additional properties/methods to add to the
     *                              subclass prototype.  These will override the
     *                              matching items obtained from the superclass 
     *                              if present.
     */
    extend: function(subc, superc, overrides) {
        if (!superc||!subc) {
            throw new Error("extend failed, please check that " +
                            "all dependencies are included.");
        }
        var F = function() {}, i;
        F.prototype=superc.prototype;
        subc.prototype=new F();
        subc.prototype.constructor=subc;
        subc.superclass=superc.prototype;
        if (superc.prototype.constructor == OP.constructor) {
            superc.prototype.constructor=superc;
        }
    
        if (overrides) {
            for (i in overrides) {
                if (L.hasOwnProperty(overrides, i)) {
                    subc.prototype[i]=overrides[i];
                }
            }

            L._IEEnumFix(subc.prototype, overrides);
        }
    },
   
    /**
     * Applies all properties in the supplier to the receiver if the
     * receiver does not have these properties yet.  Optionally, one or 
     * more methods/properties can be specified (as additional 
     * parameters).  This option will overwrite the property if receiver 
     * has it already.  If true is passed as the third parameter, all 
     * properties will be applied and _will_ overwrite properties in 
     * the receiver.
     *
     * @method augmentObject
     * @static
     * @since 2.3.0
     * @param {Function} r  the object to receive the augmentation
     * @param {Function} s  the object that supplies the properties to augment
     * @param {String*|boolean}  arguments zero or more properties methods 
     *        to augment the receiver with.  If none specified, everything
     *        in the supplier will be used unless it would
     *        overwrite an existing property in the receiver. If true
     *        is specified as the third parameter, all properties will
     *        be applied and will overwrite an existing property in
     *        the receiver
     */
    augmentObject: function(r, s) {
        if (!s||!r) {
            throw new Error("Absorb failed, verify dependencies.");
        }
        var a=arguments, i, p, overrideList=a[2];
        if (overrideList && overrideList!==true) { // only absorb the specified properties
            for (i=2; i<a.length; i=i+1) {
                r[a[i]] = s[a[i]];
            }
        } else { // take everything, overwriting only if the third parameter is true
            for (p in s) { 
                if (overrideList || !(p in r)) {
                    r[p] = s[p];
                }
            }
            
            L._IEEnumFix(r, s);
        }
    },
 
    /**
     * Same as YAHOO.lang.augmentObject, except it only applies prototype properties
     * @see YAHOO.lang.augmentObject
     * @method augmentProto
     * @static
     * @param {Function} r  the object to receive the augmentation
     * @param {Function} s  the object that supplies the properties to augment
     * @param {String*|boolean}  arguments zero or more properties methods 
     *        to augment the receiver with.  If none specified, everything 
     *        in the supplier will be used unless it would overwrite an existing 
     *        property in the receiver.  if true is specified as the third 
     *        parameter, all properties will be applied and will overwrite an 
     *        existing property in the receiver
     */
    augmentProto: function(r, s) {
        if (!s||!r) {
            throw new Error("Augment failed, verify dependencies.");
        }
        //var a=[].concat(arguments);
        var a=[r.prototype,s.prototype], i;
        for (i=2;i<arguments.length;i=i+1) {
            a.push(arguments[i]);
        }
        L.augmentObject.apply(this, a);
    },

      
    /**
     * Returns a simple string representation of the object or array.
     * Other types of objects will be returned unprocessed.  Arrays
     * are expected to be indexed.  Use object notation for
     * associative arrays.
     * @method dump
     * @since 2.3.0
     * @param o {Object} The object to dump
     * @param d {int} How deep to recurse child objects, default 3
     * @return {String} the dump result
     */
    dump: function(o, d) {
        var i,len,s=[],OBJ="{...}",FUN="f(){...}",
            COMMA=', ', ARROW=' => ';

        // Cast non-objects to string
        // Skip dates because the std toString is what we want
        // Skip HTMLElement-like objects because trying to dump 
        // an element will cause an unhandled exception in FF 2.x
        if (!L.isObject(o)) {
            return o + "";
        } else if (o instanceof Date || ("nodeType" in o && "tagName" in o)) {
            return o;
        } else if  (L.isFunction(o)) {
            return FUN;
        }

        // dig into child objects the depth specifed. Default 3
        d = (L.isNumber(d)) ? d : 3;

        // arrays [1, 2, 3]
        if (L.isArray(o)) {
            s.push("[");
            for (i=0,len=o.length;i<len;i=i+1) {
                if (L.isObject(o[i])) {
                    s.push((d > 0) ? L.dump(o[i], d-1) : OBJ);
                } else {
                    s.push(o[i]);
                }
                s.push(COMMA);
            }
            if (s.length > 1) {
                s.pop();
            }
            s.push("]");
        // objects {k1 => v1, k2 => v2}
        } else {
            s.push("{");
            for (i in o) {
                if (L.hasOwnProperty(o, i)) {
                    s.push(i + ARROW);
                    if (L.isObject(o[i])) {
                        s.push((d > 0) ? L.dump(o[i], d-1) : OBJ);
                    } else {
                        s.push(o[i]);
                    }
                    s.push(COMMA);
                }
            }
            if (s.length > 1) {
                s.pop();
            }
            s.push("}");
        }

        return s.join("");
    },

    /**
     * Does variable substitution on a string. It scans through the string 
     * looking for expressions enclosed in { } braces. If an expression 
     * is found, it is used a key on the object.  If there is a space in
     * the key, the first word is used for the key and the rest is provided
     * to an optional function to be used to programatically determine the
     * value (the extra information might be used for this decision). If 
     * the value for the key in the object, or what is returned from the
     * function has a string value, number value, or object value, it is 
     * substituted for the bracket expression and it repeats.  If this
     * value is an object, it uses the Object's toString() if this has
     * been overridden, otherwise it does a shallow dump of the key/value
     * pairs.
     * @method substitute
     * @since 2.3.0
     * @param s {String} The string that will be modified.
     * @param o {Object} An object containing the replacement values
     * @param f {Function} An optional function that can be used to
     *                     process each match.  It receives the key,
     *                     value, and any extra metadata included with
     *                     the key inside of the braces.
     * @return {String} the substituted string
     */
    substitute: function (s, o, f) {
        var i, j, k, key, v, meta, saved=[], token, 
            DUMP='dump', SPACE=' ', LBRACE='{', RBRACE='}',
            dump, objstr;


        for (;;) {
            i = s.lastIndexOf(LBRACE);
            if (i < 0) {
                break;
            }
            j = s.indexOf(RBRACE, i);
            if (i + 1 >= j) {
                break;
            }

            //Extract key and meta info 
            token = s.substring(i + 1, j);
            key = token;
            meta = null;
            k = key.indexOf(SPACE);
            if (k > -1) {
                meta = key.substring(k + 1);
                key = key.substring(0, k);
            }

            // lookup the value
            v = o[key];

            // if a substitution function was provided, execute it
            if (f) {
                v = f(key, v, meta);
            }

            if (L.isObject(v)) {
                if (L.isArray(v)) {
                    v = L.dump(v, parseInt(meta, 10));
                } else {
                    meta = meta || "";

                    // look for the keyword 'dump', if found force obj dump
                    dump = meta.indexOf(DUMP);
                    if (dump > -1) {
                        meta = meta.substring(4);
                    }

                    objstr = v.toString();

                    // use the toString if it is not the Object toString 
                    // and the 'dump' meta info was not found
                    if (objstr === OBJECT_TOSTRING || dump > -1) {
                        v = L.dump(v, parseInt(meta, 10));
                    } else {
                        v = objstr;
                    }
                }
            } else if (!L.isString(v) && !L.isNumber(v)) {
                // This {block} has no replace string. Save it for later.
                v = "~-" + saved.length + "-~";
                saved[saved.length] = token;

                // break;
            }

            s = s.substring(0, i) + v + s.substring(j + 1);


        }

        // restore saved {block}s
        for (i=saved.length-1; i>=0; i=i-1) {
            s = s.replace(new RegExp("~-" + i + "-~"), "{"  + saved[i] + "}", "g");
        }

        return s;
    },


    /**
     * Returns a string without any leading or trailing whitespace.  If 
     * the input is not a string, the input will be returned untouched.
     * @method trim
     * @since 2.3.0
     * @param s {string} the string to trim
     * @return {string} the trimmed string
     */
    trim: function(s){
        try {
            return s.replace(/^\s+|\s+$/g, "");
        } catch(e) {
            return s;
        }
    },

    /**
     * Returns a new object containing all of the properties of
     * all the supplied objects.  The properties from later objects
     * will overwrite those in earlier objects.
     * @method merge
     * @since 2.3.0
     * @param arguments {Object*} the objects to merge
     * @return the new merged object
     */
    merge: function() {
        var o={}, a=arguments, l=a.length, i;
        for (i=0; i<l; i=i+1) {
            L.augmentObject(o, a[i], true);
        }
        return o;
    },

    /**
     * Executes the supplied function in the context of the supplied 
     * object 'when' milliseconds later.  Executes the function a 
     * single time unless periodic is set to true.
     * @method later
     * @since 2.4.0
     * @param when {int} the number of milliseconds to wait until the fn 
     * is executed
     * @param o the context object
     * @param fn {Function|String} the function to execute or the name of 
     * the method in the 'o' object to execute
     * @param data [Array] data that is provided to the function.  This accepts
     * either a single item or an array.  If an array is provided, the
     * function is executed with one parameter for each array item.  If
     * you need to pass a single array parameter, it needs to be wrapped in
     * an array [myarray]
     * @param periodic {boolean} if true, executes continuously at supplied 
     * interval until canceled
     * @return a timer object. Call the cancel() method on this object to 
     * stop the timer.
     */
    later: function(when, o, fn, data, periodic) {
        when = when || 0; 
        o = o || {};
        var m=fn, d=data, f, r;

        if (L.isString(fn)) {
            m = o[fn];
        }

        if (!m) {
            throw new TypeError("method undefined");
        }

        if (d && !L.isArray(d)) {
            d = [data];
        }

        f = function() {
            m.apply(o, d || NOTHING);
        };

        r = (periodic) ? setInterval(f, when) : setTimeout(f, when);

        return {
            interval: periodic,
            cancel: function() {
                if (this.interval) {
                    clearInterval(r);
                } else {
                    clearTimeout(r);
                }
            }
        };
    },
    
    /**
     * A convenience method for detecting a legitimate non-null value.
     * Returns false for null/undefined/NaN, true for other values, 
     * including 0/false/''
     * @method isValue
     * @since 2.3.0
     * @param o {any} the item to test
     * @return {boolean} true if it is not null/undefined/NaN || false
     */
    isValue: function(o) {
        // return (o || o === false || o === 0 || o === ''); // Infinity fails
return (L.isObject(o) || L.isString(o) || L.isNumber(o) || L.isBoolean(o));
    }

};

/**
 * Determines whether or not the property was added
 * to the object instance.  Returns false if the property is not present
 * in the object, or was inherited from the prototype.
 * This abstraction is provided to enable hasOwnProperty for Safari 1.3.x.
 * There is a discrepancy between YAHOO.lang.hasOwnProperty and
 * Object.prototype.hasOwnProperty when the property is a primitive added to
 * both the instance AND prototype with the same value:
 * <pre>
 * var A = function() {};
 * A.prototype.foo = 'foo';
 * var a = new A();
 * a.foo = 'foo';
 * alert(a.hasOwnProperty('foo')); // true
 * alert(YAHOO.lang.hasOwnProperty(a, 'foo')); // false when using fallback
 * </pre>
 * @method hasOwnProperty
 * @param {any} o The object being testing
 * @param prop {string} the name of the property to test
 * @return {boolean} the result
 */
L.hasOwnProperty = (OP.hasOwnProperty) ?
    function(o, prop) {
        return o && o.hasOwnProperty(prop);
    } : function(o, prop) {
        return !L.isUndefined(o[prop]) && 
                o.constructor.prototype[prop] !== o[prop];
    };

// new lang wins
OB.augmentObject(L, OB, true);

/*
 * An alias for <a href="YAHOO.lang.html">YAHOO.lang</a>
 * @class YAHOO.util.Lang
 */
YAHOO.util.Lang = L;
 
/**
 * Same as YAHOO.lang.augmentObject, except it only applies prototype 
 * properties.  This is an alias for augmentProto.
 * @see YAHOO.lang.augmentObject
 * @method augment
 * @static
 * @param {Function} r  the object to receive the augmentation
 * @param {Function} s  the object that supplies the properties to augment
 * @param {String*|boolean}  arguments zero or more properties methods to 
 *        augment the receiver with.  If none specified, everything
 *        in the supplier will be used unless it would
 *        overwrite an existing property in the receiver.  if true
 *        is specified as the third parameter, all properties will
 *        be applied and will overwrite an existing property in
 *        the receiver
 */
L.augment = L.augmentProto;

/**
 * An alias for <a href="YAHOO.lang.html#augment">YAHOO.lang.augment</a>
 * @for YAHOO
 * @method augment
 * @static
 * @param {Function} r  the object to receive the augmentation
 * @param {Function} s  the object that supplies the properties to augment
 * @param {String*}  arguments zero or more properties methods to 
 *        augment the receiver with.  If none specified, everything
 *        in the supplier will be used unless it would
 *        overwrite an existing property in the receiver
 */
YAHOO.augment = L.augmentProto;
       
/**
 * An alias for <a href="YAHOO.lang.html#extend">YAHOO.lang.extend</a>
 * @method extend
 * @static
 * @param {Function} subc   the object to modify
 * @param {Function} superc the object to inherit
 * @param {Object} overrides  additional properties/methods to add to the
 *        subclass prototype.  These will override the
 *        matching items obtained from the superclass if present.
 */
YAHOO.extend = L.extend;

})();
YAHOO.register("yahoo", YAHOO, {version: "2.8.0r4", build: "2446"});
/*
Copyright (c) 2009, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://developer.yahoo.net/yui/license.txt
version: 2.8.0r4
*/

/**
 * The CustomEvent class lets you define events for your application
 * that can be subscribed to by one or more independent component.
 *
 * @param {String}  type The type of event, which is passed to the callback
 *                  when the event fires
 * @param {Object}  context The context the event will fire from.  "this" will
 *                  refer to this object in the callback.  Default value: 
 *                  the window object.  The listener can override this.
 * @param {boolean} silent pass true to prevent the event from writing to
 *                  the debugsystem
 * @param {int}     signature the signature that the custom event subscriber
 *                  will receive. YAHOO.util.CustomEvent.LIST or 
 *                  YAHOO.util.CustomEvent.FLAT.  The default is
 *                  YAHOO.util.CustomEvent.LIST.
 * @param fireOnce {boolean} If configured to fire once, the custom event 
 * will only notify subscribers a single time regardless of how many times 
 * the event is fired.  In addition, new subscribers will be notified 
 * immediately if the event has already been fired.
 * @namespace YAHOO.util
 * @class CustomEvent
 * @constructor
 */
YAHOO.util.CustomEvent = function(type, context, silent, signature, fireOnce) {

    /**
     * The type of event, returned to subscribers when the event fires
     * @property type
     * @type string
     */
    this.type = type;

    /**
     * The context the event will fire from by default. Defaults to the window obj.
     * @property scope
     * @type object
     */
    this.scope = context || window;

    /**
     * By default all custom events are logged in the debug build. Set silent to true 
     * to disable debug output for this event.
     * @property silent
     * @type boolean
     */
    this.silent = silent;

    /**
     * If configured to fire once, the custom event will only notify subscribers
     * a single time regardless of how many times the event is fired.  In addition,
     * new subscribers will be notified immediately if the event has already been
     * fired.
     * @property fireOnce
     * @type boolean
     * @default false
     */
    this.fireOnce = fireOnce;

    /**
     * Indicates whether or not this event has ever been fired.
     * @property fired
     * @type boolean
     * @default false
     */
    this.fired = false;

    /**
     * For fireOnce events the arguments the event was fired with are stored
     * so that new subscribers get the proper payload.
     * @property firedWith
     * @type Array
     */
    this.firedWith = null;

    /**
     * Custom events support two styles of arguments provided to the event
     * subscribers.  
     * <ul>
     * <li>YAHOO.util.CustomEvent.LIST: 
     *   <ul>
     *   <li>param1: event name</li>
     *   <li>param2: array of arguments sent to fire</li>
     *   <li>param3: <optional> a custom object supplied by the subscriber</li>
     *   </ul>
     * </li>
     * <li>YAHOO.util.CustomEvent.FLAT
     *   <ul>
     *   <li>param1: the first argument passed to fire.  If you need to
     *           pass multiple parameters, use and array or object literal</li>
     *   <li>param2: <optional> a custom object supplied by the subscriber</li>
     *   </ul>
     * </li>
     * </ul>
     *   @property signature
     *   @type int
     */
    this.signature = signature || YAHOO.util.CustomEvent.LIST;

    /**
     * The subscribers to this event
     * @property subscribers
     * @type Subscriber[]
     */
    this.subscribers = [];

    if (!this.silent) {
    }

    var onsubscribeType = "_YUICEOnSubscribe";

    // Only add subscribe events for events that are not generated by 
    // CustomEvent
    if (type !== onsubscribeType) {

        /**
         * Custom events provide a custom event that fires whenever there is
         * a new subscriber to the event.  This provides an opportunity to
         * handle the case where there is a non-repeating event that has
         * already fired has a new subscriber.  
         *
         * @event subscribeEvent
         * @type YAHOO.util.CustomEvent
         * @param fn {Function} The function to execute
         * @param obj <Object> An object to be passed along when the event fires. 
         * Defaults to the custom event.
         * @param override <boolean|Object> If true, the obj passed in becomes the 
         * execution context of the listener. If an object, that object becomes 
         * the execution context. Defaults to the custom event.
         */
        this.subscribeEvent = 
                new YAHOO.util.CustomEvent(onsubscribeType, this, true);

    } 


    /**
     * In order to make it possible to execute the rest of the subscriber
     * stack when one thows an exception, the subscribers exceptions are
     * caught.  The most recent exception is stored in this property
     * @property lastError
     * @type Error
     */
    this.lastError = null;
};

/**
 * Subscriber listener sigature constant.  The LIST type returns three
 * parameters: the event type, the array of args passed to fire, and
 * the optional custom object
 * @property YAHOO.util.CustomEvent.LIST
 * @static
 * @type int
 */
YAHOO.util.CustomEvent.LIST = 0;

/**
 * Subscriber listener sigature constant.  The FLAT type returns two
 * parameters: the first argument passed to fire and the optional 
 * custom object
 * @property YAHOO.util.CustomEvent.FLAT
 * @static
 * @type int
 */
YAHOO.util.CustomEvent.FLAT = 1;

YAHOO.util.CustomEvent.prototype = {

    /**
     * Subscribes the caller to this event
     * @method subscribe
     * @param {Function} fn        The function to execute
     * @param {Object}   obj       An object to be passed along when the event fires.
     * overrideContext <boolean|Object> If true, the obj passed in becomes the execution 
     * context of the listener. If an object, that object becomes the execution context.
     */
    subscribe: function(fn, obj, overrideContext) {

        if (!fn) {
throw new Error("Invalid callback for subscriber to '" + this.type + "'");
        }

        if (this.subscribeEvent) {
            this.subscribeEvent.fire(fn, obj, overrideContext);
        }

        var s = new YAHOO.util.Subscriber(fn, obj, overrideContext);

        if (this.fireOnce && this.fired) {
            this.notify(s, this.firedWith);
        } else {
            this.subscribers.push(s);
        }
    },

    /**
     * Unsubscribes subscribers.
     * @method unsubscribe
     * @param {Function} fn  The subscribed function to remove, if not supplied
     *                       all will be removed
     * @param {Object}   obj  The custom object passed to subscribe.  This is
     *                        optional, but if supplied will be used to
     *                        disambiguate multiple listeners that are the same
     *                        (e.g., you subscribe many object using a function
     *                        that lives on the prototype)
     * @return {boolean} True if the subscriber was found and detached.
     */
    unsubscribe: function(fn, obj) {

        if (!fn) {
            return this.unsubscribeAll();
        }

        var found = false;
        for (var i=0, len=this.subscribers.length; i<len; ++i) {
            var s = this.subscribers[i];
            if (s && s.contains(fn, obj)) {
                this._delete(i);
                found = true;
            }
        }

        return found;
    },

    /**
     * Notifies the subscribers.  The callback functions will be executed
     * from the context specified when the event was created, and with the 
     * following parameters:
     *   <ul>
     *   <li>The type of event</li>
     *   <li>All of the arguments fire() was executed with as an array</li>
     *   <li>The custom object (if any) that was passed into the subscribe() 
     *       method</li>
     *   </ul>
     * @method fire 
     * @param {Object*} arguments an arbitrary set of parameters to pass to 
     *                            the handler.
     * @return {boolean} false if one of the subscribers returned false, 
     *                   true otherwise
     */
    fire: function() {

        this.lastError = null;

        var errors = [],
            len=this.subscribers.length;


        var args=[].slice.call(arguments, 0), ret=true, i, rebuild=false;

        if (this.fireOnce) {
            if (this.fired) {
                return true;
            } else {
                this.firedWith = args;
            }
        }

        this.fired = true;

        if (!len && this.silent) {
            return true;
        }

        if (!this.silent) {
        }

        // make a copy of the subscribers so that there are
        // no index problems if one subscriber removes another.
        var subs = this.subscribers.slice();

        for (i=0; i<len; ++i) {
            var s = subs[i];
            if (!s) {
                rebuild=true;
            } else {

                ret = this.notify(s, args);

                if (false === ret) {
                    if (!this.silent) {
                    }

                    break;
                }
            }
        }

        return (ret !== false);
    },

    notify: function(s, args) {

        var ret, param=null, scope = s.getScope(this.scope),
                 throwErrors = YAHOO.util.Event.throwErrors;

        if (!this.silent) {
        }

        if (this.signature == YAHOO.util.CustomEvent.FLAT) {

            if (args.length > 0) {
                param = args[0];
            }

            try {
                ret = s.fn.call(scope, param, s.obj);
            } catch(e) {
                this.lastError = e;
                // errors.push(e);
                if (throwErrors) {
                    throw e;
                }
            }
        } else {
            try {
                ret = s.fn.call(scope, this.type, args, s.obj);
            } catch(ex) {
                this.lastError = ex;
                if (throwErrors) {
                    throw ex;
                }
            }
        }

        return ret;
    },

    /**
     * Removes all listeners
     * @method unsubscribeAll
     * @return {int} The number of listeners unsubscribed
     */
    unsubscribeAll: function() {
        var l = this.subscribers.length, i;
        for (i=l-1; i>-1; i--) {
            this._delete(i);
        }

        this.subscribers=[];

        return l;
    },

    /**
     * @method _delete
     * @private
     */
    _delete: function(index) {
        var s = this.subscribers[index];
        if (s) {
            delete s.fn;
            delete s.obj;
        }

        // this.subscribers[index]=null;
        this.subscribers.splice(index, 1);
    },

    /**
     * @method toString
     */
    toString: function() {
         return "CustomEvent: " + "'" + this.type  + "', " + 
             "context: " + this.scope;

    }
};

/////////////////////////////////////////////////////////////////////

/**
 * Stores the subscriber information to be used when the event fires.
 * @param {Function} fn       The function to execute
 * @param {Object}   obj      An object to be passed along when the event fires
 * @param {boolean}  overrideContext If true, the obj passed in becomes the execution
 *                            context of the listener
 * @class Subscriber
 * @constructor
 */
YAHOO.util.Subscriber = function(fn, obj, overrideContext) {

    /**
     * The callback that will be execute when the event fires
     * @property fn
     * @type function
     */
    this.fn = fn;

    /**
     * An optional custom object that will passed to the callback when
     * the event fires
     * @property obj
     * @type object
     */
    this.obj = YAHOO.lang.isUndefined(obj) ? null : obj;

    /**
     * The default execution context for the event listener is defined when the
     * event is created (usually the object which contains the event).
     * By setting overrideContext to true, the execution context becomes the custom
     * object passed in by the subscriber.  If overrideContext is an object, that 
     * object becomes the context.
     * @property overrideContext
     * @type boolean|object
     */
    this.overrideContext = overrideContext;

};

/**
 * Returns the execution context for this listener.  If overrideContext was set to true
 * the custom obj will be the context.  If overrideContext is an object, that is the
 * context, otherwise the default context will be used.
 * @method getScope
 * @param {Object} defaultScope the context to use if this listener does not
 *                              override it.
 */
YAHOO.util.Subscriber.prototype.getScope = function(defaultScope) {
    if (this.overrideContext) {
        if (this.overrideContext === true) {
            return this.obj;
        } else {
            return this.overrideContext;
        }
    }
    return defaultScope;
};

/**
 * Returns true if the fn and obj match this objects properties.
 * Used by the unsubscribe method to match the right subscriber.
 *
 * @method contains
 * @param {Function} fn the function to execute
 * @param {Object} obj an object to be passed along when the event fires
 * @return {boolean} true if the supplied arguments match this 
 *                   subscriber's signature.
 */
YAHOO.util.Subscriber.prototype.contains = function(fn, obj) {
    if (obj) {
        return (this.fn == fn && this.obj == obj);
    } else {
        return (this.fn == fn);
    }
};

/**
 * @method toString
 */
YAHOO.util.Subscriber.prototype.toString = function() {
    return "Subscriber { obj: " + this.obj  + 
           ", overrideContext: " +  (this.overrideContext || "no") + " }";
};

/**
 * The Event Utility provides utilities for managing DOM Events and tools
 * for building event systems
 *
 * @module event
 * @title Event Utility
 * @namespace YAHOO.util
 * @requires yahoo
 */

// The first instance of Event will win if it is loaded more than once.
// @TODO this needs to be changed so that only the state data that needs to
// be preserved is kept, while methods are overwritten/added as needed.
// This means that the module pattern can't be used.
if (!YAHOO.util.Event) {

/**
 * The event utility provides functions to add and remove event listeners,
 * event cleansing.  It also tries to automatically remove listeners it
 * registers during the unload event.
 *
 * @class Event
 * @static
 */
    YAHOO.util.Event = function() {

        /**
         * True after the onload event has fired
         * @property loadComplete
         * @type boolean
         * @static
         * @private
         */
        var loadComplete =  false,

        /**
         * Cache of wrapped listeners
         * @property listeners
         * @type array
         * @static
         * @private
         */
        listeners = [],


        /**
         * User-defined unload function that will be fired before all events
         * are detached
         * @property unloadListeners
         * @type array
         * @static
         * @private
         */
        unloadListeners = [],

        /**
         * The number of times to poll after window.onload.  This number is
         * increased if additional late-bound handlers are requested after
         * the page load.
         * @property retryCount
         * @static
         * @private
         */
        retryCount = 0,

        /**
         * onAvailable listeners
         * @property onAvailStack
         * @static
         * @private
         */
        onAvailStack = [],

        /**
         * Counter for auto id generation
         * @property counter
         * @static
         * @private
         */
        counter = 0,
        
        /**
         * Normalized keycodes for webkit/safari
         * @property webkitKeymap
         * @type {int: int}
         * @private
         * @static
         * @final
         */
         webkitKeymap = {
            63232: 38, // up
            63233: 40, // down
            63234: 37, // left
            63235: 39, // right
            63276: 33, // page up
            63277: 34, // page down
            25: 9      // SHIFT-TAB (Safari provides a different key code in
                       // this case, even though the shiftKey modifier is set)
        },

		isIE = YAHOO.env.ua.ie,

        // String constants used by the addFocusListener and removeFocusListener methods
		
       	FOCUSIN = "focusin",
       	FOCUSOUT = "focusout";

        return {

            /**
             * The number of times we should look for elements that are not
             * in the DOM at the time the event is requested after the document
             * has been loaded.  The default is 500@amp;40 ms, so it will poll
             * for 20 seconds or until all outstanding handlers are bound
             * (whichever comes first).
             * @property POLL_RETRYS
             * @type int
             * @static
             * @final
             */
            POLL_RETRYS: 500,

            /**
             * The poll interval in milliseconds
             * @property POLL_INTERVAL
             * @type int
             * @static
             * @final
             */
            POLL_INTERVAL: 40,

            /**
             * Element to bind, int constant
             * @property EL
             * @type int
             * @static
             * @final
             */
            EL: 0,

            /**
             * Type of event, int constant
             * @property TYPE
             * @type int
             * @static
             * @final
             */
            TYPE: 1,

            /**
             * Function to execute, int constant
             * @property FN
             * @type int
             * @static
             * @final
             */
            FN: 2,

            /**
             * Function wrapped for context correction and cleanup, int constant
             * @property WFN
             * @type int
             * @static
             * @final
             */
            WFN: 3,

            /**
             * Object passed in by the user that will be returned as a 
             * parameter to the callback, int constant.  Specific to
             * unload listeners
             * @property OBJ
             * @type int
             * @static
             * @final
             */
            UNLOAD_OBJ: 3,

            /**
             * Adjusted context, either the element we are registering the event
             * on or the custom object passed in by the listener, int constant
             * @property ADJ_SCOPE
             * @type int
             * @static
             * @final
             */
            ADJ_SCOPE: 4,

            /**
             * The original obj passed into addListener
             * @property OBJ
             * @type int
             * @static
             * @final
             */
            OBJ: 5,

            /**
             * The original context parameter passed into addListener
             * @property OVERRIDE
             * @type int
             * @static
             * @final
             */
            OVERRIDE: 6,

            /**
             * The original capture parameter passed into addListener
             * @property CAPTURE
             * @type int
             * @static
             * @final
             */
			CAPTURE: 7,

            /**
             * addListener/removeListener can throw errors in unexpected scenarios.
             * These errors are suppressed, the method returns false, and this property
             * is set
             * @property lastError
             * @static
             * @type Error
             */
            lastError: null,

            /**
             * Safari detection
             * @property isSafari
             * @private
             * @static
             * @deprecated use YAHOO.env.ua.webkit
             */
            isSafari: YAHOO.env.ua.webkit,
            
            /**
             * webkit version
             * @property webkit
             * @type string
             * @private
             * @static
             * @deprecated use YAHOO.env.ua.webkit
             */
            webkit: YAHOO.env.ua.webkit,
            
            /**
             * IE detection 
             * @property isIE
             * @private
             * @static
             * @deprecated use YAHOO.env.ua.ie
             */
            isIE: isIE,

            /**
             * poll handle
             * @property _interval
             * @static
             * @private
             */
            _interval: null,

            /**
             * document readystate poll handle
             * @property _dri
             * @static
             * @private
             */
             _dri: null,


            /**
             * Map of special event types
             * @property _specialTypes
             * @static
             * @private
             */
			_specialTypes: {
				focusin: (isIE ? "focusin" : "focus"),
				focusout: (isIE ? "focusout" : "blur")
			},


            /**
             * True when the document is initially usable
             * @property DOMReady
             * @type boolean
             * @static
             */
            DOMReady: false,

            /**
             * Errors thrown by subscribers of custom events are caught
             * and the error message is written to the debug console.  If
             * this property is set to true, it will also re-throw the
             * error.
             * @property throwErrors
             * @type boolean
             * @default false
             */
            throwErrors: false,


            /**
             * @method startInterval
             * @static
             * @private
             */
            startInterval: function() {
                if (!this._interval) {
                    // var self = this;
                    // var callback = function() { self._tryPreloadAttach(); };
                    // this._interval = setInterval(callback, this.POLL_INTERVAL);
                    this._interval = YAHOO.lang.later(this.POLL_INTERVAL, this, this._tryPreloadAttach, null, true);
                }
            },

            /**
             * Executes the supplied callback when the item with the supplied
             * id is found.  This is meant to be used to execute behavior as
             * soon as possible as the page loads.  If you use this after the
             * initial page load it will poll for a fixed time for the element.
             * The number of times it will poll and the frequency are
             * configurable.  By default it will poll for 10 seconds.
             *
             * <p>The callback is executed with a single parameter:
             * the custom object parameter, if provided.</p>
             *
             * @method onAvailable
             *
             * @param {string||string[]}   id the id of the element, or an array
             * of ids to look for.
             * @param {function} fn what to execute when the element is found.
             * @param {object}   obj an optional object to be passed back as
             *                   a parameter to fn.
             * @param {boolean|object}  overrideContext If set to true, fn will execute
             *                   in the context of obj, if set to an object it
             *                   will execute in the context of that object
             * @param checkContent {boolean} check child node readiness (onContentReady)
             * @static
             */
            onAvailable: function(id, fn, obj, overrideContext, checkContent) {

                var a = (YAHOO.lang.isString(id)) ? [id] : id;

                for (var i=0; i<a.length; i=i+1) {
                    onAvailStack.push({id:         a[i], 
                                       fn:         fn, 
                                       obj:        obj, 
                                       overrideContext:   overrideContext, 
                                       checkReady: checkContent });
                }

                retryCount = this.POLL_RETRYS;

                this.startInterval();
            },

            /**
             * Works the same way as onAvailable, but additionally checks the
             * state of sibling elements to determine if the content of the
             * available element is safe to modify.
             *
             * <p>The callback is executed with a single parameter:
             * the custom object parameter, if provided.</p>
             *
             * @method onContentReady
             *
             * @param {string}   id the id of the element to look for.
             * @param {function} fn what to execute when the element is ready.
             * @param {object}   obj an optional object to be passed back as
             *                   a parameter to fn.
             * @param {boolean|object}  overrideContext If set to true, fn will execute
             *                   in the context of obj.  If an object, fn will
             *                   exectute in the context of that object
             *
             * @static
             */
            onContentReady: function(id, fn, obj, overrideContext) {
                this.onAvailable(id, fn, obj, overrideContext, true);
            },

            /**
             * Executes the supplied callback when the DOM is first usable.  This
             * will execute immediately if called after the DOMReady event has
             * fired.   @todo the DOMContentReady event does not fire when the
             * script is dynamically injected into the page.  This means the
             * DOMReady custom event will never fire in FireFox or Opera when the
             * library is injected.  It _will_ fire in Safari, and the IE 
             * implementation would allow for us to fire it if the defered script
             * is not available.  We want this to behave the same in all browsers.
             * Is there a way to identify when the script has been injected 
             * instead of included inline?  Is there a way to know whether the 
             * window onload event has fired without having had a listener attached 
             * to it when it did so?
             *
             * <p>The callback is a CustomEvent, so the signature is:</p>
             * <p>type &lt;string&gt;, args &lt;array&gt;, customobject &lt;object&gt;</p>
             * <p>For DOMReady events, there are no fire argments, so the
             * signature is:</p>
             * <p>"DOMReady", [], obj</p>
             *
             *
             * @method onDOMReady
             *
             * @param {function} fn what to execute when the element is found.
             * @param {object}   obj an optional object to be passed back as
             *                   a parameter to fn.
             * @param {boolean|object}  overrideContext If set to true, fn will execute
             *                   in the context of obj, if set to an object it
             *                   will execute in the context of that object
             *
             * @static
             */
            // onDOMReady: function(fn, obj, overrideContext) {
            onDOMReady: function() {
                this.DOMReadyEvent.subscribe.apply(this.DOMReadyEvent, arguments);
            },


            /**
             * Appends an event handler
             *
             * @method _addListener
             *
             * @param {String|HTMLElement|Array|NodeList} el An id, an element 
             *  reference, or a collection of ids and/or elements to assign the 
             *  listener to.
             * @param {String}   sType     The type of event to append
             * @param {Function} fn        The method the event invokes
             * @param {Object}   obj    An arbitrary object that will be 
             *                             passed as a parameter to the handler
             * @param {Boolean|object}  overrideContext  If true, the obj passed in becomes
             *                             the execution context of the listener. If an
             *                             object, this object becomes the execution
             *                             context.
             * @param {boolen}      capture capture or bubble phase
             * @return {Boolean} True if the action was successful or defered,
             *                        false if one or more of the elements 
             *                        could not have the listener attached,
             *                        or if the operation throws an exception.
             * @private
             * @static
             */
            _addListener: function(el, sType, fn, obj, overrideContext, bCapture) {

                if (!fn || !fn.call) {
                    return false;
                }

                // The el argument can be an array of elements or element ids.
                if ( this._isValidCollection(el)) {
                    var ok = true;
                    for (var i=0,len=el.length; i<len; ++i) {
                        ok = this.on(el[i], 
                                       sType, 
                                       fn, 
                                       obj, 
                                       overrideContext) && ok;
                    }
                    return ok;

                } else if (YAHOO.lang.isString(el)) {
                    var oEl = this.getEl(el);
                    // If the el argument is a string, we assume it is 
                    // actually the id of the element.  If the page is loaded
                    // we convert el to the actual element, otherwise we 
                    // defer attaching the event until onload event fires

                    // check to see if we need to delay hooking up the event 
                    // until after the page loads.
                    if (oEl) {
                        el = oEl;
                    } else {
                        // defer adding the event until the element is available
                        this.onAvailable(el, function() {
                           YAHOO.util.Event._addListener(el, sType, fn, obj, overrideContext, bCapture);
                        });

                        return true;
                    }
                }

                // Element should be an html element or an array if we get 
                // here.
                if (!el) {
                    return false;
                }

                // we need to make sure we fire registered unload events 
                // prior to automatically unhooking them.  So we hang on to 
                // these instead of attaching them to the window and fire the
                // handles explicitly during our one unload event.
                if ("unload" == sType && obj !== this) {
                    unloadListeners[unloadListeners.length] =
                            [el, sType, fn, obj, overrideContext];
                    return true;
                }


                // if the user chooses to override the context, we use the custom
                // object passed in, otherwise the executing context will be the
                // HTML element that the event is registered on
                var context = el;
                if (overrideContext) {
                    if (overrideContext === true) {
                        context = obj;
                    } else {
                        context = overrideContext;
                    }
                }

                // wrap the function so we can return the obj object when
                // the event fires;
                var wrappedFn = function(e) {
                        return fn.call(context, YAHOO.util.Event.getEvent(e, el), 
                                obj);
                    };

                var li = [el, sType, fn, wrappedFn, context, obj, overrideContext, bCapture];
                var index = listeners.length;
                // cache the listener so we can try to automatically unload
                listeners[index] = li;

                try {
                    this._simpleAdd(el, sType, wrappedFn, bCapture);
                } catch(ex) {
                    // handle an error trying to attach an event.  If it fails
                    // we need to clean up the cache
                    this.lastError = ex;
                    this.removeListener(el, sType, fn);
                    return false;
                }

                return true;
                
            },

            /**
             * Checks to see if the type requested is a special type 
			 * (as defined by the _specialTypes hash), and (if so) returns 
			 * the special type name.
             *
             * @method _getType
             *
             * @param {String}   sType     The type to look up
             * @private
             */
			_getType: function (type) {
			
				return this._specialTypes[type] || type;
				
			},


            /**
             * Appends an event handler
             *
             * @method addListener
             *
             * @param {String|HTMLElement|Array|NodeList} el An id, an element 
             *  reference, or a collection of ids and/or elements to assign the 
             *  listener to.
             * @param {String}   sType     The type of event to append
             * @param {Function} fn        The method the event invokes
             * @param {Object}   obj    An arbitrary object that will be 
             *                             passed as a parameter to the handler
             * @param {Boolean|object}  overrideContext  If true, the obj passed in becomes
             *                             the execution context of the listener. If an
             *                             object, this object becomes the execution
             *                             context.
             * @return {Boolean} True if the action was successful or defered,
             *                        false if one or more of the elements 
             *                        could not have the listener attached,
             *                        or if the operation throws an exception.
             * @static
             */
            addListener: function (el, sType, fn, obj, overrideContext) {

				var capture = ((sType == FOCUSIN || sType == FOCUSOUT) && !YAHOO.env.ua.ie) ? true : false;

                return this._addListener(el, this._getType(sType), fn, obj, overrideContext, capture);

        	},


            /**
             * Attaches a focusin event listener to the specified element for 
 			 * the purpose of listening for the focus event on the element's 
             * descendants.
             * @method addFocusListener
             *
             * @param {String|HTMLElement|Array|NodeList} el An id, an element 
             *  reference, or a collection of ids and/or elements to assign the 
             *  listener to.
             * @param {Function} fn        The method the event invokes
             * @param {Object}   obj    An arbitrary object that will be 
             *                             passed as a parameter to the handler
             * @param {Boolean|object}  overrideContext  If true, the obj passed in becomes
             *                             the execution context of the listener. If an
             *                             object, this object becomes the execution
             *                             context.
             * @return {Boolean} True if the action was successful or defered,
             *                        false if one or more of the elements 
             *                        could not have the listener attached,
             *                        or if the operation throws an exception.
             * @static
			* @deprecated use YAHOO.util.Event.on and specify "focusin" as the event type.
             */
            addFocusListener: function (el, fn, obj, overrideContext) {
                return this.on(el, FOCUSIN, fn, obj, overrideContext);
            },          


            /**
             * Removes a focusin event listener to the specified element for 
			 * the purpose of listening for the focus event on the element's 
             * descendants.
             *
             * @method removeFocusListener
             *
             * @param {String|HTMLElement|Array|NodeList} el An id, an element 
             *  reference, or a collection of ids and/or elements to remove
             *  the listener from.
             * @param {Function} fn the method the event invokes.  If fn is
             *  undefined, then all event handlers for the type of event are 
             *  removed.
             * @return {boolean} true if the unbind was successful, false 
             *  otherwise.
             * @static
         	 * @deprecated use YAHOO.util.Event.removeListener and specify "focusin" as the event type.
             */
            removeFocusListener: function (el, fn) { 
                return this.removeListener(el, FOCUSIN, fn);
            },

            /**
             * Attaches a focusout event listener to the specified element for 
			 * the purpose of listening for the blur event on the element's 
			 * descendants.
             *
             * @method addBlurListener
             *
             * @param {String|HTMLElement|Array|NodeList} el An id, an element 
             *  reference, or a collection of ids and/or elements to assign the 
             *  listener to.
             * @param {Function} fn        The method the event invokes
             * @param {Object}   obj    An arbitrary object that will be 
             *                             passed as a parameter to the handler
             * @param {Boolean|object}  overrideContext  If true, the obj passed in becomes
             *                             the execution context of the listener. If an
             *                             object, this object becomes the execution
             *                             context.
             * @return {Boolean} True if the action was successful or defered,
             *                        false if one or more of the elements 
             *                        could not have the listener attached,
             *                        or if the operation throws an exception.
             * @static
         	 * @deprecated use YAHOO.util.Event.on and specify "focusout" as the event type.
             */
            addBlurListener: function (el, fn, obj, overrideContext) {
                return this.on(el, FOCUSOUT, fn, obj, overrideContext);
            },          

            /**
             * Removes a focusout event listener to the specified element for 
			 * the purpose of listening for the blur event on the element's 
			 * descendants.
             *
             * @method removeBlurListener
             *
             * @param {String|HTMLElement|Array|NodeList} el An id, an element 
             *  reference, or a collection of ids and/or elements to remove
             *  the listener from.
             * @param {Function} fn the method the event invokes.  If fn is
             *  undefined, then all event handlers for the type of event are 
             *  removed.
             * @return {boolean} true if the unbind was successful, false 
             *  otherwise.
             * @static
         	 * @deprecated use YAHOO.util.Event.removeListener and specify "focusout" as the event type.
             */
            removeBlurListener: function (el, fn) { 
                return this.removeListener(el, FOCUSOUT, fn);
            },

            /**
             * Removes an event listener
             *
             * @method removeListener
             *
             * @param {String|HTMLElement|Array|NodeList} el An id, an element 
             *  reference, or a collection of ids and/or elements to remove
             *  the listener from.
             * @param {String} sType the type of event to remove.
             * @param {Function} fn the method the event invokes.  If fn is
             *  undefined, then all event handlers for the type of event are 
             *  removed.
             * @return {boolean} true if the unbind was successful, false 
             *  otherwise.
             * @static
             */
            removeListener: function(el, sType, fn) {
                var i, len, li;

				sType = this._getType(sType);

                // The el argument can be a string
                if (typeof el == "string") {
                    el = this.getEl(el);
                // The el argument can be an array of elements or element ids.
                } else if ( this._isValidCollection(el)) {
                    var ok = true;
                    for (i=el.length-1; i>-1; i--) {
                        ok = ( this.removeListener(el[i], sType, fn) && ok );
                    }
                    return ok;
                }

                if (!fn || !fn.call) {
                    //return false;
                    return this.purgeElement(el, false, sType);
                }

                if ("unload" == sType) {

                    for (i=unloadListeners.length-1; i>-1; i--) {
                        li = unloadListeners[i];
                        if (li && 
                            li[0] == el && 
                            li[1] == sType && 
                            li[2] == fn) {
                                unloadListeners.splice(i, 1);
                                // unloadListeners[i]=null;
                                return true;
                        }
                    }

                    return false;
                }

                var cacheItem = null;

                // The index is a hidden parameter; needed to remove it from
                // the method signature because it was tempting users to
                // try and take advantage of it, which is not possible.
                var index = arguments[3];
  
                if ("undefined" === typeof index) {
                    index = this._getCacheIndex(listeners, el, sType, fn);
                }

                if (index >= 0) {
                    cacheItem = listeners[index];
                }

                if (!el || !cacheItem) {
                    return false;
                }


				var bCapture = cacheItem[this.CAPTURE] === true ? true : false;

                try {
                    this._simpleRemove(el, sType, cacheItem[this.WFN], bCapture);
                } catch(ex) {
                    this.lastError = ex;
                    return false;
                }

                // removed the wrapped handler
                delete listeners[index][this.WFN];
                delete listeners[index][this.FN];
                listeners.splice(index, 1);
                // listeners[index]=null;

                return true;

            },

            /**
             * Returns the event's target element.  Safari sometimes provides
             * a text node, and this is automatically resolved to the text
             * node's parent so that it behaves like other browsers.
             * @method getTarget
             * @param {Event} ev the event
             * @param {boolean} resolveTextNode when set to true the target's
             *                  parent will be returned if the target is a 
             *                  text node.  @deprecated, the text node is
             *                  now resolved automatically
             * @return {HTMLElement} the event's target
             * @static
             */
            getTarget: function(ev, resolveTextNode) {
                var t = ev.target || ev.srcElement;
                return this.resolveTextNode(t);
            },

            /**
             * In some cases, some browsers will return a text node inside
             * the actual element that was targeted.  This normalizes the
             * return value for getTarget and getRelatedTarget.
             * @method resolveTextNode
             * @param {HTMLElement} node node to resolve
             * @return {HTMLElement} the normized node
             * @static
             */
            resolveTextNode: function(n) {
                try {
                    if (n && 3 == n.nodeType) {
                        return n.parentNode;
                    }
                } catch(e) { }

                return n;
            },

            /**
             * Returns the event's pageX
             * @method getPageX
             * @param {Event} ev the event
             * @return {int} the event's pageX
             * @static
             */
            getPageX: function(ev) {
                var x = ev.pageX;
                if (!x && 0 !== x) {
                    x = ev.clientX || 0;

                    if ( this.isIE ) {
                        x += this._getScrollLeft();
                    }
                }

                return x;
            },

            /**
             * Returns the event's pageY
             * @method getPageY
             * @param {Event} ev the event
             * @return {int} the event's pageY
             * @static
             */
            getPageY: function(ev) {
                var y = ev.pageY;
                if (!y && 0 !== y) {
                    y = ev.clientY || 0;

                    if ( this.isIE ) {
                        y += this._getScrollTop();
                    }
                }


                return y;
            },

            /**
             * Returns the pageX and pageY properties as an indexed array.
             * @method getXY
             * @param {Event} ev the event
             * @return {[x, y]} the pageX and pageY properties of the event
             * @static
             */
            getXY: function(ev) {
                return [this.getPageX(ev), this.getPageY(ev)];
            },

            /**
             * Returns the event's related target 
             * @method getRelatedTarget
             * @param {Event} ev the event
             * @return {HTMLElement} the event's relatedTarget
             * @static
             */
            getRelatedTarget: function(ev) {
                var t = ev.relatedTarget;
                if (!t) {
                    if (ev.type == "mouseout") {
                        t = ev.toElement;
                    } else if (ev.type == "mouseover") {
                        t = ev.fromElement;
                    }
                }

                return this.resolveTextNode(t);
            },

            /**
             * Returns the time of the event.  If the time is not included, the
             * event is modified using the current time.
             * @method getTime
             * @param {Event} ev the event
             * @return {Date} the time of the event
             * @static
             */
            getTime: function(ev) {
                if (!ev.time) {
                    var t = new Date().getTime();
                    try {
                        ev.time = t;
                    } catch(ex) { 
                        this.lastError = ex;
                        return t;
                    }
                }

                return ev.time;
            },

            /**
             * Convenience method for stopPropagation + preventDefault
             * @method stopEvent
             * @param {Event} ev the event
             * @static
             */
            stopEvent: function(ev) {
                this.stopPropagation(ev);
                this.preventDefault(ev);
            },

            /**
             * Stops event propagation
             * @method stopPropagation
             * @param {Event} ev the event
             * @static
             */
            stopPropagation: function(ev) {
                if (ev.stopPropagation) {
                    ev.stopPropagation();
                } else {
                    ev.cancelBubble = true;
                }
            },

            /**
             * Prevents the default behavior of the event
             * @method preventDefault
             * @param {Event} ev the event
             * @static
             */
            preventDefault: function(ev) {
                if (ev.preventDefault) {
                    ev.preventDefault();
                } else {
                    ev.returnValue = false;
                }
            },
             
            /**
             * Finds the event in the window object, the caller's arguments, or
             * in the arguments of another method in the callstack.  This is
             * executed automatically for events registered through the event
             * manager, so the implementer should not normally need to execute
             * this function at all.
             * @method getEvent
             * @param {Event} e the event parameter from the handler
             * @param {HTMLElement} boundEl the element the listener is attached to
             * @return {Event} the event 
             * @static
             */
            getEvent: function(e, boundEl) {
                var ev = e || window.event;

                if (!ev) {
                    var c = this.getEvent.caller;
                    while (c) {
                        ev = c.arguments[0];
                        if (ev && Event == ev.constructor) {
                            break;
                        }
                        c = c.caller;
                    }
                }

                return ev;
            },

            /**
             * Returns the charcode for an event
             * @method getCharCode
             * @param {Event} ev the event
             * @return {int} the event's charCode
             * @static
             */
            getCharCode: function(ev) {
                var code = ev.keyCode || ev.charCode || 0;

                // webkit key normalization
                if (YAHOO.env.ua.webkit && (code in webkitKeymap)) {
                    code = webkitKeymap[code];
                }
                return code;
            },

            /**
             * Locating the saved event handler data by function ref
             *
             * @method _getCacheIndex
             * @static
             * @private
             */
            _getCacheIndex: function(a, el, sType, fn) {
                for (var i=0, l=a.length; i<l; i=i+1) {
                    var li = a[i];
                    if ( li                 && 
                         li[this.FN] == fn  && 
                         li[this.EL] == el  && 
                         li[this.TYPE] == sType ) {
                        return i;
                    }
                }

                return -1;
            },

            /**
             * Generates an unique ID for the element if it does not already 
             * have one.
             * @method generateId
             * @param el the element to create the id for
             * @return {string} the resulting id of the element
             * @static
             */
            generateId: function(el) {
                var id = el.id;

                if (!id) {
                    id = "yuievtautoid-" + counter;
                    ++counter;
                    el.id = id;
                }

                return id;
            },


            /**
             * We want to be able to use getElementsByTagName as a collection
             * to attach a group of events to.  Unfortunately, different 
             * browsers return different types of collections.  This function
             * tests to determine if the object is array-like.  It will also 
             * fail if the object is an array, but is empty.
             * @method _isValidCollection
             * @param o the object to test
             * @return {boolean} true if the object is array-like and populated
             * @static
             * @private
             */
            _isValidCollection: function(o) {
                try {
                    return ( o                     && // o is something
                             typeof o !== "string" && // o is not a string
                             o.length              && // o is indexed
                             !o.tagName            && // o is not an HTML element
                             !o.alert              && // o is not a window
                             typeof o[0] !== "undefined" );
                } catch(ex) {
                    return false;
                }

            },

            /**
             * @private
             * @property elCache
             * DOM element cache
             * @static
             * @deprecated Elements are not cached due to issues that arise when
             * elements are removed and re-added
             */
            elCache: {},

            /**
             * We cache elements bound by id because when the unload event 
             * fires, we can no longer use document.getElementById
             * @method getEl
             * @static
             * @private
             * @deprecated Elements are not cached any longer
             */
            getEl: function(id) {
                return (typeof id === "string") ? document.getElementById(id) : id;
            },

            /**
             * Clears the element cache
             * @deprecated Elements are not cached any longer
             * @method clearCache
             * @static
             * @private
             */
            clearCache: function() { },

            /**
             * Custom event the fires when the dom is initially usable
             * @event DOMReadyEvent
             */
            DOMReadyEvent: new YAHOO.util.CustomEvent("DOMReady", YAHOO, 0, 0, 1),

            /**
             * hook up any deferred listeners
             * @method _load
             * @static
             * @private
             */
            _load: function(e) {

                if (!loadComplete) {
                    loadComplete = true;
                    var EU = YAHOO.util.Event;

                    // Just in case DOMReady did not go off for some reason
                    EU._ready();

                    // Available elements may not have been detected before the
                    // window load event fires. Try to find them now so that the
                    // the user is more likely to get the onAvailable notifications
                    // before the window load notification
                    EU._tryPreloadAttach();

                }
            },

            /**
             * Fires the DOMReady event listeners the first time the document is
             * usable.
             * @method _ready
             * @static
             * @private
             */
            _ready: function(e) {
                var EU = YAHOO.util.Event;
                if (!EU.DOMReady) {
                    EU.DOMReady=true;

                    // Fire the content ready custom event
                    EU.DOMReadyEvent.fire();

                    // Remove the DOMContentLoaded (FF/Opera)
                    EU._simpleRemove(document, "DOMContentLoaded", EU._ready);
                }
            },

            /**
             * Polling function that runs before the onload event fires, 
             * attempting to attach to DOM Nodes as soon as they are 
             * available
             * @method _tryPreloadAttach
             * @static
             * @private
             */
            _tryPreloadAttach: function() {

                if (onAvailStack.length === 0) {
                    retryCount = 0;
                    if (this._interval) {
                        // clearInterval(this._interval);
                        this._interval.cancel();
                        this._interval = null;
                    } 
                    return;
                }

                if (this.locked) {
                    return;
                }

                if (this.isIE) {
                    // Hold off if DOMReady has not fired and check current
                    // readyState to protect against the IE operation aborted
                    // issue.
                    if (!this.DOMReady) {
                        this.startInterval();
                        return;
                    }
                }

                this.locked = true;


                // keep trying until after the page is loaded.  We need to 
                // check the page load state prior to trying to bind the 
                // elements so that we can be certain all elements have been 
                // tested appropriately
                var tryAgain = !loadComplete;
                if (!tryAgain) {
                    tryAgain = (retryCount > 0 && onAvailStack.length > 0);
                }

                // onAvailable
                var notAvail = [];

                var executeItem = function (el, item) {
                    var context = el;
                    if (item.overrideContext) {
                        if (item.overrideContext === true) {
                            context = item.obj;
                        } else {
                            context = item.overrideContext;
                        }
                    }
                    item.fn.call(context, item.obj);
                };

                var i, len, item, el, ready=[];

                // onAvailable onContentReady
                for (i=0, len=onAvailStack.length; i<len; i=i+1) {
                    item = onAvailStack[i];
                    if (item) {
                        el = this.getEl(item.id);
                        if (el) {
                            if (item.checkReady) {
                                if (loadComplete || el.nextSibling || !tryAgain) {
                                    ready.push(item);
                                    onAvailStack[i] = null;
                                }
                            } else {
                                executeItem(el, item);
                                onAvailStack[i] = null;
                            }
                        } else {
                            notAvail.push(item);
                        }
                    }
                }
                
                // make sure onContentReady fires after onAvailable
                for (i=0, len=ready.length; i<len; i=i+1) {
                    item = ready[i];
                    executeItem(this.getEl(item.id), item);
                }


                retryCount--;

                if (tryAgain) {
                    for (i=onAvailStack.length-1; i>-1; i--) {
                        item = onAvailStack[i];
                        if (!item || !item.id) {
                            onAvailStack.splice(i, 1);
                        }
                    }

                    this.startInterval();
                } else {
                    if (this._interval) {
                        // clearInterval(this._interval);
                        this._interval.cancel();
                        this._interval = null;
                    }
                }

                this.locked = false;

            },

            /**
             * Removes all listeners attached to the given element via addListener.
             * Optionally, the node's children can also be purged.
             * Optionally, you can specify a specific type of event to remove.
             * @method purgeElement
             * @param {HTMLElement} el the element to purge
             * @param {boolean} recurse recursively purge this element's children
             * as well.  Use with caution.
             * @param {string} sType optional type of listener to purge. If
             * left out, all listeners will be removed
             * @static
             */
            purgeElement: function(el, recurse, sType) {
                var oEl = (YAHOO.lang.isString(el)) ? this.getEl(el) : el;
                var elListeners = this.getListeners(oEl, sType), i, len;
                if (elListeners) {
                    for (i=elListeners.length-1; i>-1; i--) {
                        var l = elListeners[i];
                        this.removeListener(oEl, l.type, l.fn);
                    }
                }

                if (recurse && oEl && oEl.childNodes) {
                    for (i=0,len=oEl.childNodes.length; i<len ; ++i) {
                        this.purgeElement(oEl.childNodes[i], recurse, sType);
                    }
                }
            },

            /**
             * Returns all listeners attached to the given element via addListener.
             * Optionally, you can specify a specific type of event to return.
             * @method getListeners
             * @param el {HTMLElement|string} the element or element id to inspect 
             * @param sType {string} optional type of listener to return. If
             * left out, all listeners will be returned
             * @return {Object} the listener. Contains the following fields:
             * &nbsp;&nbsp;type:   (string)   the type of event
             * &nbsp;&nbsp;fn:     (function) the callback supplied to addListener
             * &nbsp;&nbsp;obj:    (object)   the custom object supplied to addListener
             * &nbsp;&nbsp;adjust: (boolean|object)  whether or not to adjust the default context
             * &nbsp;&nbsp;scope: (boolean)  the derived context based on the adjust parameter
             * &nbsp;&nbsp;index:  (int)      its position in the Event util listener cache
             * @static
             */           
            getListeners: function(el, sType) {
                var results=[], searchLists;
                if (!sType) {
                    searchLists = [listeners, unloadListeners];
                } else if (sType === "unload") {
                    searchLists = [unloadListeners];
                } else {
					sType = this._getType(sType);
                    searchLists = [listeners];
                }

                var oEl = (YAHOO.lang.isString(el)) ? this.getEl(el) : el;

                for (var j=0;j<searchLists.length; j=j+1) {
                    var searchList = searchLists[j];
                    if (searchList) {
                        for (var i=0,len=searchList.length; i<len ; ++i) {
                            var l = searchList[i];
                            if ( l  && l[this.EL] === oEl && 
                                    (!sType || sType === l[this.TYPE]) ) {
                                results.push({
                                    type:   l[this.TYPE],
                                    fn:     l[this.FN],
                                    obj:    l[this.OBJ],
                                    adjust: l[this.OVERRIDE],
                                    scope:  l[this.ADJ_SCOPE],
                                    index:  i
                                });
                            }
                        }
                    }
                }

                return (results.length) ? results : null;
            },

            /**
             * Removes all listeners registered by pe.event.  Called 
             * automatically during the unload event.
             * @method _unload
             * @static
             * @private
             */
            _unload: function(e) {

                var EU = YAHOO.util.Event, i, j, l, len, index,
                         ul = unloadListeners.slice(), context;

                // execute and clear stored unload listeners
                for (i=0, len=unloadListeners.length; i<len; ++i) {
                    l = ul[i];
                    if (l) {
                        context = window;
                        if (l[EU.ADJ_SCOPE]) {
                            if (l[EU.ADJ_SCOPE] === true) {
                                context = l[EU.UNLOAD_OBJ];
                            } else {
                                context = l[EU.ADJ_SCOPE];
                            }
                        }
                        l[EU.FN].call(context, EU.getEvent(e, l[EU.EL]), l[EU.UNLOAD_OBJ] );
                        ul[i] = null;
                    }
                }

                l = null;
                context = null;
                unloadListeners = null;

                // Remove listeners to handle IE memory leaks
                // 2.5.0 listeners are removed for all browsers again.  FireFox preserves
                // at least some listeners between page refreshes, potentially causing
                // errors during page load (mouseover listeners firing before they
                // should if the user moves the mouse at the correct moment).
                if (listeners) {
                    for (j=listeners.length-1; j>-1; j--) {
                        l = listeners[j];
                        if (l) {
                            EU.removeListener(l[EU.EL], l[EU.TYPE], l[EU.FN], j);
                        } 
                    }
                    l=null;
                }

                EU._simpleRemove(window, "unload", EU._unload);

            },

            /**
             * Returns scrollLeft
             * @method _getScrollLeft
             * @static
             * @private
             */
            _getScrollLeft: function() {
                return this._getScroll()[1];
            },

            /**
             * Returns scrollTop
             * @method _getScrollTop
             * @static
             * @private
             */
            _getScrollTop: function() {
                return this._getScroll()[0];
            },

            /**
             * Returns the scrollTop and scrollLeft.  Used to calculate the 
             * pageX and pageY in Internet Explorer
             * @method _getScroll
             * @static
             * @private
             */
            _getScroll: function() {
                var dd = document.documentElement, db = document.body;
                if (dd && (dd.scrollTop || dd.scrollLeft)) {
                    return [dd.scrollTop, dd.scrollLeft];
                } else if (db) {
                    return [db.scrollTop, db.scrollLeft];
                } else {
                    return [0, 0];
                }
            },
            
            /**
             * Used by old versions of CustomEvent, restored for backwards
             * compatibility
             * @method regCE
             * @private
             * @static
             * @deprecated still here for backwards compatibility
             */
            regCE: function() {},

            /**
             * Adds a DOM event directly without the caching, cleanup, context adj, etc
             *
             * @method _simpleAdd
             * @param {HTMLElement} el      the element to bind the handler to
             * @param {string}      sType   the type of event handler
             * @param {function}    fn      the callback to invoke
             * @param {boolen}      capture capture or bubble phase
             * @static
             * @private
             */
            _simpleAdd: function () {
                if (window.addEventListener) {
                    return function(el, sType, fn, capture) {
                        el.addEventListener(sType, fn, (capture));
                    };
                } else if (window.attachEvent) {
                    return function(el, sType, fn, capture) {
                        el.attachEvent("on" + sType, fn);
                    };
                } else {
                    return function(){};
                }
            }(),

            /**
             * Basic remove listener
             *
             * @method _simpleRemove
             * @param {HTMLElement} el      the element to bind the handler to
             * @param {string}      sType   the type of event handler
             * @param {function}    fn      the callback to invoke
             * @param {boolen}      capture capture or bubble phase
             * @static
             * @private
             */
            _simpleRemove: function() {
                if (window.removeEventListener) {
                    return function (el, sType, fn, capture) {
                        el.removeEventListener(sType, fn, (capture));
                    };
                } else if (window.detachEvent) {
                    return function (el, sType, fn) {
                        el.detachEvent("on" + sType, fn);
                    };
                } else {
                    return function(){};
                }
            }()
        };

    }();

    (function() {
        var EU = YAHOO.util.Event;

        /**
         * YAHOO.util.Event.on is an alias for addListener
         * @method on
         * @see addListener
         * @static
         */
        EU.on = EU.addListener;

        /**
         * YAHOO.util.Event.onFocus is an alias for addFocusListener
         * @method onFocus
         * @see addFocusListener
         * @static
		 * @deprecated use YAHOO.util.Event.on and specify "focusin" as the event type.
         */
        EU.onFocus = EU.addFocusListener;

        /**
         * YAHOO.util.Event.onBlur is an alias for addBlurListener
         * @method onBlur
         * @see addBlurListener
         * @static
		 * @deprecated use YAHOO.util.Event.on and specify "focusout" as the event type.
         */     
        EU.onBlur = EU.addBlurListener;

/*! DOMReady: based on work by: Dean Edwards/John Resig/Matthias Miller/Diego Perini */

        // Internet Explorer: use the readyState of a defered script.
        // This isolates what appears to be a safe moment to manipulate
        // the DOM prior to when the document's readyState suggests
        // it is safe to do so.
        if (EU.isIE) {
            if (self !== self.top) {
                document.onreadystatechange = function() {
                    if (document.readyState == 'complete') {
                        document.onreadystatechange = null;
                        EU._ready();
                    }
                };
            } else {

                // Process onAvailable/onContentReady items when the 
                // DOM is ready.
                YAHOO.util.Event.onDOMReady(
                        YAHOO.util.Event._tryPreloadAttach,
                        YAHOO.util.Event, true);
                
                var n = document.createElement('p');  

                EU._dri = setInterval(function() {
                    try {
                        // throws an error if doc is not ready
                        n.doScroll('left');
                        clearInterval(EU._dri);
                        EU._dri = null;
                        EU._ready();
                        n = null;
                    } catch (ex) { 
                    }
                }, EU.POLL_INTERVAL); 
            }

        // The document's readyState in Safari currently will
        // change to loaded/complete before images are loaded.
        } else if (EU.webkit && EU.webkit < 525) {

            EU._dri = setInterval(function() {
                var rs=document.readyState;
                if ("loaded" == rs || "complete" == rs) {
                    clearInterval(EU._dri);
                    EU._dri = null;
                    EU._ready();
                }
            }, EU.POLL_INTERVAL); 

        // FireFox and Opera: These browsers provide a event for this
        // moment.  The latest WebKit releases now support this event.
        } else {

            EU._simpleAdd(document, "DOMContentLoaded", EU._ready);

        }
        /////////////////////////////////////////////////////////////


        EU._simpleAdd(window, "load", EU._load);
        EU._simpleAdd(window, "unload", EU._unload);
        EU._tryPreloadAttach();
    })();

}
/**
 * EventProvider is designed to be used with YAHOO.augment to wrap 
 * CustomEvents in an interface that allows events to be subscribed to 
 * and fired by name.  This makes it possible for implementing code to
 * subscribe to an event that either has not been created yet, or will
 * not be created at all.
 *
 * @Class EventProvider
 */
YAHOO.util.EventProvider = function() { };

YAHOO.util.EventProvider.prototype = {

    /**
     * Private storage of custom events
     * @property __yui_events
     * @type Object[]
     * @private
     */
    __yui_events: null,

    /**
     * Private storage of custom event subscribers
     * @property __yui_subscribers
     * @type Object[]
     * @private
     */
    __yui_subscribers: null,
    
    /**
     * Subscribe to a CustomEvent by event type
     *
     * @method subscribe
     * @param p_type     {string}   the type, or name of the event
     * @param p_fn       {function} the function to exectute when the event fires
     * @param p_obj      {Object}   An object to be passed along when the event 
     *                              fires
     * @param overrideContext {boolean}  If true, the obj passed in becomes the 
     *                              execution scope of the listener
     */
    subscribe: function(p_type, p_fn, p_obj, overrideContext) {

        this.__yui_events = this.__yui_events || {};
        var ce = this.__yui_events[p_type];

        if (ce) {
            ce.subscribe(p_fn, p_obj, overrideContext);
        } else {
            this.__yui_subscribers = this.__yui_subscribers || {};
            var subs = this.__yui_subscribers;
            if (!subs[p_type]) {
                subs[p_type] = [];
            }
            subs[p_type].push(
                { fn: p_fn, obj: p_obj, overrideContext: overrideContext } );
        }
    },

    /**
     * Unsubscribes one or more listeners the from the specified event
     * @method unsubscribe
     * @param p_type {string}   The type, or name of the event.  If the type
     *                          is not specified, it will attempt to remove
     *                          the listener from all hosted events.
     * @param p_fn   {Function} The subscribed function to unsubscribe, if not
     *                          supplied, all subscribers will be removed.
     * @param p_obj  {Object}   The custom object passed to subscribe.  This is
     *                        optional, but if supplied will be used to
     *                        disambiguate multiple listeners that are the same
     *                        (e.g., you subscribe many object using a function
     *                        that lives on the prototype)
     * @return {boolean} true if the subscriber was found and detached.
     */
    unsubscribe: function(p_type, p_fn, p_obj) {
        this.__yui_events = this.__yui_events || {};
        var evts = this.__yui_events;
        if (p_type) {
            var ce = evts[p_type];
            if (ce) {
                return ce.unsubscribe(p_fn, p_obj);
            }
        } else {
            var ret = true;
            for (var i in evts) {
                if (YAHOO.lang.hasOwnProperty(evts, i)) {
                    ret = ret && evts[i].unsubscribe(p_fn, p_obj);
                }
            }
            return ret;
        }

        return false;
    },
    
    /**
     * Removes all listeners from the specified event.  If the event type
     * is not specified, all listeners from all hosted custom events will
     * be removed.
     * @method unsubscribeAll
     * @param p_type {string}   The type, or name of the event
     */
    unsubscribeAll: function(p_type) {
        return this.unsubscribe(p_type);
    },

    /**
     * Creates a new custom event of the specified type.  If a custom event
     * by that name already exists, it will not be re-created.  In either
     * case the custom event is returned. 
     *
     * @method createEvent
     *
     * @param p_type {string} the type, or name of the event
     * @param p_config {object} optional config params.  Valid properties are:
     *
     *  <ul>
     *    <li>
     *      scope: defines the default execution scope.  If not defined
     *      the default scope will be this instance.
     *    </li>
     *    <li>
     *      silent: if true, the custom event will not generate log messages.
     *      This is false by default.
     *    </li>
     *    <li>
     *      fireOnce: if true, the custom event will only notify subscribers
     *      once regardless of the number of times the event is fired.  In
     *      addition, new subscribers will be executed immediately if the
     *      event has already fired.
     *      This is false by default.
     *    </li>
     *    <li>
     *      onSubscribeCallback: specifies a callback to execute when the
     *      event has a new subscriber.  This will fire immediately for
     *      each queued subscriber if any exist prior to the creation of
     *      the event.
     *    </li>
     *  </ul>
     *
     *  @return {CustomEvent} the custom event
     *
     */
    createEvent: function(p_type, p_config) {

        this.__yui_events = this.__yui_events || {};
        var opts = p_config || {},
            events = this.__yui_events, ce;

        if (events[p_type]) {
        } else {

            ce = new YAHOO.util.CustomEvent(p_type, opts.scope || this, opts.silent,
                         YAHOO.util.CustomEvent.FLAT, opts.fireOnce);

            events[p_type] = ce;

            if (opts.onSubscribeCallback) {
                ce.subscribeEvent.subscribe(opts.onSubscribeCallback);
            }

            this.__yui_subscribers = this.__yui_subscribers || {};
            var qs = this.__yui_subscribers[p_type];

            if (qs) {
                for (var i=0; i<qs.length; ++i) {
                    ce.subscribe(qs[i].fn, qs[i].obj, qs[i].overrideContext);
                }
            }
        }

        return events[p_type];
    },


   /**
     * Fire a custom event by name.  The callback functions will be executed
     * from the scope specified when the event was created, and with the 
     * following parameters:
     *   <ul>
     *   <li>The first argument fire() was executed with</li>
     *   <li>The custom object (if any) that was passed into the subscribe() 
     *       method</li>
     *   </ul>
     * @method fireEvent
     * @param p_type    {string}  the type, or name of the event
     * @param arguments {Object*} an arbitrary set of parameters to pass to 
     *                            the handler.
     * @return {boolean} the return value from CustomEvent.fire
     *                   
     */
    fireEvent: function(p_type) {

        this.__yui_events = this.__yui_events || {};
        var ce = this.__yui_events[p_type];

        if (!ce) {
            return null;
        }

        var args = [];
        for (var i=1; i<arguments.length; ++i) {
            args.push(arguments[i]);
        }
        return ce.fire.apply(ce, args);
    },

    /**
     * Returns true if the custom event of the provided type has been created
     * with createEvent.
     * @method hasEvent
     * @param type {string} the type, or name of the event
     */
    hasEvent: function(type) {
        if (this.__yui_events) {
            if (this.__yui_events[type]) {
                return true;
            }
        }
        return false;
    }

};

(function() {

    var Event = YAHOO.util.Event, Lang = YAHOO.lang;

/**
* KeyListener is a utility that provides an easy interface for listening for
* keydown/keyup events fired against DOM elements.
* @namespace YAHOO.util
* @class KeyListener
* @constructor
* @param {HTMLElement} attachTo The element or element ID to which the key 
*                               event should be attached
* @param {String}      attachTo The element or element ID to which the key
*                               event should be attached
* @param {Object}      keyData  The object literal representing the key(s) 
*                               to detect. Possible attributes are 
*                               shift(boolean), alt(boolean), ctrl(boolean) 
*                               and keys(either an int or an array of ints 
*                               representing keycodes).
* @param {Function}    handler  The CustomEvent handler to fire when the 
*                               key event is detected
* @param {Object}      handler  An object literal representing the handler. 
* @param {String}      event    Optional. The event (keydown or keyup) to 
*                               listen for. Defaults automatically to keydown.
*
* @knownissue the "keypress" event is completely broken in Safari 2.x and below.
*             the workaround is use "keydown" for key listening.  However, if
*             it is desired to prevent the default behavior of the keystroke,
*             that can only be done on the keypress event.  This makes key
*             handling quite ugly.
* @knownissue keydown is also broken in Safari 2.x and below for the ESC key.
*             There currently is no workaround other than choosing another
*             key to listen for.
*/
YAHOO.util.KeyListener = function(attachTo, keyData, handler, event) {
    if (!attachTo) {
    } else if (!keyData) {
    } else if (!handler) {
    } 
    
    if (!event) {
        event = YAHOO.util.KeyListener.KEYDOWN;
    }

    /**
    * The CustomEvent fired internally when a key is pressed
    * @event keyEvent
    * @private
    * @param {Object} keyData The object literal representing the key(s) to 
    *                         detect. Possible attributes are shift(boolean), 
    *                         alt(boolean), ctrl(boolean) and keys(either an 
    *                         int or an array of ints representing keycodes).
    */
    var keyEvent = new YAHOO.util.CustomEvent("keyPressed");
    
    /**
    * The CustomEvent fired when the KeyListener is enabled via the enable() 
    * function
    * @event enabledEvent
    * @param {Object} keyData The object literal representing the key(s) to 
    *                         detect. Possible attributes are shift(boolean), 
    *                         alt(boolean), ctrl(boolean) and keys(either an 
    *                         int or an array of ints representing keycodes).
    */
    this.enabledEvent = new YAHOO.util.CustomEvent("enabled");

    /**
    * The CustomEvent fired when the KeyListener is disabled via the 
    * disable() function
    * @event disabledEvent
    * @param {Object} keyData The object literal representing the key(s) to 
    *                         detect. Possible attributes are shift(boolean), 
    *                         alt(boolean), ctrl(boolean) and keys(either an 
    *                         int or an array of ints representing keycodes).
    */
    this.disabledEvent = new YAHOO.util.CustomEvent("disabled");

    if (Lang.isString(attachTo)) {
        attachTo = document.getElementById(attachTo); // No Dom util
    }

    if (Lang.isFunction(handler)) {
        keyEvent.subscribe(handler);
    } else {
        keyEvent.subscribe(handler.fn, handler.scope, handler.correctScope);
    }

    /**
    * Handles the key event when a key is pressed.
    * @method handleKeyPress
    * @param {DOMEvent} e   The keypress DOM event
    * @param {Object}   obj The DOM event scope object
    * @private
    */
    function handleKeyPress(e, obj) {
        if (! keyData.shift) {  
            keyData.shift = false; 
        }
        if (! keyData.alt) {    
            keyData.alt = false;
        }
        if (! keyData.ctrl) {
            keyData.ctrl = false;
        }

        // check held down modifying keys first
        if (e.shiftKey == keyData.shift && 
            e.altKey   == keyData.alt &&
            e.ctrlKey  == keyData.ctrl) { // if we pass this, all modifiers match
            
            var dataItem, keys = keyData.keys, key;

            if (YAHOO.lang.isArray(keys)) {
                for (var i=0;i<keys.length;i++) {
                    dataItem = keys[i];
                    key = Event.getCharCode(e);

                    if (dataItem == key) {
                        keyEvent.fire(key, e);
                        break;
                    }
                }
            } else {
                key = Event.getCharCode(e);
                if (keys == key ) {
                    keyEvent.fire(key, e);
                }
            }
        }
    }

    /**
    * Enables the KeyListener by attaching the DOM event listeners to the 
    * target DOM element
    * @method enable
    */
    this.enable = function() {
        if (! this.enabled) {
            Event.on(attachTo, event, handleKeyPress);
            this.enabledEvent.fire(keyData);
        }
        /**
        * Boolean indicating the enabled/disabled state of the Tooltip
        * @property enabled
        * @type Boolean
        */
        this.enabled = true;
    };

    /**
    * Disables the KeyListener by removing the DOM event listeners from the 
    * target DOM element
    * @method disable
    */
    this.disable = function() {
        if (this.enabled) {
            Event.removeListener(attachTo, event, handleKeyPress);
            this.disabledEvent.fire(keyData);
        }
        this.enabled = false;
    };

    /**
    * Returns a String representation of the object.
    * @method toString
    * @return {String}  The string representation of the KeyListener
    */ 
    this.toString = function() {
        return "KeyListener [" + keyData.keys + "] " + attachTo.tagName + 
                (attachTo.id ? "[" + attachTo.id + "]" : "");
    };

};

var KeyListener = YAHOO.util.KeyListener;

/**
 * Constant representing the DOM "keydown" event.
 * @property YAHOO.util.KeyListener.KEYDOWN
 * @static
 * @final
 * @type String
 */
KeyListener.KEYDOWN = "keydown";

/**
 * Constant representing the DOM "keyup" event.
 * @property YAHOO.util.KeyListener.KEYUP
 * @static
 * @final
 * @type String
 */
KeyListener.KEYUP = "keyup";

/**
 * keycode constants for a subset of the special keys
 * @property KEY
 * @static
 * @final
 */
KeyListener.KEY = {
    ALT          : 18,
    BACK_SPACE   : 8,
    CAPS_LOCK    : 20,
    CONTROL      : 17,
    DELETE       : 46,
    DOWN         : 40,
    END          : 35,
    ENTER        : 13,
    ESCAPE       : 27,
    HOME         : 36,
    LEFT         : 37,
    META         : 224,
    NUM_LOCK     : 144,
    PAGE_DOWN    : 34,
    PAGE_UP      : 33, 
    PAUSE        : 19,
    PRINTSCREEN  : 44,
    RIGHT        : 39,
    SCROLL_LOCK  : 145,
    SHIFT        : 16,
    SPACE        : 32,
    TAB          : 9,
    UP           : 38
};

})();
YAHOO.register("event", YAHOO.util.Event, {version: "2.8.0r4", build: "2446"});
/*
Copyright (c) 2009, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://developer.yahoo.net/yui/license.txt
version: 2.8.0r4
*/
/**
 * The dom module provides helper methods for manipulating Dom elements.
 * @module dom
 *
 */

(function() {
    // for use with generateId (global to save state if Dom is overwritten)
    YAHOO.env._id_counter = YAHOO.env._id_counter || 0;

    // internal shorthand
    var Y = YAHOO.util,
        lang = YAHOO.lang,
        UA = YAHOO.env.ua,
        trim = YAHOO.lang.trim,
        propertyCache = {}, // for faster hyphen converts
        reCache = {}, // cache className regexes
        RE_TABLE = /^t(?:able|d|h)$/i, // for _calcBorders
        RE_COLOR = /color$/i,

        // DOM aliases 
        document = window.document,     
        documentElement = document.documentElement,

        // string constants
        OWNER_DOCUMENT = 'ownerDocument',
        DEFAULT_VIEW = 'defaultView',
        DOCUMENT_ELEMENT = 'documentElement',
        COMPAT_MODE = 'compatMode',
        OFFSET_LEFT = 'offsetLeft',
        OFFSET_TOP = 'offsetTop',
        OFFSET_PARENT = 'offsetParent',
        PARENT_NODE = 'parentNode',
        NODE_TYPE = 'nodeType',
        TAG_NAME = 'tagName',
        SCROLL_LEFT = 'scrollLeft',
        SCROLL_TOP = 'scrollTop',
        GET_BOUNDING_CLIENT_RECT = 'getBoundingClientRect',
        GET_COMPUTED_STYLE = 'getComputedStyle',
        CURRENT_STYLE = 'currentStyle',
        CSS1_COMPAT = 'CSS1Compat',
        _BACK_COMPAT = 'BackCompat',
        _CLASS = 'class', // underscore due to reserved word
        CLASS_NAME = 'className',
        EMPTY = '',
        SPACE = ' ',
        C_START = '(?:^|\\s)',
        C_END = '(?= |$)',
        G = 'g',
        POSITION = 'position',
        FIXED = 'fixed',
        RELATIVE = 'relative',
        LEFT = 'left',
        TOP = 'top',
        MEDIUM = 'medium',
        BORDER_LEFT_WIDTH = 'borderLeftWidth',
        BORDER_TOP_WIDTH = 'borderTopWidth',
    
    // brower detection
        isOpera = UA.opera,
        isSafari = UA.webkit, 
        isGecko = UA.gecko, 
        isIE = UA.ie; 
    
    /**
     * Provides helper methods for DOM elements.
     * @namespace YAHOO.util
     * @class Dom
     * @requires yahoo, event
     */
    Y.Dom = {
        CUSTOM_ATTRIBUTES: (!documentElement.hasAttribute) ? { // IE < 8
            'for': 'htmlFor',
            'class': CLASS_NAME
        } : { // w3c
            'htmlFor': 'for',
            'className': _CLASS
        },

        DOT_ATTRIBUTES: {},

        /**
         * Returns an HTMLElement reference.
         * @method get
         * @param {String | HTMLElement |Array} el Accepts a string to use as an ID for getting a DOM reference, an actual DOM reference, or an Array of IDs and/or HTMLElements.
         * @return {HTMLElement | Array} A DOM reference to an HTML element or an array of HTMLElements.
         */
        get: function(el) {
            var id, nodes, c, i, len, attr;

            if (el) {
                if (el[NODE_TYPE] || el.item) { // Node, or NodeList
                    return el;
                }

                if (typeof el === 'string') { // id
                    id = el;
                    el = document.getElementById(el);
                    attr = (el) ? el.attributes : null;
                    if (el && attr && attr.id && attr.id.value === id) { // IE: avoid false match on "name" attribute
                        return el;
                    } else if (el && document.all) { // filter by name
                        el = null;
                        nodes = document.all[id];
                        for (i = 0, len = nodes.length; i < len; ++i) {
                            if (nodes[i].id === id) {
                                return nodes[i];
                            }
                        }
                    }
                    return el;
                }
                
                if (YAHOO.util.Element && el instanceof YAHOO.util.Element) {
                    el = el.get('element');
                }

                if ('length' in el) { // array-like 
                    c = [];
                    for (i = 0, len = el.length; i < len; ++i) {
                        c[c.length] = Y.Dom.get(el[i]);
                    }
                    
                    return c;
                }

                return el; // some other object, just pass it back
            }

            return null;
        },
    
        getComputedStyle: function(el, property) {
            if (window[GET_COMPUTED_STYLE]) {
                return el[OWNER_DOCUMENT][DEFAULT_VIEW][GET_COMPUTED_STYLE](el, null)[property];
            } else if (el[CURRENT_STYLE]) {
                return Y.Dom.IE_ComputedStyle.get(el, property);
            }
        },

        /**
         * Normalizes currentStyle and ComputedStyle.
         * @method getStyle
         * @param {String | HTMLElement |Array} el Accepts a string to use as an ID, an actual DOM reference, or an Array of IDs and/or HTMLElements.
         * @param {String} property The style property whose value is returned.
         * @return {String | Array} The current value of the style property for the element(s).
         */
        getStyle: function(el, property) {
            return Y.Dom.batch(el, Y.Dom._getStyle, property);
        },

        // branching at load instead of runtime
        _getStyle: function() {
            if (window[GET_COMPUTED_STYLE]) { // W3C DOM method
                return function(el, property) {
                    property = (property === 'float') ? property = 'cssFloat' :
                            Y.Dom._toCamel(property);

                    var value = el.style[property],
                        computed;
                    
                    if (!value) {
                        computed = el[OWNER_DOCUMENT][DEFAULT_VIEW][GET_COMPUTED_STYLE](el, null);
                        if (computed) { // test computed before touching for safari
                            value = computed[property];
                        }
                    }
                    
                    return value;
                };
            } else if (documentElement[CURRENT_STYLE]) {
                return function(el, property) {                         
                    var value;

                    switch(property) {
                        case 'opacity' :// IE opacity uses filter
                            value = 100;
                            try { // will error if no DXImageTransform
                                value = el.filters['DXImageTransform.Microsoft.Alpha'].opacity;

                            } catch(e) {
                                try { // make sure its in the document
                                    value = el.filters('alpha').opacity;
                                } catch(err) {
                                }
                            }
                            return value / 100;
                        case 'float': // fix reserved word
                            property = 'styleFloat'; // fall through
                        default: 
                            property = Y.Dom._toCamel(property);
                            value = el[CURRENT_STYLE] ? el[CURRENT_STYLE][property] : null;
                            return ( el.style[property] || value );
                    }
                };
            }
        }(),
    
        /**
         * Wrapper for setting style properties of HTMLElements.  Normalizes "opacity" across modern browsers.
         * @method setStyle
         * @param {String | HTMLElement | Array} el Accepts a string to use as an ID, an actual DOM reference, or an Array of IDs and/or HTMLElements.
         * @param {String} property The style property to be set.
         * @param {String} val The value to apply to the given property.
         */
        setStyle: function(el, property, val) {
            Y.Dom.batch(el, Y.Dom._setStyle, { prop: property, val: val });
        },

        _setStyle: function() {
            if (isIE) {
                return function(el, args) {
                    var property = Y.Dom._toCamel(args.prop),
                        val = args.val;

                    if (el) {
                        switch (property) {
                            case 'opacity':
                                if ( lang.isString(el.style.filter) ) { // in case not appended
                                    el.style.filter = 'alpha(opacity=' + val * 100 + ')';
                                    
                                    if (!el[CURRENT_STYLE] || !el[CURRENT_STYLE].hasLayout) {
                                        el.style.zoom = 1; // when no layout or cant tell
                                    }
                                }
                                break;
                            case 'float':
                                property = 'styleFloat';
                            default:
                            el.style[property] = val;
                        }
                    } else {
                    }
                };
            } else {
                return function(el, args) {
                    var property = Y.Dom._toCamel(args.prop),
                        val = args.val;
                    if (el) {
                        if (property == 'float') {
                            property = 'cssFloat';
                        }
                        el.style[property] = val;
                    } else {
                    }
                };
            }

        }(),
        
        /**
         * Gets the current position of an element based on page coordinates. 
         * Element must be part of the DOM tree to have page coordinates (display:none or elements not appended return false).
         * @method getXY
         * @param {String | HTMLElement | Array} el Accepts a string to use as an ID, an actual DOM
         * reference, or an Array of IDs and/or HTMLElements
         * @return {Array} The XY position of the element(s)
         */
        getXY: function(el) {
            return Y.Dom.batch(el, Y.Dom._getXY);
        },

        _canPosition: function(el) {
            return ( Y.Dom._getStyle(el, 'display') !== 'none' && Y.Dom._inDoc(el) );
        },

        _getXY: function() {
            if (document[DOCUMENT_ELEMENT][GET_BOUNDING_CLIENT_RECT]) {
                return function(node) {
                    var scrollLeft, scrollTop, box, doc,
                        off1, off2, mode, bLeft, bTop,
                        floor = Math.floor, // TODO: round?
                        xy = false;

                    if (Y.Dom._canPosition(node)) {
                        box = node[GET_BOUNDING_CLIENT_RECT]();
                        doc = node[OWNER_DOCUMENT];
                        scrollLeft = Y.Dom.getDocumentScrollLeft(doc);
                        scrollTop = Y.Dom.getDocumentScrollTop(doc);
                        xy = [floor(box[LEFT]), floor(box[TOP])];

                        if (isIE && UA.ie < 8) { // IE < 8: viewport off by 2
                            off1 = 2;
                            off2 = 2;
                            mode = doc[COMPAT_MODE];

                            if (UA.ie === 6) {
                                if (mode !== _BACK_COMPAT) {
                                    off1 = 0;
                                    off2 = 0;
                                }
                            }
                            
                            if ((mode === _BACK_COMPAT)) {
                                bLeft = _getComputedStyle(doc[DOCUMENT_ELEMENT], BORDER_LEFT_WIDTH);
                                bTop = _getComputedStyle(doc[DOCUMENT_ELEMENT], BORDER_TOP_WIDTH);
                                if (bLeft !== MEDIUM) {
                                    off1 = parseInt(bLeft, 10);
                                }
                                if (bTop !== MEDIUM) {
                                    off2 = parseInt(bTop, 10);
                                }
                            }
                            
                            xy[0] -= off1;
                            xy[1] -= off2;

                        }

                        if ((scrollTop || scrollLeft)) {
                            xy[0] += scrollLeft;
                            xy[1] += scrollTop;
                        }

                        // gecko may return sub-pixel (non-int) values
                        xy[0] = floor(xy[0]);
                        xy[1] = floor(xy[1]);
                    } else {
                    }

                    return xy;
                };
            } else {
                return function(node) { // ff2, safari: manually calculate by crawling up offsetParents
                    var docScrollLeft, docScrollTop,
                        scrollTop, scrollLeft,
                        bCheck,
                        xy = false,
                        parentNode = node;

                    if  (Y.Dom._canPosition(node) ) {
                        xy = [node[OFFSET_LEFT], node[OFFSET_TOP]];
                        docScrollLeft = Y.Dom.getDocumentScrollLeft(node[OWNER_DOCUMENT]);
                        docScrollTop = Y.Dom.getDocumentScrollTop(node[OWNER_DOCUMENT]);

                        // TODO: refactor with !! or just falsey
                        bCheck = ((isGecko || UA.webkit > 519) ? true : false);

                        // TODO: worth refactoring for TOP/LEFT only?
                        while ((parentNode = parentNode[OFFSET_PARENT])) {
                            xy[0] += parentNode[OFFSET_LEFT];
                            xy[1] += parentNode[OFFSET_TOP];
                            if (bCheck) {
                                xy = Y.Dom._calcBorders(parentNode, xy);
                            }
                        }

                        // account for any scrolled ancestors
                        if (Y.Dom._getStyle(node, POSITION) !== FIXED) {
                            parentNode = node;

                            while ((parentNode = parentNode[PARENT_NODE]) && parentNode[TAG_NAME]) {
                                scrollTop = parentNode[SCROLL_TOP];
                                scrollLeft = parentNode[SCROLL_LEFT];

                                //Firefox does something funky with borders when overflow is not visible.
                                if (isGecko && (Y.Dom._getStyle(parentNode, 'overflow') !== 'visible')) {
                                        xy = Y.Dom._calcBorders(parentNode, xy);
                                }

                                if (scrollTop || scrollLeft) {
                                    xy[0] -= scrollLeft;
                                    xy[1] -= scrollTop;
                                }
                            }
                            xy[0] += docScrollLeft;
                            xy[1] += docScrollTop;

                        } else {
                            //Fix FIXED position -- add scrollbars
                            if (isOpera) {
                                xy[0] -= docScrollLeft;
                                xy[1] -= docScrollTop;
                            } else if (isSafari || isGecko) {
                                xy[0] += docScrollLeft;
                                xy[1] += docScrollTop;
                            }
                        }
                        //Round the numbers so we get sane data back
                        xy[0] = Math.floor(xy[0]);
                        xy[1] = Math.floor(xy[1]);
                    } else {
                    }
                    return xy;                
                };
            }
        }(), // NOTE: Executing for loadtime branching
        
        /**
         * Gets the current X position of an element based on page coordinates.  The element must be part of the DOM tree to have page coordinates (display:none or elements not appended return false).
         * @method getX
         * @param {String | HTMLElement | Array} el Accepts a string to use as an ID, an actual DOM reference, or an Array of IDs and/or HTMLElements
         * @return {Number | Array} The X position of the element(s)
         */
        getX: function(el) {
            var f = function(el) {
                return Y.Dom.getXY(el)[0];
            };
            
            return Y.Dom.batch(el, f, Y.Dom, true);
        },
        
        /**
         * Gets the current Y position of an element based on page coordinates.  Element must be part of the DOM tree to have page coordinates (display:none or elements not appended return false).
         * @method getY
         * @param {String | HTMLElement | Array} el Accepts a string to use as an ID, an actual DOM reference, or an Array of IDs and/or HTMLElements
         * @return {Number | Array} The Y position of the element(s)
         */
        getY: function(el) {
            var f = function(el) {
                return Y.Dom.getXY(el)[1];
            };
            
            return Y.Dom.batch(el, f, Y.Dom, true);
        },
        
        /**
         * Set the position of an html element in page coordinates, regardless of how the element is positioned.
         * The element(s) must be part of the DOM tree to have page coordinates (display:none or elements not appended return false).
         * @method setXY
         * @param {String | HTMLElement | Array} el Accepts a string to use as an ID, an actual DOM reference, or an Array of IDs and/or HTMLElements
         * @param {Array} pos Contains X & Y values for new position (coordinates are page-based)
         * @param {Boolean} noRetry By default we try and set the position a second time if the first fails
         */
        setXY: function(el, pos, noRetry) {
            Y.Dom.batch(el, Y.Dom._setXY, { pos: pos, noRetry: noRetry });
        },

        _setXY: function(node, args) {
            var pos = Y.Dom._getStyle(node, POSITION),
                setStyle = Y.Dom.setStyle,
                xy = args.pos,
                noRetry = args.noRetry,

                delta = [ // assuming pixels; if not we will have to retry
                    parseInt( Y.Dom.getComputedStyle(node, LEFT), 10 ),
                    parseInt( Y.Dom.getComputedStyle(node, TOP), 10 )
                ],

                currentXY,
                newXY;
        
            if (pos == 'static') { // default to relative
                pos = RELATIVE;
                setStyle(node, POSITION, pos);
            }

            currentXY = Y.Dom._getXY(node);

            if (!xy || currentXY === false) { // has to be part of doc to have xy
                return false; 
            }
            
            if ( isNaN(delta[0]) ) {// in case of 'auto'
                delta[0] = (pos == RELATIVE) ? 0 : node[OFFSET_LEFT];
            } 
            if ( isNaN(delta[1]) ) { // in case of 'auto'
                delta[1] = (pos == RELATIVE) ? 0 : node[OFFSET_TOP];
            } 

            if (xy[0] !== null) { // from setX
                setStyle(node, LEFT, xy[0] - currentXY[0] + delta[0] + 'px');
            }

            if (xy[1] !== null) { // from setY
                setStyle(node, TOP, xy[1] - currentXY[1] + delta[1] + 'px');
            }
          
            if (!noRetry) {
                newXY = Y.Dom._getXY(node);

                // if retry is true, try one more time if we miss 
               if ( (xy[0] !== null && newXY[0] != xy[0]) || 
                    (xy[1] !== null && newXY[1] != xy[1]) ) {
                   Y.Dom._setXY(node, { pos: xy, noRetry: true });
               }
            }        

        },
        
        /**
         * Set the X position of an html element in page coordinates, regardless of how the element is positioned.
         * The element must be part of the DOM tree to have page coordinates (display:none or elements not appended return false).
         * @method setX
         * @param {String | HTMLElement | Array} el Accepts a string to use as an ID, an actual DOM reference, or an Array of IDs and/or HTMLElements.
         * @param {Int} x The value to use as the X coordinate for the element(s).
         */
        setX: function(el, x) {
            Y.Dom.setXY(el, [x, null]);
        },
        
        /**
         * Set the Y position of an html element in page coordinates, regardless of how the element is positioned.
         * The element must be part of the DOM tree to have page coordinates (display:none or elements not appended return false).
         * @method setY
         * @param {String | HTMLElement | Array} el Accepts a string to use as an ID, an actual DOM reference, or an Array of IDs and/or HTMLElements.
         * @param {Int} x To use as the Y coordinate for the element(s).
         */
        setY: function(el, y) {
            Y.Dom.setXY(el, [null, y]);
        },
        
        /**
         * Returns the region position of the given element.
         * The element must be part of the DOM tree to have a region (display:none or elements not appended return false).
         * @method getRegion
         * @param {String | HTMLElement | Array} el Accepts a string to use as an ID, an actual DOM reference, or an Array of IDs and/or HTMLElements.
         * @return {Region | Array} A Region or array of Region instances containing "top, left, bottom, right" member data.
         */
        getRegion: function(el) {
            var f = function(el) {
                var region = false;
                if ( Y.Dom._canPosition(el) ) {
                    region = Y.Region.getRegion(el);
                } else {
                }

                return region;
            };
            
            return Y.Dom.batch(el, f, Y.Dom, true);
        },
        
        /**
         * Returns the width of the client (viewport).
         * @method getClientWidth
         * @deprecated Now using getViewportWidth.  This interface left intact for back compat.
         * @return {Int} The width of the viewable area of the page.
         */
        getClientWidth: function() {
            return Y.Dom.getViewportWidth();
        },
        
        /**
         * Returns the height of the client (viewport).
         * @method getClientHeight
         * @deprecated Now using getViewportHeight.  This interface left intact for back compat.
         * @return {Int} The height of the viewable area of the page.
         */
        getClientHeight: function() {
            return Y.Dom.getViewportHeight();
        },

        /**
         * Returns an array of HTMLElements with the given class.
         * For optimized performance, include a tag and/or root node when possible.
         * Note: This method operates against a live collection, so modifying the 
         * collection in the callback (removing/appending nodes, etc.) will have
         * side effects.  Instead you should iterate the returned nodes array,
         * as you would with the native "getElementsByTagName" method. 
         * @method getElementsByClassName
         * @param {String} className The class name to match against
         * @param {String} tag (optional) The tag name of the elements being collected
         * @param {String | HTMLElement} root (optional) The HTMLElement or an ID to use as the starting point.
         * This element is not included in the className scan.
         * @param {Function} apply (optional) A function to apply to each element when found 
         * @param {Any} o (optional) An optional arg that is passed to the supplied method
         * @param {Boolean} overrides (optional) Whether or not to override the scope of "method" with "o"
         * @return {Array} An array of elements that have the given class name
         */
        getElementsByClassName: function(className, tag, root, apply, o, overrides) {
            tag = tag || '*';
            root = (root) ? Y.Dom.get(root) : null || document; 
            if (!root) {
                return [];
            }

            var nodes = [],
                elements = root.getElementsByTagName(tag),
                hasClass = Y.Dom.hasClass;

            for (var i = 0, len = elements.length; i < len; ++i) {
                if ( hasClass(elements[i], className) ) {
                    nodes[nodes.length] = elements[i];
                }
            }
            
            if (apply) {
                Y.Dom.batch(nodes, apply, o, overrides);
            }

            return nodes;
        },

        /**
         * Determines whether an HTMLElement has the given className.
         * @method hasClass
         * @param {String | HTMLElement | Array} el The element or collection to test
         * @param {String} className the class name to search for
         * @return {Boolean | Array} A boolean value or array of boolean values
         */
        hasClass: function(el, className) {
            return Y.Dom.batch(el, Y.Dom._hasClass, className);
        },

        _hasClass: function(el, className) {
            var ret = false,
                current;
            
            if (el && className) {
                current = Y.Dom._getAttribute(el, CLASS_NAME) || EMPTY;
                if (className.exec) {
                    ret = className.test(current);
                } else {
                    ret = className && (SPACE + current + SPACE).
                        indexOf(SPACE + className + SPACE) > -1;
                }
            } else {
            }

            return ret;
        },
    
        /**
         * Adds a class name to a given element or collection of elements.
         * @method addClass         
         * @param {String | HTMLElement | Array} el The element or collection to add the class to
         * @param {String} className the class name to add to the class attribute
         * @return {Boolean | Array} A pass/fail boolean or array of booleans
         */
        addClass: function(el, className) {
            return Y.Dom.batch(el, Y.Dom._addClass, className);
        },

        _addClass: function(el, className) {
            var ret = false,
                current;

            if (el && className) {
                current = Y.Dom._getAttribute(el, CLASS_NAME) || EMPTY;
                if ( !Y.Dom._hasClass(el, className) ) {
                    Y.Dom.setAttribute(el, CLASS_NAME, trim(current + SPACE + className));
                    ret = true;
                }
            } else {
            }

            return ret;
        },
    
        /**
         * Removes a class name from a given element or collection of elements.
         * @method removeClass         
         * @param {String | HTMLElement | Array} el The element or collection to remove the class from
         * @param {String} className the class name to remove from the class attribute
         * @return {Boolean | Array} A pass/fail boolean or array of booleans
         */
        removeClass: function(el, className) {
            return Y.Dom.batch(el, Y.Dom._removeClass, className);
        },
        
        _removeClass: function(el, className) {
            var ret = false,
                current,
                newClass,
                attr;

            if (el && className) {
                current = Y.Dom._getAttribute(el, CLASS_NAME) || EMPTY;
                Y.Dom.setAttribute(el, CLASS_NAME, current.replace(Y.Dom._getClassRegex(className), EMPTY));

                newClass = Y.Dom._getAttribute(el, CLASS_NAME);
                if (current !== newClass) { // else nothing changed
                    Y.Dom.setAttribute(el, CLASS_NAME, trim(newClass)); // trim after comparing to current class
                    ret = true;

                    if (Y.Dom._getAttribute(el, CLASS_NAME) === '') { // remove class attribute if empty
                        attr = (el.hasAttribute && el.hasAttribute(_CLASS)) ? _CLASS : CLASS_NAME;
                        el.removeAttribute(attr);
                    }
                }

            } else {
            }

            return ret;
        },
        
        /**
         * Replace a class with another class for a given element or collection of elements.
         * If no oldClassName is present, the newClassName is simply added.
         * @method replaceClass  
         * @param {String | HTMLElement | Array} el The element or collection to remove the class from
         * @param {String} oldClassName the class name to be replaced
         * @param {String} newClassName the class name that will be replacing the old class name
         * @return {Boolean | Array} A pass/fail boolean or array of booleans
         */
        replaceClass: function(el, oldClassName, newClassName) {
            return Y.Dom.batch(el, Y.Dom._replaceClass, { from: oldClassName, to: newClassName });
        },

        _replaceClass: function(el, classObj) {
            var className,
                from,
                to,
                ret = false,
                current;

            if (el && classObj) {
                from = classObj.from;
                to = classObj.to;

                if (!to) {
                    ret = false;
                }  else if (!from) { // just add if no "from"
                    ret = Y.Dom._addClass(el, classObj.to);
                } else if (from !== to) { // else nothing to replace
                    // May need to lead with DBLSPACE?
                    current = Y.Dom._getAttribute(el, CLASS_NAME) || EMPTY;
                    className = (SPACE + current.replace(Y.Dom._getClassRegex(from), SPACE + to)).
                               split(Y.Dom._getClassRegex(to));

                    // insert to into what would have been the first occurrence slot
                    className.splice(1, 0, SPACE + to);
                    Y.Dom.setAttribute(el, CLASS_NAME, trim(className.join(EMPTY)));
                    ret = true;
                }
            } else {
            }

            return ret;
        },
        
        /**
         * Returns an ID and applies it to the element "el", if provided.
         * @method generateId  
         * @param {String | HTMLElement | Array} el (optional) An optional element array of elements to add an ID to (no ID is added if one is already present).
         * @param {String} prefix (optional) an optional prefix to use (defaults to "yui-gen").
         * @return {String | Array} The generated ID, or array of generated IDs (or original ID if already present on an element)
         */
        generateId: function(el, prefix) {
            prefix = prefix || 'yui-gen';

            var f = function(el) {
                if (el && el.id) { // do not override existing ID
                    return el.id;
                }

                var id = prefix + YAHOO.env._id_counter++;

                if (el) {
                    if (el[OWNER_DOCUMENT] && el[OWNER_DOCUMENT].getElementById(id)) { // in case one already exists
                        // use failed id plus prefix to help ensure uniqueness
                        return Y.Dom.generateId(el, id + prefix);
                    }
                    el.id = id;
                }
                
                return id;
            };

            // batch fails when no element, so just generate and return single ID
            return Y.Dom.batch(el, f, Y.Dom, true) || f.apply(Y.Dom, arguments);
        },
        
        /**
         * Determines whether an HTMLElement is an ancestor of another HTML element in the DOM hierarchy.
         * @method isAncestor
         * @param {String | HTMLElement} haystack The possible ancestor
         * @param {String | HTMLElement} needle The possible descendent
         * @return {Boolean} Whether or not the haystack is an ancestor of needle
         */
        isAncestor: function(haystack, needle) {
            haystack = Y.Dom.get(haystack);
            needle = Y.Dom.get(needle);
            
            var ret = false;

            if ( (haystack && needle) && (haystack[NODE_TYPE] && needle[NODE_TYPE]) ) {
                if (haystack.contains && haystack !== needle) { // contains returns true when equal
                    ret = haystack.contains(needle);
                }
                else if (haystack.compareDocumentPosition) { // gecko
                    ret = !!(haystack.compareDocumentPosition(needle) & 16);
                }
            } else {
            }
            return ret;
        },
        
        /**
         * Determines whether an HTMLElement is present in the current document.
         * @method inDocument         
         * @param {String | HTMLElement} el The element to search for
         * @param {Object} doc An optional document to search, defaults to element's owner document 
         * @return {Boolean} Whether or not the element is present in the current document
         */
        inDocument: function(el, doc) {
            return Y.Dom._inDoc(Y.Dom.get(el), doc);
        },

        _inDoc: function(el, doc) {
            var ret = false;
            if (el && el[TAG_NAME]) {
                doc = doc || el[OWNER_DOCUMENT]; 
                ret = Y.Dom.isAncestor(doc[DOCUMENT_ELEMENT], el);
            } else {
            }
            return ret;
        },
        
        /**
         * Returns an array of HTMLElements that pass the test applied by supplied boolean method.
         * For optimized performance, include a tag and/or root node when possible.
         * Note: This method operates against a live collection, so modifying the 
         * collection in the callback (removing/appending nodes, etc.) will have
         * side effects.  Instead you should iterate the returned nodes array,
         * as you would with the native "getElementsByTagName" method. 
         * @method getElementsBy
         * @param {Function} method - A boolean method for testing elements which receives the element as its only argument.
         * @param {String} tag (optional) The tag name of the elements being collected
         * @param {String | HTMLElement} root (optional) The HTMLElement or an ID to use as the starting point 
         * @param {Function} apply (optional) A function to apply to each element when found 
         * @param {Any} o (optional) An optional arg that is passed to the supplied method
         * @param {Boolean} overrides (optional) Whether or not to override the scope of "method" with "o"
         * @return {Array} Array of HTMLElements
         */
        getElementsBy: function(method, tag, root, apply, o, overrides, firstOnly) {
            tag = tag || '*';
            root = (root) ? Y.Dom.get(root) : null || document; 

            if (!root) {
                return [];
            }

            var nodes = [],
                elements = root.getElementsByTagName(tag);
            
            for (var i = 0, len = elements.length; i < len; ++i) {
                if ( method(elements[i]) ) {
                    if (firstOnly) {
                        nodes = elements[i]; 
                        break;
                    } else {
                        nodes[nodes.length] = elements[i];
                    }
                }
            }

            if (apply) {
                Y.Dom.batch(nodes, apply, o, overrides);
            }

            
            return nodes;
        },
        
        /**
         * Returns the first HTMLElement that passes the test applied by the supplied boolean method.
         * @method getElementBy
         * @param {Function} method - A boolean method for testing elements which receives the element as its only argument.
         * @param {String} tag (optional) The tag name of the elements being collected
         * @param {String | HTMLElement} root (optional) The HTMLElement or an ID to use as the starting point 
         * @return {HTMLElement}
         */
        getElementBy: function(method, tag, root) {
            return Y.Dom.getElementsBy(method, tag, root, null, null, null, true); 
        },

        /**
         * Runs the supplied method against each item in the Collection/Array.
         * The method is called with the element(s) as the first arg, and the optional param as the second ( method(el, o) ).
         * @method batch
         * @param {String | HTMLElement | Array} el (optional) An element or array of elements to apply the method to
         * @param {Function} method The method to apply to the element(s)
         * @param {Any} o (optional) An optional arg that is passed to the supplied method
         * @param {Boolean} overrides (optional) Whether or not to override the scope of "method" with "o"
         * @return {Any | Array} The return value(s) from the supplied method
         */
        batch: function(el, method, o, overrides) {
            var collection = [],
                scope = (overrides) ? o : window;
                
            el = (el && (el[TAG_NAME] || el.item)) ? el : Y.Dom.get(el); // skip get() when possible
            if (el && method) {
                if (el[TAG_NAME] || el.length === undefined) { // element or not array-like 
                    return method.call(scope, el, o);
                } 

                for (var i = 0; i < el.length; ++i) {
                    collection[collection.length] = method.call(scope, el[i], o);
                }
            } else {
                return false;
            } 
            return collection;
        },
        
        /**
         * Returns the height of the document.
         * @method getDocumentHeight
         * @return {Int} The height of the actual document (which includes the body and its margin).
         */
        getDocumentHeight: function() {
            var scrollHeight = (document[COMPAT_MODE] != CSS1_COMPAT || isSafari) ? document.body.scrollHeight : documentElement.scrollHeight,
                h = Math.max(scrollHeight, Y.Dom.getViewportHeight());

            return h;
        },
        
        /**
         * Returns the width of the document.
         * @method getDocumentWidth
         * @return {Int} The width of the actual document (which includes the body and its margin).
         */
        getDocumentWidth: function() {
            var scrollWidth = (document[COMPAT_MODE] != CSS1_COMPAT || isSafari) ? document.body.scrollWidth : documentElement.scrollWidth,
                w = Math.max(scrollWidth, Y.Dom.getViewportWidth());
            return w;
        },

        /**
         * Returns the current height of the viewport.
         * @method getViewportHeight
         * @return {Int} The height of the viewable area of the page (excludes scrollbars).
         */
        getViewportHeight: function() {
            var height = self.innerHeight, // Safari, Opera
                mode = document[COMPAT_MODE];
        
            if ( (mode || isIE) && !isOpera ) { // IE, Gecko
                height = (mode == CSS1_COMPAT) ?
                        documentElement.clientHeight : // Standards
                        document.body.clientHeight; // Quirks
            }
        
            return height;
        },
        
        /**
         * Returns the current width of the viewport.
         * @method getViewportWidth
         * @return {Int} The width of the viewable area of the page (excludes scrollbars).
         */
        
        getViewportWidth: function() {
            var width = self.innerWidth,  // Safari
                mode = document[COMPAT_MODE];
            
            if (mode || isIE) { // IE, Gecko, Opera
                width = (mode == CSS1_COMPAT) ?
                        documentElement.clientWidth : // Standards
                        document.body.clientWidth; // Quirks
            }
            return width;
        },

       /**
         * Returns the nearest ancestor that passes the test applied by supplied boolean method.
         * For performance reasons, IDs are not accepted and argument validation omitted.
         * @method getAncestorBy
         * @param {HTMLElement} node The HTMLElement to use as the starting point 
         * @param {Function} method - A boolean method for testing elements which receives the element as its only argument.
         * @return {Object} HTMLElement or null if not found
         */
        getAncestorBy: function(node, method) {
            while ( (node = node[PARENT_NODE]) ) { // NOTE: assignment
                if ( Y.Dom._testElement(node, method) ) {
                    return node;
                }
            } 

            return null;
        },
        
        /**
         * Returns the nearest ancestor with the given className.
         * @method getAncestorByClassName
         * @param {String | HTMLElement} node The HTMLElement or an ID to use as the starting point 
         * @param {String} className
         * @return {Object} HTMLElement
         */
        getAncestorByClassName: function(node, className) {
            node = Y.Dom.get(node);
            if (!node) {
                return null;
            }
            var method = function(el) { return Y.Dom.hasClass(el, className); };
            return Y.Dom.getAncestorBy(node, method);
        },

        /**
         * Returns the nearest ancestor with the given tagName.
         * @method getAncestorByTagName
         * @param {String | HTMLElement} node The HTMLElement or an ID to use as the starting point 
         * @param {String} tagName
         * @return {Object} HTMLElement
         */
        getAncestorByTagName: function(node, tagName) {
            node = Y.Dom.get(node);
            if (!node) {
                return null;
            }
            var method = function(el) {
                 return el[TAG_NAME] && el[TAG_NAME].toUpperCase() == tagName.toUpperCase();
            };

            return Y.Dom.getAncestorBy(node, method);
        },

        /**
         * Returns the previous sibling that is an HTMLElement. 
         * For performance reasons, IDs are not accepted and argument validation omitted.
         * Returns the nearest HTMLElement sibling if no method provided.
         * @method getPreviousSiblingBy
         * @param {HTMLElement} node The HTMLElement to use as the starting point 
         * @param {Function} method A boolean function used to test siblings
         * that receives the sibling node being tested as its only argument
         * @return {Object} HTMLElement or null if not found
         */
        getPreviousSiblingBy: function(node, method) {
            while (node) {
                node = node.previousSibling;
                if ( Y.Dom._testElement(node, method) ) {
                    return node;
                }
            }
            return null;
        }, 

        /**
         * Returns the previous sibling that is an HTMLElement 
         * @method getPreviousSibling
         * @param {String | HTMLElement} node The HTMLElement or an ID to use as the starting point 
         * @return {Object} HTMLElement or null if not found
         */
        getPreviousSibling: function(node) {
            node = Y.Dom.get(node);
            if (!node) {
                return null;
            }

            return Y.Dom.getPreviousSiblingBy(node);
        }, 

        /**
         * Returns the next HTMLElement sibling that passes the boolean method. 
         * For performance reasons, IDs are not accepted and argument validation omitted.
         * Returns the nearest HTMLElement sibling if no method provided.
         * @method getNextSiblingBy
         * @param {HTMLElement} node The HTMLElement to use as the starting point 
         * @param {Function} method A boolean function used to test siblings
         * that receives the sibling node being tested as its only argument
         * @return {Object} HTMLElement or null if not found
         */
        getNextSiblingBy: function(node, method) {
            while (node) {
                node = node.nextSibling;
                if ( Y.Dom._testElement(node, method) ) {
                    return node;
                }
            }
            return null;
        }, 

        /**
         * Returns the next sibling that is an HTMLElement 
         * @method getNextSibling
         * @param {String | HTMLElement} node The HTMLElement or an ID to use as the starting point 
         * @return {Object} HTMLElement or null if not found
         */
        getNextSibling: function(node) {
            node = Y.Dom.get(node);
            if (!node) {
                return null;
            }

            return Y.Dom.getNextSiblingBy(node);
        }, 

        /**
         * Returns the first HTMLElement child that passes the test method. 
         * @method getFirstChildBy
         * @param {HTMLElement} node The HTMLElement to use as the starting point 
         * @param {Function} method A boolean function used to test children
         * that receives the node being tested as its only argument
         * @return {Object} HTMLElement or null if not found
         */
        getFirstChildBy: function(node, method) {
            var child = ( Y.Dom._testElement(node.firstChild, method) ) ? node.firstChild : null;
            return child || Y.Dom.getNextSiblingBy(node.firstChild, method);
        }, 

        /**
         * Returns the first HTMLElement child. 
         * @method getFirstChild
         * @param {String | HTMLElement} node The HTMLElement or an ID to use as the starting point 
         * @return {Object} HTMLElement or null if not found
         */
        getFirstChild: function(node, method) {
            node = Y.Dom.get(node);
            if (!node) {
                return null;
            }
            return Y.Dom.getFirstChildBy(node);
        }, 

        /**
         * Returns the last HTMLElement child that passes the test method. 
         * @method getLastChildBy
         * @param {HTMLElement} node The HTMLElement to use as the starting point 
         * @param {Function} method A boolean function used to test children
         * that receives the node being tested as its only argument
         * @return {Object} HTMLElement or null if not found
         */
        getLastChildBy: function(node, method) {
            if (!node) {
                return null;
            }
            var child = ( Y.Dom._testElement(node.lastChild, method) ) ? node.lastChild : null;
            return child || Y.Dom.getPreviousSiblingBy(node.lastChild, method);
        }, 

        /**
         * Returns the last HTMLElement child. 
         * @method getLastChild
         * @param {String | HTMLElement} node The HTMLElement or an ID to use as the starting point 
         * @return {Object} HTMLElement or null if not found
         */
        getLastChild: function(node) {
            node = Y.Dom.get(node);
            return Y.Dom.getLastChildBy(node);
        }, 

        /**
         * Returns an array of HTMLElement childNodes that pass the test method. 
         * @method getChildrenBy
         * @param {HTMLElement} node The HTMLElement to start from
         * @param {Function} method A boolean function used to test children
         * that receives the node being tested as its only argument
         * @return {Array} A static array of HTMLElements
         */
        getChildrenBy: function(node, method) {
            var child = Y.Dom.getFirstChildBy(node, method),
                children = child ? [child] : [];

            Y.Dom.getNextSiblingBy(child, function(node) {
                if ( !method || method(node) ) {
                    children[children.length] = node;
                }
                return false; // fail test to collect all children
            });

            return children;
        },
 
        /**
         * Returns an array of HTMLElement childNodes. 
         * @method getChildren
         * @param {String | HTMLElement} node The HTMLElement or an ID to use as the starting point 
         * @return {Array} A static array of HTMLElements
         */
        getChildren: function(node) {
            node = Y.Dom.get(node);
            if (!node) {
            }

            return Y.Dom.getChildrenBy(node);
        },

        /**
         * Returns the left scroll value of the document 
         * @method getDocumentScrollLeft
         * @param {HTMLDocument} document (optional) The document to get the scroll value of
         * @return {Int}  The amount that the document is scrolled to the left
         */
        getDocumentScrollLeft: function(doc) {
            doc = doc || document;
            return Math.max(doc[DOCUMENT_ELEMENT].scrollLeft, doc.body.scrollLeft);
        }, 

        /**
         * Returns the top scroll value of the document 
         * @method getDocumentScrollTop
         * @param {HTMLDocument} document (optional) The document to get the scroll value of
         * @return {Int}  The amount that the document is scrolled to the top
         */
        getDocumentScrollTop: function(doc) {
            doc = doc || document;
            return Math.max(doc[DOCUMENT_ELEMENT].scrollTop, doc.body.scrollTop);
        },

        /**
         * Inserts the new node as the previous sibling of the reference node 
         * @method insertBefore
         * @param {String | HTMLElement} newNode The node to be inserted
         * @param {String | HTMLElement} referenceNode The node to insert the new node before 
         * @return {HTMLElement} The node that was inserted (or null if insert fails) 
         */
        insertBefore: function(newNode, referenceNode) {
            newNode = Y.Dom.get(newNode); 
            referenceNode = Y.Dom.get(referenceNode); 
            
            if (!newNode || !referenceNode || !referenceNode[PARENT_NODE]) {
                return null;
            }       

            return referenceNode[PARENT_NODE].insertBefore(newNode, referenceNode); 
        },

        /**
         * Inserts the new node as the next sibling of the reference node 
         * @method insertAfter
         * @param {String | HTMLElement} newNode The node to be inserted
         * @param {String | HTMLElement} referenceNode The node to insert the new node after 
         * @return {HTMLElement} The node that was inserted (or null if insert fails) 
         */
        insertAfter: function(newNode, referenceNode) {
            newNode = Y.Dom.get(newNode); 
            referenceNode = Y.Dom.get(referenceNode); 
            
            if (!newNode || !referenceNode || !referenceNode[PARENT_NODE]) {
                return null;
            }       

            if (referenceNode.nextSibling) {
                return referenceNode[PARENT_NODE].insertBefore(newNode, referenceNode.nextSibling); 
            } else {
                return referenceNode[PARENT_NODE].appendChild(newNode);
            }
        },

        /**
         * Creates a Region based on the viewport relative to the document. 
         * @method getClientRegion
         * @return {Region} A Region object representing the viewport which accounts for document scroll
         */
        getClientRegion: function() {
            var t = Y.Dom.getDocumentScrollTop(),
                l = Y.Dom.getDocumentScrollLeft(),
                r = Y.Dom.getViewportWidth() + l,
                b = Y.Dom.getViewportHeight() + t;

            return new Y.Region(t, r, b, l);
        },

        /**
         * Provides a normalized attribute interface. 
         * @method setAttribute
         * @param {String | HTMLElement} el The target element for the attribute.
         * @param {String} attr The attribute to set.
         * @param {String} val The value of the attribute.
         */
        setAttribute: function(el, attr, val) {
            Y.Dom.batch(el, Y.Dom._setAttribute, { attr: attr, val: val });
        },

        _setAttribute: function(el, args) {
            var attr = Y.Dom._toCamel(args.attr),
                val = args.val;

            if (el && el.setAttribute) {
                if (Y.Dom.DOT_ATTRIBUTES[attr]) {
                    el[attr] = val;
                } else {
                    attr = Y.Dom.CUSTOM_ATTRIBUTES[attr] || attr;
                    el.setAttribute(attr, val);
                }
            } else {
            }
        },

        /**
         * Provides a normalized attribute interface. 
         * @method getAttribute
         * @param {String | HTMLElement} el The target element for the attribute.
         * @param {String} attr The attribute to get.
         * @return {String} The current value of the attribute. 
         */
        getAttribute: function(el, attr) {
            return Y.Dom.batch(el, Y.Dom._getAttribute, attr);
        },


        _getAttribute: function(el, attr) {
            var val;
            attr = Y.Dom.CUSTOM_ATTRIBUTES[attr] || attr;

            if (el && el.getAttribute) {
                val = el.getAttribute(attr, 2);
            } else {
            }

            return val;
        },

        _toCamel: function(property) {
            var c = propertyCache;

            function tU(x,l) {
                return l.toUpperCase();
            }

            return c[property] || (c[property] = property.indexOf('-') === -1 ? 
                                    property :
                                    property.replace( /-([a-z])/gi, tU ));
        },

        _getClassRegex: function(className) {
            var re;
            if (className !== undefined) { // allow empty string to pass
                if (className.exec) { // already a RegExp
                    re = className;
                } else {
                    re = reCache[className];
                    if (!re) {
                        // escape special chars (".", "[", etc.)
                        className = className.replace(Y.Dom._patterns.CLASS_RE_TOKENS, '\\$1');
                        re = reCache[className] = new RegExp(C_START + className + C_END, G);
                    }
                }
            }
            return re;
        },

        _patterns: {
            ROOT_TAG: /^body|html$/i, // body for quirks mode, html for standards,
            CLASS_RE_TOKENS: /([\.\(\)\^\$\*\+\?\|\[\]\{\}\\])/g
        },


        _testElement: function(node, method) {
            return node && node[NODE_TYPE] == 1 && ( !method || method(node) );
        },

        _calcBorders: function(node, xy2) {
            var t = parseInt(Y.Dom[GET_COMPUTED_STYLE](node, BORDER_TOP_WIDTH), 10) || 0,
                l = parseInt(Y.Dom[GET_COMPUTED_STYLE](node, BORDER_LEFT_WIDTH), 10) || 0;
            if (isGecko) {
                if (RE_TABLE.test(node[TAG_NAME])) {
                    t = 0;
                    l = 0;
                }
            }
            xy2[0] += l;
            xy2[1] += t;
            return xy2;
        }
    };
        
    var _getComputedStyle = Y.Dom[GET_COMPUTED_STYLE];
    // fix opera computedStyle default color unit (convert to rgb)
    if (UA.opera) {
        Y.Dom[GET_COMPUTED_STYLE] = function(node, att) {
            var val = _getComputedStyle(node, att);
            if (RE_COLOR.test(att)) {
                val = Y.Dom.Color.toRGB(val);
            }

            return val;
        };

    }

    // safari converts transparent to rgba(), others use "transparent"
    if (UA.webkit) {
        Y.Dom[GET_COMPUTED_STYLE] = function(node, att) {
            var val = _getComputedStyle(node, att);

            if (val === 'rgba(0, 0, 0, 0)') {
                val = 'transparent'; 
            }

            return val;
        };

    }

    if (UA.ie && UA.ie >= 8 && document.documentElement.hasAttribute) { // IE 8 standards
        Y.Dom.DOT_ATTRIBUTES.type = true; // IE 8 errors on input.setAttribute('type')
    }
})();
/**
 * A region is a representation of an object on a grid.  It is defined
 * by the top, right, bottom, left extents, so is rectangular by default.  If 
 * other shapes are required, this class could be extended to support it.
 * @namespace YAHOO.util
 * @class Region
 * @param {Int} t the top extent
 * @param {Int} r the right extent
 * @param {Int} b the bottom extent
 * @param {Int} l the left extent
 * @constructor
 */
YAHOO.util.Region = function(t, r, b, l) {

    /**
     * The region's top extent
     * @property top
     * @type Int
     */
    this.top = t;
    
    /**
     * The region's top extent
     * @property y
     * @type Int
     */
    this.y = t;
    
    /**
     * The region's top extent as index, for symmetry with set/getXY
     * @property 1
     * @type Int
     */
    this[1] = t;

    /**
     * The region's right extent
     * @property right
     * @type int
     */
    this.right = r;

    /**
     * The region's bottom extent
     * @property bottom
     * @type Int
     */
    this.bottom = b;

    /**
     * The region's left extent
     * @property left
     * @type Int
     */
    this.left = l;
    
    /**
     * The region's left extent
     * @property x
     * @type Int
     */
    this.x = l;
    
    /**
     * The region's left extent as index, for symmetry with set/getXY
     * @property 0
     * @type Int
     */
    this[0] = l;

    /**
     * The region's total width 
     * @property width 
     * @type Int
     */
    this.width = this.right - this.left;

    /**
     * The region's total height 
     * @property height 
     * @type Int
     */
    this.height = this.bottom - this.top;
};

/**
 * Returns true if this region contains the region passed in
 * @method contains
 * @param  {Region}  region The region to evaluate
 * @return {Boolean}        True if the region is contained with this region, 
 *                          else false
 */
YAHOO.util.Region.prototype.contains = function(region) {
    return ( region.left   >= this.left   && 
             region.right  <= this.right  && 
             region.top    >= this.top    && 
             region.bottom <= this.bottom    );

};

/**
 * Returns the area of the region
 * @method getArea
 * @return {Int} the region's area
 */
YAHOO.util.Region.prototype.getArea = function() {
    return ( (this.bottom - this.top) * (this.right - this.left) );
};

/**
 * Returns the region where the passed in region overlaps with this one
 * @method intersect
 * @param  {Region} region The region that intersects
 * @return {Region}        The overlap region, or null if there is no overlap
 */
YAHOO.util.Region.prototype.intersect = function(region) {
    var t = Math.max( this.top,    region.top    ),
        r = Math.min( this.right,  region.right  ),
        b = Math.min( this.bottom, region.bottom ),
        l = Math.max( this.left,   region.left   );
    
    if (b >= t && r >= l) {
        return new YAHOO.util.Region(t, r, b, l);
    } else {
        return null;
    }
};

/**
 * Returns the region representing the smallest region that can contain both
 * the passed in region and this region.
 * @method union
 * @param  {Region} region The region that to create the union with
 * @return {Region}        The union region
 */
YAHOO.util.Region.prototype.union = function(region) {
    var t = Math.min( this.top,    region.top    ),
        r = Math.max( this.right,  region.right  ),
        b = Math.max( this.bottom, region.bottom ),
        l = Math.min( this.left,   region.left   );

    return new YAHOO.util.Region(t, r, b, l);
};

/**
 * toString
 * @method toString
 * @return string the region properties
 */
YAHOO.util.Region.prototype.toString = function() {
    return ( "Region {"    +
             "top: "       + this.top    + 
             ", right: "   + this.right  + 
             ", bottom: "  + this.bottom + 
             ", left: "    + this.left   + 
             ", height: "  + this.height + 
             ", width: "    + this.width   + 
             "}" );
};

/**
 * Returns a region that is occupied by the DOM element
 * @method getRegion
 * @param  {HTMLElement} el The element
 * @return {Region}         The region that the element occupies
 * @static
 */
YAHOO.util.Region.getRegion = function(el) {
    var p = YAHOO.util.Dom.getXY(el),
        t = p[1],
        r = p[0] + el.offsetWidth,
        b = p[1] + el.offsetHeight,
        l = p[0];

    return new YAHOO.util.Region(t, r, b, l);
};

/////////////////////////////////////////////////////////////////////////////


/**
 * A point is a region that is special in that it represents a single point on 
 * the grid.
 * @namespace YAHOO.util
 * @class Point
 * @param {Int} x The X position of the point
 * @param {Int} y The Y position of the point
 * @constructor
 * @extends YAHOO.util.Region
 */
YAHOO.util.Point = function(x, y) {
   if (YAHOO.lang.isArray(x)) { // accept input from Dom.getXY, Event.getXY, etc.
      y = x[1]; // dont blow away x yet
      x = x[0];
   }
 
    YAHOO.util.Point.superclass.constructor.call(this, y, x, y, x);
};

YAHOO.extend(YAHOO.util.Point, YAHOO.util.Region);

(function() {
/**
 * Add style management functionality to DOM.
 * @module dom
 * @for Dom
 */

var Y = YAHOO.util, 
    CLIENT_TOP = 'clientTop',
    CLIENT_LEFT = 'clientLeft',
    PARENT_NODE = 'parentNode',
    RIGHT = 'right',
    HAS_LAYOUT = 'hasLayout',
    PX = 'px',
    OPACITY = 'opacity',
    AUTO = 'auto',
    BORDER_LEFT_WIDTH = 'borderLeftWidth',
    BORDER_TOP_WIDTH = 'borderTopWidth',
    BORDER_RIGHT_WIDTH = 'borderRightWidth',
    BORDER_BOTTOM_WIDTH = 'borderBottomWidth',
    VISIBLE = 'visible',
    TRANSPARENT = 'transparent',
    HEIGHT = 'height',
    WIDTH = 'width',
    STYLE = 'style',
    CURRENT_STYLE = 'currentStyle',

// IE getComputedStyle
// TODO: unit-less lineHeight (e.g. 1.22)
    re_size = /^width|height$/,
    re_unit = /^(\d[.\d]*)+(em|ex|px|gd|rem|vw|vh|vm|ch|mm|cm|in|pt|pc|deg|rad|ms|s|hz|khz|%){1}?/i,

    ComputedStyle = {
        get: function(el, property) {
            var value = '',
                current = el[CURRENT_STYLE][property];

            if (property === OPACITY) {
                value = Y.Dom.getStyle(el, OPACITY);        
            } else if (!current || (current.indexOf && current.indexOf(PX) > -1)) { // no need to convert
                value = current;
            } else if (Y.Dom.IE_COMPUTED[property]) { // use compute function
                value = Y.Dom.IE_COMPUTED[property](el, property);
            } else if (re_unit.test(current)) { // convert to pixel
                value = Y.Dom.IE.ComputedStyle.getPixel(el, property);
            } else {
                value = current;
            }

            return value;
        },

        getOffset: function(el, prop) {
            var current = el[CURRENT_STYLE][prop],                        // value of "width", "top", etc.
                capped = prop.charAt(0).toUpperCase() + prop.substr(1), // "Width", "Top", etc.
                offset = 'offset' + capped,                             // "offsetWidth", "offsetTop", etc.
                pixel = 'pixel' + capped,                               // "pixelWidth", "pixelTop", etc.
                value = '',
                actual;

            if (current == AUTO) {
                actual = el[offset]; // offsetHeight/Top etc.
                if (actual === undefined) { // likely "right" or "bottom"
                    value = 0;
                }

                value = actual;
                if (re_size.test(prop)) { // account for box model diff 
                    el[STYLE][prop] = actual; 
                    if (el[offset] > actual) {
                        // the difference is padding + border (works in Standards & Quirks modes)
                        value = actual - (el[offset] - actual);
                    }
                    el[STYLE][prop] = AUTO; // revert to auto
                }
            } else { // convert units to px
                if (!el[STYLE][pixel] && !el[STYLE][prop]) { // need to map style.width to currentStyle (no currentStyle.pixelWidth)
                    el[STYLE][prop] = current;              // no style.pixelWidth if no style.width
                }
                value = el[STYLE][pixel];
            }
            return value + PX;
        },

        getBorderWidth: function(el, property) {
            // clientHeight/Width = paddingBox (e.g. offsetWidth - borderWidth)
            // clientTop/Left = borderWidth
            var value = null;
            if (!el[CURRENT_STYLE][HAS_LAYOUT]) { // TODO: unset layout?
                el[STYLE].zoom = 1; // need layout to measure client
            }

            switch(property) {
                case BORDER_TOP_WIDTH:
                    value = el[CLIENT_TOP];
                    break;
                case BORDER_BOTTOM_WIDTH:
                    value = el.offsetHeight - el.clientHeight - el[CLIENT_TOP];
                    break;
                case BORDER_LEFT_WIDTH:
                    value = el[CLIENT_LEFT];
                    break;
                case BORDER_RIGHT_WIDTH:
                    value = el.offsetWidth - el.clientWidth - el[CLIENT_LEFT];
                    break;
            }
            return value + PX;
        },

        getPixel: function(node, att) {
            // use pixelRight to convert to px
            var val = null,
                styleRight = node[CURRENT_STYLE][RIGHT],
                current = node[CURRENT_STYLE][att];

            node[STYLE][RIGHT] = current;
            val = node[STYLE].pixelRight;
            node[STYLE][RIGHT] = styleRight; // revert

            return val + PX;
        },

        getMargin: function(node, att) {
            var val;
            if (node[CURRENT_STYLE][att] == AUTO) {
                val = 0 + PX;
            } else {
                val = Y.Dom.IE.ComputedStyle.getPixel(node, att);
            }
            return val;
        },

        getVisibility: function(node, att) {
            var current;
            while ( (current = node[CURRENT_STYLE]) && current[att] == 'inherit') { // NOTE: assignment in test
                node = node[PARENT_NODE];
            }
            return (current) ? current[att] : VISIBLE;
        },

        getColor: function(node, att) {
            return Y.Dom.Color.toRGB(node[CURRENT_STYLE][att]) || TRANSPARENT;
        },

        getBorderColor: function(node, att) {
            var current = node[CURRENT_STYLE],
                val = current[att] || current.color;
            return Y.Dom.Color.toRGB(Y.Dom.Color.toHex(val));
        }

    },

//fontSize: getPixelFont,
    IEComputed = {};

IEComputed.top = IEComputed.right = IEComputed.bottom = IEComputed.left = 
        IEComputed[WIDTH] = IEComputed[HEIGHT] = ComputedStyle.getOffset;

IEComputed.color = ComputedStyle.getColor;

IEComputed[BORDER_TOP_WIDTH] = IEComputed[BORDER_RIGHT_WIDTH] =
        IEComputed[BORDER_BOTTOM_WIDTH] = IEComputed[BORDER_LEFT_WIDTH] =
        ComputedStyle.getBorderWidth;

IEComputed.marginTop = IEComputed.marginRight = IEComputed.marginBottom =
        IEComputed.marginLeft = ComputedStyle.getMargin;

IEComputed.visibility = ComputedStyle.getVisibility;
IEComputed.borderColor = IEComputed.borderTopColor =
        IEComputed.borderRightColor = IEComputed.borderBottomColor =
        IEComputed.borderLeftColor = ComputedStyle.getBorderColor;

Y.Dom.IE_COMPUTED = IEComputed;
Y.Dom.IE_ComputedStyle = ComputedStyle;
})();
(function() {
/**
 * Add style management functionality to DOM.
 * @module dom
 * @for Dom
 */

var TO_STRING = 'toString',
    PARSE_INT = parseInt,
    RE = RegExp,
    Y = YAHOO.util;

Y.Dom.Color = {
    KEYWORDS: {
        black: '000',
        silver: 'c0c0c0',
        gray: '808080',
        white: 'fff',
        maroon: '800000',
        red: 'f00',
        purple: '800080',
        fuchsia: 'f0f',
        green: '008000',
        lime: '0f0',
        olive: '808000',
        yellow: 'ff0',
        navy: '000080',
        blue: '00f',
        teal: '008080',
        aqua: '0ff'
    },

    re_RGB: /^rgb\(([0-9]+)\s*,\s*([0-9]+)\s*,\s*([0-9]+)\)$/i,
    re_hex: /^#?([0-9A-F]{2})([0-9A-F]{2})([0-9A-F]{2})$/i,
    re_hex3: /([0-9A-F])/gi,

    toRGB: function(val) {
        if (!Y.Dom.Color.re_RGB.test(val)) {
            val = Y.Dom.Color.toHex(val);
        }

        if(Y.Dom.Color.re_hex.exec(val)) {
            val = 'rgb(' + [
                PARSE_INT(RE.$1, 16),
                PARSE_INT(RE.$2, 16),
                PARSE_INT(RE.$3, 16)
            ].join(', ') + ')';
        }
        return val;
    },

    toHex: function(val) {
        val = Y.Dom.Color.KEYWORDS[val] || val;
        if (Y.Dom.Color.re_RGB.exec(val)) {
            var r = (RE.$1.length === 1) ? '0' + RE.$1 : Number(RE.$1),
                g = (RE.$2.length === 1) ? '0' + RE.$2 : Number(RE.$2),
                b = (RE.$3.length === 1) ? '0' + RE.$3 : Number(RE.$3);

            val = [
                r[TO_STRING](16),
                g[TO_STRING](16),
                b[TO_STRING](16)
            ].join('');
        }

        if (val.length < 6) {
            val = val.replace(Y.Dom.Color.re_hex3, '$1$1');
        }

        if (val !== 'transparent' && val.indexOf('#') < 0) {
            val = '#' + val;
        }

        return val.toLowerCase();
    }
};
}());
YAHOO.register("dom", YAHOO.util.Dom, {version: "2.8.0r4", build: "2446"});
/*
Copyright (c) 2009, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://developer.yahoo.net/yui/license.txt
version: 2.8.0r4
*/
/****************************************************************************/
/****************************************************************************/
/****************************************************************************/

/**
 * The LogMsg class defines a single log message.
 *
 * @class LogMsg
 * @constructor
 * @param oConfigs {Object} Object literal of configuration params.
 */
YAHOO.widget.LogMsg = function(oConfigs) {
    // Parse configs
    /**
     * Log message.
     *
     * @property msg
     * @type String
     */
    this.msg =
    /**
     * Log timestamp.
     *
     * @property time
     * @type Date
     */
    this.time =

    /**
     * Log category.
     *
     * @property category
     * @type String
     */
    this.category =

    /**
     * Log source. The first word passed in as the source argument.
     *
     * @property source
     * @type String
     */
    this.source =

    /**
     * Log source detail. The remainder of the string passed in as the source argument, not
     * including the first word (if any).
     *
     * @property sourceDetail
     * @type String
     */
    this.sourceDetail = null;

    if (oConfigs && (oConfigs.constructor == Object)) {
        for(var param in oConfigs) {
            if (oConfigs.hasOwnProperty(param)) {
                this[param] = oConfigs[param];
            }
        }
    }
};
/****************************************************************************/
/****************************************************************************/
/****************************************************************************/

/**
 * The LogWriter class provides a mechanism to log messages through
 * YAHOO.widget.Logger from a named source.
 *
 * @class LogWriter
 * @constructor
 * @param sSource {String} Source of LogWriter instance.
 */
YAHOO.widget.LogWriter = function(sSource) {
    if(!sSource) {
        YAHOO.log("Could not instantiate LogWriter due to invalid source.",
            "error", "LogWriter");
        return;
    }
    this._source = sSource;
 };

/////////////////////////////////////////////////////////////////////////////
//
// Public methods
//
/////////////////////////////////////////////////////////////////////////////

 /**
 * Public accessor to the unique name of the LogWriter instance.
 *
 * @method toString
 * @return {String} Unique name of the LogWriter instance.
 */
YAHOO.widget.LogWriter.prototype.toString = function() {
    return "LogWriter " + this._sSource;
};

/**
 * Logs a message attached to the source of the LogWriter.
 *
 * @method log
 * @param sMsg {String} The log message.
 * @param sCategory {String} Category name.
 */
YAHOO.widget.LogWriter.prototype.log = function(sMsg, sCategory) {
    YAHOO.widget.Logger.log(sMsg, sCategory, this._source);
};

/**
 * Public accessor to get the source name.
 *
 * @method getSource
 * @return {String} The LogWriter source.
 */
YAHOO.widget.LogWriter.prototype.getSource = function() {
    return this._source;
};

/**
 * Public accessor to set the source name.
 *
 * @method setSource
 * @param sSource {String} Source of LogWriter instance.
 */
YAHOO.widget.LogWriter.prototype.setSource = function(sSource) {
    if(!sSource) {
        YAHOO.log("Could not set source due to invalid source.", "error", this.toString());
        return;
    }
    else {
        this._source = sSource;
    }
};

/////////////////////////////////////////////////////////////////////////////
//
// Private member variables
//
/////////////////////////////////////////////////////////////////////////////

/**
 * Source of the LogWriter instance.
 *
 * @property _source
 * @type String
 * @private
 */
YAHOO.widget.LogWriter.prototype._source = null;



 /**
 * The Logger widget provides a simple way to read or write log messages in
 * JavaScript code. Integration with the YUI Library's debug builds allow
 * implementers to access under-the-hood events, errors, and debugging messages.
 * Output may be read through a LogReader console and/or output to a browser
 * console.
 *
 * @module logger
 * @requires yahoo, event, dom
 * @optional dragdrop
 * @namespace YAHOO.widget
 * @title Logger Widget
 */

/****************************************************************************/
/****************************************************************************/
/****************************************************************************/

// Define once
if(!YAHOO.widget.Logger) {
    /**
     * The singleton Logger class provides core log management functionality. Saves
     * logs written through the global YAHOO.log function or written by a LogWriter
     * instance. Provides access to logs for reading by a LogReader instance or
     * native browser console such as the Firebug extension to Firefox or Safari's
     * JavaScript console through integration with the console.log() method.
     *
     * @class Logger
     * @static
     */
    YAHOO.widget.Logger = {
        // Initialize properties
        loggerEnabled: true,
        _browserConsoleEnabled: false,
        categories: ["info","warn","error","time","window"],
        sources: ["global"],
        _stack: [], // holds all log msgs
        maxStackEntries: 2500,
        _startTime: new Date().getTime(), // static start timestamp
        _lastTime: null, // timestamp of last logged message
        _windowErrorsHandled: false,
        _origOnWindowError: null
    };

    /////////////////////////////////////////////////////////////////////////////
    //
    // Public properties
    //
    /////////////////////////////////////////////////////////////////////////////
    /**
     * True if Logger is enabled, false otherwise.
     *
     * @property loggerEnabled
     * @type Boolean
     * @static
     * @default true
     */

    /**
     * Array of categories.
     *
     * @property categories
     * @type String[]
     * @static
     * @default ["info","warn","error","time","window"]
     */

    /**
     * Array of sources.
     *
     * @property sources
     * @type String[]
     * @static
     * @default ["global"]
     */

    /**
     * Upper limit on size of internal stack.
     *
     * @property maxStackEntries
     * @type Number
     * @static
     * @default 2500
     */

    /////////////////////////////////////////////////////////////////////////////
    //
    // Private properties
    //
    /////////////////////////////////////////////////////////////////////////////
    /**
     * Internal property to track whether output to browser console is enabled.
     *
     * @property _browserConsoleEnabled
     * @type Boolean
     * @static
     * @default false
     * @private
     */

    /**
     * Array to hold all log messages.
     *
     * @property _stack
     * @type Array
     * @static
     * @private
     */
    /**
     * Static timestamp of Logger initialization.
     *
     * @property _startTime
     * @type Date
     * @static
     * @private
     */
    /**
     * Timestamp of last logged message.
     *
     * @property _lastTime
     * @type Date
     * @static
     * @private
     */
    /////////////////////////////////////////////////////////////////////////////
    //
    // Public methods
    //
    /////////////////////////////////////////////////////////////////////////////
    /**
     * Saves a log message to the stack and fires newLogEvent. If the log message is
     * assigned to an unknown category, creates a new category. If the log message is
     * from an unknown source, creates a new source.  If browser console is enabled,
     * outputs the log message to browser console.
     *
     * @method log
     * @param sMsg {String} The log message.
     * @param sCategory {String} Category of log message, or null.
     * @param sSource {String} Source of LogWriter, or null if global.
     */
    YAHOO.widget.Logger.log = function(sMsg, sCategory, sSource) {
        if(this.loggerEnabled) {
            if(!sCategory) {
                sCategory = "info"; // default category
            }
            else {
                sCategory = sCategory.toLocaleLowerCase();
                if(this._isNewCategory(sCategory)) {
                    this._createNewCategory(sCategory);
                }
            }
            var sClass = "global"; // default source
            var sDetail = null;
            if(sSource) {
                var spaceIndex = sSource.indexOf(" ");
                if(spaceIndex > 0) {
                    // Substring until first space
                    sClass = sSource.substring(0,spaceIndex);
                    // The rest of the source
                    sDetail = sSource.substring(spaceIndex,sSource.length);
                }
                else {
                    sClass = sSource;
                }
                if(this._isNewSource(sClass)) {
                    this._createNewSource(sClass);
                }
            }

            var timestamp = new Date();
            var logEntry = new YAHOO.widget.LogMsg({
                msg: sMsg,
                time: timestamp,
                category: sCategory,
                source: sClass,
                sourceDetail: sDetail
            });

            var stack = this._stack;
            var maxStackEntries = this.maxStackEntries;
            if(maxStackEntries && !isNaN(maxStackEntries) &&
                (stack.length >= maxStackEntries)) {
                stack.shift();
            }
            stack.push(logEntry);
            this.newLogEvent.fire(logEntry);

            if(this._browserConsoleEnabled) {
                this._printToBrowserConsole(logEntry);
            }
            return true;
        }
        else {
            return false;
        }
    };

    /**
     * Resets internal stack and startTime, enables Logger, and fires logResetEvent.
     *
     * @method reset
     */
    YAHOO.widget.Logger.reset = function() {
        this._stack = [];
        this._startTime = new Date().getTime();
        this.loggerEnabled = true;
        this.log("Logger reset");
        this.logResetEvent.fire();
    };

    /**
     * Public accessor to internal stack of log message objects.
     *
     * @method getStack
     * @return {Object[]} Array of log message objects.
     */
    YAHOO.widget.Logger.getStack = function() {
        return this._stack;
    };

    /**
     * Public accessor to internal start time.
     *
     * @method getStartTime
     * @return {Date} Internal date of when Logger singleton was initialized.
     */
    YAHOO.widget.Logger.getStartTime = function() {
        return this._startTime;
    };

    /**
     * Disables output to the browser's global console.log() function, which is used
     * by the Firebug extension to Firefox as well as Safari.
     *
     * @method disableBrowserConsole
     */
    YAHOO.widget.Logger.disableBrowserConsole = function() {
        YAHOO.log("Logger output to the function console.log() has been disabled.");
        this._browserConsoleEnabled = false;
    };

    /**
     * Enables output to the browser's global console.log() function, which is used
     * by the Firebug extension to Firefox as well as Safari.
     *
     * @method enableBrowserConsole
     */
    YAHOO.widget.Logger.enableBrowserConsole = function() {
        this._browserConsoleEnabled = true;
        YAHOO.log("Logger output to the function console.log() has been enabled.");
    };

    /**
     * Surpresses native JavaScript errors and outputs to console. By default,
     * Logger does not handle JavaScript window error events.
     * NB: Not all browsers support the window.onerror event.
     *
     * @method handleWindowErrors
     */
    YAHOO.widget.Logger.handleWindowErrors = function() {
        if(!YAHOO.widget.Logger._windowErrorsHandled) {
            // Save any previously defined handler to call
            if(window.error) {
                YAHOO.widget.Logger._origOnWindowError = window.onerror;
            }
            window.onerror = YAHOO.widget.Logger._onWindowError;
            YAHOO.widget.Logger._windowErrorsHandled = true;
            YAHOO.log("Logger handling of window.onerror has been enabled.");
        }
        else {
            YAHOO.log("Logger handling of window.onerror had already been enabled.");
        }
    };

    /**
     * Unsurpresses native JavaScript errors. By default,
     * Logger does not handle JavaScript window error events.
     * NB: Not all browsers support the window.onerror event.
     *
     * @method unhandleWindowErrors
     */
    YAHOO.widget.Logger.unhandleWindowErrors = function() {
        if(YAHOO.widget.Logger._windowErrorsHandled) {
            // Revert to any previously defined handler to call
            if(YAHOO.widget.Logger._origOnWindowError) {
                window.onerror = YAHOO.widget.Logger._origOnWindowError;
                YAHOO.widget.Logger._origOnWindowError = null;
            }
            else {
                window.onerror = null;
            }
            YAHOO.widget.Logger._windowErrorsHandled = false;
            YAHOO.log("Logger handling of window.onerror has been disabled.");
        }
        else {
            YAHOO.log("Logger handling of window.onerror had already been disabled.");
        }
    };
    
    /////////////////////////////////////////////////////////////////////////////
    //
    // Public events
    //
    /////////////////////////////////////////////////////////////////////////////

     /**
     * Fired when a new category has been created.
     *
     * @event categoryCreateEvent
     * @param sCategory {String} Category name.
     */
    YAHOO.widget.Logger.categoryCreateEvent =
        new YAHOO.util.CustomEvent("categoryCreate", this, true);

     /**
     * Fired when a new source has been named.
     *
     * @event sourceCreateEvent
     * @param sSource {String} Source name.
     */
    YAHOO.widget.Logger.sourceCreateEvent =
        new YAHOO.util.CustomEvent("sourceCreate", this, true);

     /**
     * Fired when a new log message has been created.
     *
     * @event newLogEvent
     * @param sMsg {String} Log message.
     */
    YAHOO.widget.Logger.newLogEvent = new YAHOO.util.CustomEvent("newLog", this, true);

    /**
     * Fired when the Logger has been reset has been created.
     *
     * @event logResetEvent
     */
    YAHOO.widget.Logger.logResetEvent = new YAHOO.util.CustomEvent("logReset", this, true);

    /////////////////////////////////////////////////////////////////////////////
    //
    // Private methods
    //
    /////////////////////////////////////////////////////////////////////////////

    /**
     * Creates a new category of log messages and fires categoryCreateEvent.
     *
     * @method _createNewCategory
     * @param sCategory {String} Category name.
     * @private
     */
    YAHOO.widget.Logger._createNewCategory = function(sCategory) {
        this.categories.push(sCategory);
        this.categoryCreateEvent.fire(sCategory);
    };

    /**
     * Checks to see if a category has already been created.
     *
     * @method _isNewCategory
     * @param sCategory {String} Category name.
     * @return {Boolean} Returns true if category is unknown, else returns false.
     * @private
     */
    YAHOO.widget.Logger._isNewCategory = function(sCategory) {
        for(var i=0; i < this.categories.length; i++) {
            if(sCategory == this.categories[i]) {
                return false;
            }
        }
        return true;
    };

    /**
     * Creates a new source of log messages and fires sourceCreateEvent.
     *
     * @method _createNewSource
     * @param sSource {String} Source name.
     * @private
     */
    YAHOO.widget.Logger._createNewSource = function(sSource) {
        this.sources.push(sSource);
        this.sourceCreateEvent.fire(sSource);
    };

    /**
     * Checks to see if a source already exists.
     *
     * @method _isNewSource
     * @param sSource {String} Source name.
     * @return {Boolean} Returns true if source is unknown, else returns false.
     * @private
     */
    YAHOO.widget.Logger._isNewSource = function(sSource) {
        if(sSource) {
            for(var i=0; i < this.sources.length; i++) {
                if(sSource == this.sources[i]) {
                    return false;
                }
            }
            return true;
        }
    };

    /**
     * Outputs a log message to global console.log() function.
     *
     * @method _printToBrowserConsole
     * @param oEntry {Object} Log entry object.
     * @private
     */
    YAHOO.widget.Logger._printToBrowserConsole = function(oEntry) {
        if(window.console && console.log) {
            var category = oEntry.category;
            var label = oEntry.category.substring(0,4).toUpperCase();

            var time = oEntry.time;
            var localTime;
            if (time.toLocaleTimeString) {
                localTime  = time.toLocaleTimeString();
            }
            else {
                localTime = time.toString();
            }

            var msecs = time.getTime();
            var elapsedTime = (YAHOO.widget.Logger._lastTime) ?
                (msecs - YAHOO.widget.Logger._lastTime) : 0;
            YAHOO.widget.Logger._lastTime = msecs;

            var output =
                localTime + " (" +
                elapsedTime + "ms): " +
                oEntry.source + ": ";

            // for bug 1987607
            if (YAHOO.env.ua.webkit) {
                output += oEntry.msg;
            }

            console.log(output, oEntry.msg);
        }
    };

    /////////////////////////////////////////////////////////////////////////////
    //
    // Private event handlers
    //
    /////////////////////////////////////////////////////////////////////////////

    /**
     * Handles logging of messages due to window error events.
     *
     * @method _onWindowError
     * @param sMsg {String} The error message.
     * @param sUrl {String} URL of the error.
     * @param sLine {String} Line number of the error.
     * @private
     */
    YAHOO.widget.Logger._onWindowError = function(sMsg,sUrl,sLine) {
        // Logger is not in scope of this event handler
        try {
            YAHOO.widget.Logger.log(sMsg+' ('+sUrl+', line '+sLine+')', "window");
            if(YAHOO.widget.Logger._origOnWindowError) {
                YAHOO.widget.Logger._origOnWindowError();
            }
        }
        catch(e) {
            return false;
        }
    };

    /////////////////////////////////////////////////////////////////////////////
    //
    // First log
    //
    /////////////////////////////////////////////////////////////////////////////

    YAHOO.widget.Logger.log("Logger initialized");
}

/****************************************************************************/
/****************************************************************************/
/****************************************************************************/
(function () {
var Logger = YAHOO.widget.Logger,
    u      = YAHOO.util,
    Dom    = u.Dom,
    Event  = u.Event,
    d      = document;

function make(el,props) {
    el = d.createElement(el);
    if (props) {
        for (var p in props) {
            if (props.hasOwnProperty(p)) {
                el[p] = props[p];
            }
        }
    }
    return el;
}

/**
 * The LogReader class provides UI to read messages logged to YAHOO.widget.Logger.
 *
 * @class LogReader
 * @constructor
 * @param elContainer {HTMLElement} (optional) DOM element reference of an existing DIV.
 * @param elContainer {String} (optional) String ID of an existing DIV.
 * @param oConfigs {Object} (optional) Object literal of configuration params.
 */
function LogReader(elContainer, oConfigs) {
    this._sName = LogReader._index;
    LogReader._index++;
    
    this._init.apply(this,arguments);

    /**
     * Render the LogReader immediately upon instantiation.  If set to false,
     * you must call myLogReader.render() to generate the UI.
     * 
     * @property autoRender
     * @type {Boolean}
     * @default true
     */
    if (this.autoRender !== false) {
        this.render();
    }
}

/////////////////////////////////////////////////////////////////////////////
//
// Static member variables
//
/////////////////////////////////////////////////////////////////////////////
YAHOO.lang.augmentObject(LogReader, {
    /**
     * Internal class member to index multiple LogReader instances.
     *
     * @property _memberName
     * @static
     * @type Number
     * @default 0
     * @private
     */
    _index : 0,

    /**
     * Node template for the log entries
     * @property ENTRY_TEMPLATE
     * @static
     * @type {HTMLElement}
     * @default <code>pre</code> element with class yui-log-entry
     */
    ENTRY_TEMPLATE : (function () {
        return make('pre',{ className: 'yui-log-entry' });
    })(),

    /**
     * Template used for innerHTML of verbose entry output.
     * @property VERBOSE_TEMPLATE
     * @static
     * @default "&lt;p>&lt;span class='{category}'>{label}&lt;/span>{totalTime}ms (+{elapsedTime}) {localTime}:&lt;/p>&lt;p>{sourceAndDetail}&lt;/p>&lt;p>{message}&lt;/p>"
     */
    VERBOSE_TEMPLATE : "<p><span class='{category}'>{label}</span> {totalTime}ms (+{elapsedTime}) {localTime}:</p><p>{sourceAndDetail}</p><p>{message}</p>",

    /**
     * Template used for innerHTML of compact entry output.
     * @property BASIC_TEMPLATE
     * @static
     * @default "&lt;p>&lt;span class='{category}'>{label}&lt;/span>{totalTime}ms (+{elapsedTime}) {localTime}: {sourceAndDetail}: {message}&lt;/p>"
     */
    BASIC_TEMPLATE : "<p><span class='{category}'>{label}</span> {totalTime}ms (+{elapsedTime}) {localTime}: {sourceAndDetail}: {message}</p>"
});

/////////////////////////////////////////////////////////////////////////////
//
// Public member variables
//
/////////////////////////////////////////////////////////////////////////////

LogReader.prototype = {
    /**
     * Whether or not LogReader is enabled to output log messages.
     *
     * @property logReaderEnabled
     * @type Boolean
     * @default true
     */
    logReaderEnabled : true,

    /**
     * Public member to access CSS width of the LogReader container.
     *
     * @property width
     * @type String
     */
    width : null,

    /**
     * Public member to access CSS height of the LogReader container.
     *
     * @property height
     * @type String
     */
    height : null,

    /**
     * Public member to access CSS top position of the LogReader container.
     *
     * @property top
     * @type String
     */
    top : null,

    /**
     * Public member to access CSS left position of the LogReader container.
     *
     * @property left
     * @type String
     */
    left : null,

    /**
     * Public member to access CSS right position of the LogReader container.
     *
     * @property right
     * @type String
     */
    right : null,

    /**
     * Public member to access CSS bottom position of the LogReader container.
     *
     * @property bottom
     * @type String
     */
    bottom : null,

    /**
     * Public member to access CSS font size of the LogReader container.
     *
     * @property fontSize
     * @type String
     */
    fontSize : null,

    /**
     * Whether or not the footer UI is enabled for the LogReader.
     *
     * @property footerEnabled
     * @type Boolean
     * @default true
     */
    footerEnabled : true,

    /**
     * Whether or not output is verbose (more readable). Setting to true will make
     * output more compact (less readable).
     *
     * @property verboseOutput
     * @type Boolean
     * @default true
     */
    verboseOutput : true,

    /**
     * Custom output format for log messages.  Defaults to null, which falls
     * back to verboseOutput param deciding between LogReader.VERBOSE_TEMPLATE
     * and LogReader.BASIC_TEMPLATE.  Use bracketed place holders to mark where
     * message info should go.  Available place holder names include:
     * <ul>
     *  <li>category</li>
     *  <li>label</li>
     *  <li>sourceAndDetail</li>
     *  <li>message</li>
     *  <li>localTime</li>
     *  <li>elapsedTime</li>
     *  <li>totalTime</li>
     * </ul>
     *
     * @property entryFormat
     * @type String
     * @default null
     */
    entryFormat : null,

    /**
     * Whether or not newest message is printed on top.
     *
     * @property newestOnTop
     * @type Boolean
     */
    newestOnTop : true,

    /**
     * Output timeout buffer in milliseconds.
     *
     * @property outputBuffer
     * @type Number
     * @default 100
     */
    outputBuffer : 100,

    /**
     * Maximum number of messages a LogReader console will display.
     *
     * @property thresholdMax
     * @type Number
     * @default 500
     */
    thresholdMax : 500,

    /**
     * When a LogReader console reaches its thresholdMax, it will clear out messages
     * and print out the latest thresholdMin number of messages.
     *
     * @property thresholdMin
     * @type Number
     * @default 100
     */
    thresholdMin : 100,

    /**
     * True when LogReader is in a collapsed state, false otherwise.
     *
     * @property isCollapsed
     * @type Boolean
     * @default false
     */
    isCollapsed : false,

    /**
     * True when LogReader is in a paused state, false otherwise.
     *
     * @property isPaused
     * @type Boolean
     * @default false
     */
    isPaused : false,

    /**
     * Enables draggable LogReader if DragDrop Utility is present.
     *
     * @property draggable
     * @type Boolean
     * @default true
     */
    draggable : true,

    /////////////////////////////////////////////////////////////////////////////
    //
    // Public methods
    //
    /////////////////////////////////////////////////////////////////////////////

     /**
     * Public accessor to the unique name of the LogReader instance.
     *
     * @method toString
     * @return {String} Unique name of the LogReader instance.
     */
    toString : function() {
        return "LogReader instance" + this._sName;
    },
    /**
     * Pauses output of log messages. While paused, log messages are not lost, but
     * get saved to a buffer and then output upon resume of LogReader.
     *
     * @method pause
     */
    pause : function() {
        this.isPaused = true;
        this._timeout = null;
        this.logReaderEnabled = false;
        if (this._btnPause) {
            this._btnPause.value = "Resume";
        }
    },

    /**
     * Resumes output of log messages, including outputting any log messages that
     * have been saved to buffer while paused.
     *
     * @method resume
     */
    resume : function() {
        this.isPaused = false;
        this.logReaderEnabled = true;
        this._printBuffer();
        if (this._btnPause) {
            this._btnPause.value = "Pause";
        }
    },

    /**
     * Adds the UI to the DOM, attaches event listeners, and bootstraps initial
     * UI state.
     *
     * @method render
     */
    render : function () {
        if (this.rendered) {
            return;
        }

        this._initContainerEl();
        
        this._initHeaderEl();
        this._initConsoleEl();
        this._initFooterEl();

        this._initCategories();
        this._initSources();

        this._initDragDrop();

        // Subscribe to Logger custom events
        Logger.newLogEvent.subscribe(this._onNewLog, this);
        Logger.logResetEvent.subscribe(this._onReset, this);

        Logger.categoryCreateEvent.subscribe(this._onCategoryCreate, this);
        Logger.sourceCreateEvent.subscribe(this._onSourceCreate, this);

        this.rendered = true;

        this._filterLogs();
    },

    /**
     * Removes the UI from the DOM entirely and detaches all event listeners.
     * Implementers should note that Logger will still accumulate messages.
     *
     * @method destroy
     */
    destroy : function () {
        Event.purgeElement(this._elContainer,true);
        this._elContainer.innerHTML = '';
        this._elContainer.parentNode.removeChild(this._elContainer);

        this.rendered = false;
    },

    /**
     * Hides UI of LogReader. Logging functionality is not disrupted.
     *
     * @method hide
     */
    hide : function() {
        this._elContainer.style.display = "none";
    },

    /**
     * Shows UI of LogReader. Logging functionality is not disrupted.
     *
     * @method show
     */
    show : function() {
        this._elContainer.style.display = "block";
    },

    /**
     * Collapses UI of LogReader. Logging functionality is not disrupted.
     *
     * @method collapse
     */
    collapse : function() {
        this._elConsole.style.display = "none";
        if(this._elFt) {
            this._elFt.style.display = "none";
        }
        this._btnCollapse.value = "Expand";
        this.isCollapsed = true;
    },

    /**
     * Expands UI of LogReader. Logging functionality is not disrupted.
     *
     * @method expand
     */
    expand : function() {
        this._elConsole.style.display = "block";
        if(this._elFt) {
            this._elFt.style.display = "block";
        }
        this._btnCollapse.value = "Collapse";
        this.isCollapsed = false;
    },

    /**
     * Returns related checkbox element for given filter (i.e., category or source).
     *
     * @method getCheckbox
     * @param {String} Category or source name.
     * @return {Array} Array of all filter checkboxes.
     */
    getCheckbox : function(filter) {
        return this._filterCheckboxes[filter];
    },

    /**
     * Returns array of enabled categories.
     *
     * @method getCategories
     * @return {String[]} Array of enabled categories.
     */
    getCategories : function() {
        return this._categoryFilters;
    },

    /**
     * Shows log messages associated with given category.
     *
     * @method showCategory
     * @param {String} Category name.
     */
    showCategory : function(sCategory) {
        var filtersArray = this._categoryFilters;
        // Don't do anything if category is already enabled
        // Use Array.indexOf if available...
        if(filtersArray.indexOf) {
             if(filtersArray.indexOf(sCategory) >  -1) {
                return;
            }
        }
        // ...or do it the old-fashioned way
        else {
            for(var i=0; i<filtersArray.length; i++) {
               if(filtersArray[i] === sCategory){
                    return;
                }
            }
        }

        this._categoryFilters.push(sCategory);
        this._filterLogs();
        var elCheckbox = this.getCheckbox(sCategory);
        if(elCheckbox) {
            elCheckbox.checked = true;
        }
    },

    /**
     * Hides log messages associated with given category.
     *
     * @method hideCategory
     * @param {String} Category name.
     */
    hideCategory : function(sCategory) {
        var filtersArray = this._categoryFilters;
        for(var i=0; i<filtersArray.length; i++) {
            if(sCategory == filtersArray[i]) {
                filtersArray.splice(i, 1);
                break;
            }
        }
        this._filterLogs();
        var elCheckbox = this.getCheckbox(sCategory);
        if(elCheckbox) {
            elCheckbox.checked = false;
        }
    },

    /**
     * Returns array of enabled sources.
     *
     * @method getSources
     * @return {Array} Array of enabled sources.
     */
    getSources : function() {
        return this._sourceFilters;
    },

    /**
     * Shows log messages associated with given source.
     *
     * @method showSource
     * @param {String} Source name.
     */
    showSource : function(sSource) {
        var filtersArray = this._sourceFilters;
        // Don't do anything if category is already enabled
        // Use Array.indexOf if available...
        if(filtersArray.indexOf) {
             if(filtersArray.indexOf(sSource) >  -1) {
                return;
            }
        }
        // ...or do it the old-fashioned way
        else {
            for(var i=0; i<filtersArray.length; i++) {
               if(sSource == filtersArray[i]){
                    return;
                }
            }
        }
        filtersArray.push(sSource);
        this._filterLogs();
        var elCheckbox = this.getCheckbox(sSource);
        if(elCheckbox) {
            elCheckbox.checked = true;
        }
    },

    /**
     * Hides log messages associated with given source.
     *
     * @method hideSource
     * @param {String} Source name.
     */
    hideSource : function(sSource) {
        var filtersArray = this._sourceFilters;
        for(var i=0; i<filtersArray.length; i++) {
            if(sSource == filtersArray[i]) {
                filtersArray.splice(i, 1);
                break;
            }
        }
        this._filterLogs();
        var elCheckbox = this.getCheckbox(sSource);
        if(elCheckbox) {
            elCheckbox.checked = false;
        }
    },

    /**
     * Does not delete any log messages, but clears all printed log messages from
     * the console. Log messages will be printed out again if user re-filters. The
     * static method YAHOO.widget.Logger.reset() should be called in order to
     * actually delete log messages.
     *
     * @method clearConsole
     */
    clearConsole : function() {
        // Clear the buffer of any pending messages
        this._timeout = null;
        this._buffer = [];
        this._consoleMsgCount = 0;

        var elConsole = this._elConsole;
        elConsole.innerHTML = '';
    },

    /**
     * Updates title to given string.
     *
     * @method setTitle
     * @param sTitle {String} New title.
     */
    setTitle : function(sTitle) {
        this._title.innerHTML = this.html2Text(sTitle);
    },

    /**
     * Gets timestamp of the last log.
     *
     * @method getLastTime
     * @return {Date} Timestamp of the last log.
     */
    getLastTime : function() {
        return this._lastTime;
    },

    formatMsg : function (entry) {
        var entryFormat = this.entryFormat || (this.verboseOutput ?
                          LogReader.VERBOSE_TEMPLATE : LogReader.BASIC_TEMPLATE),
            info        = {
                category : entry.category,

                // Label for color-coded display
                label : entry.category.substring(0,4).toUpperCase(),

                sourceAndDetail : entry.sourceDetail ?
                                  entry.source + " " + entry.sourceDetail :
                                  entry.source,

                // Escape HTML entities in the log message itself for output
                // to console
                message : this.html2Text(entry.msg || entry.message || '')
            };

        // Add time info
        if (entry.time && entry.time.getTime) {
            info.localTime = entry.time.toLocaleTimeString ?
                             entry.time.toLocaleTimeString() :
                             entry.time.toString();

            // Calculate the elapsed time to be from the last item that
            // passed through the filter, not the absolute previous item
            // in the stack
            info.elapsedTime = entry.time.getTime() - this.getLastTime();

            info.totalTime = entry.time.getTime() - Logger.getStartTime();
        }

        var msg = LogReader.ENTRY_TEMPLATE.cloneNode(true);
        if (this.verboseOutput) {
            msg.className += ' yui-log-verbose';
        }

        // Bug 2061169: Workaround for YAHOO.lang.substitute()
        msg.innerHTML = entryFormat.replace(/\{(\w+)\}/g,
            function (x, placeholder) {
                return (placeholder in info) ? info[placeholder] : '';
            });

        return msg;
    },

    /**
     * Converts input chars "<", ">", and "&" to HTML entities.
     *
     * @method html2Text
     * @param sHtml {String} String to convert.
     * @private
     */
    html2Text : function(sHtml) {
        if(sHtml) {
            sHtml += "";
            return sHtml.replace(/&/g, "&#38;").
                         replace(/</g, "&#60;").
                         replace(/>/g, "&#62;");
        }
        return "";
    },

/////////////////////////////////////////////////////////////////////////////
//
// Private member variables
//
/////////////////////////////////////////////////////////////////////////////

    /**
     * Name of LogReader instance.
     *
     * @property _sName
     * @type String
     * @private
     */
    _sName : null,

    //TODO: remove
    /**
     * A class member shared by all LogReaders if a container needs to be
     * created during instantiation. Will be null if a container element never needs to
     * be created on the fly, such as when the implementer passes in their own element.
     *
     * @property _elDefaultContainer
     * @type HTMLElement
     * @private
     */
    //YAHOO.widget.LogReader._elDefaultContainer = null;

    /**
     * Buffer of log message objects for batch output.
     *
     * @property _buffer
     * @type Object[]
     * @private
     */
    _buffer : null,

    /**
     * Number of log messages output to console.
     *
     * @property _consoleMsgCount
     * @type Number
     * @default 0
     * @private
     */
    _consoleMsgCount : 0,

    /**
     * Date of last output log message.
     *
     * @property _lastTime
     * @type Date
     * @private
     */
    _lastTime : null,

    /**
     * Batched output timeout ID.
     *
     * @property _timeout
     * @type Number
     * @private
     */
    _timeout : null,

    /**
     * Hash of filters and their related checkbox elements.
     *
     * @property _filterCheckboxes
     * @type Object
     * @private
     */
    _filterCheckboxes : null,

    /**
     * Array of filters for log message categories.
     *
     * @property _categoryFilters
     * @type String[]
     * @private
     */
    _categoryFilters : null,

    /**
     * Array of filters for log message sources.
     *
     * @property _sourceFilters
     * @type String[]
     * @private
     */
    _sourceFilters : null,

    /**
     * LogReader container element.
     *
     * @property _elContainer
     * @type HTMLElement
     * @private
     */
    _elContainer : null,

    /**
     * LogReader header element.
     *
     * @property _elHd
     * @type HTMLElement
     * @private
     */
    _elHd : null,

    /**
     * LogReader collapse element.
     *
     * @property _elCollapse
     * @type HTMLElement
     * @private
     */
    _elCollapse : null,

    /**
     * LogReader collapse button element.
     *
     * @property _btnCollapse
     * @type HTMLElement
     * @private
     */
    _btnCollapse : null,

    /**
     * LogReader title header element.
     *
     * @property _title
     * @type HTMLElement
     * @private
     */
    _title : null,

    /**
     * LogReader console element.
     *
     * @property _elConsole
     * @type HTMLElement
     * @private
     */
    _elConsole : null,

    /**
     * LogReader footer element.
     *
     * @property _elFt
     * @type HTMLElement
     * @private
     */
    _elFt : null,

    /**
     * LogReader buttons container element.
     *
     * @property _elBtns
     * @type HTMLElement
     * @private
     */
    _elBtns : null,

    /**
     * Container element for LogReader category filter checkboxes.
     *
     * @property _elCategoryFilters
     * @type HTMLElement
     * @private
     */
    _elCategoryFilters : null,

    /**
     * Container element for LogReader source filter checkboxes.
     *
     * @property _elSourceFilters
     * @type HTMLElement
     * @private
     */
    _elSourceFilters : null,

    /**
     * LogReader pause button element.
     *
     * @property _btnPause
     * @type HTMLElement
     * @private
     */
    _btnPause : null,

    /**
     * Clear button element.
     *
     * @property _btnClear
     * @type HTMLElement
     * @private
     */
    _btnClear : null,

    /////////////////////////////////////////////////////////////////////////////
    //
    // Private methods
    //
    /////////////////////////////////////////////////////////////////////////////

    /**
     * Initializes the instance's message buffer, start time, etc
     *
     * @method _init
     * @param container {String|HTMLElement} (optional) the render target
     * @param config {Object} (optional) instance configuration
     * @protected
     */
    _init : function (container, config) {
        // Internal vars
        this._buffer = []; // output buffer
        this._filterCheckboxes = {}; // pointers to checkboxes
        this._lastTime = Logger.getStartTime(); // timestamp of last log message to console

        // Parse config vars here
        if (config && (config.constructor == Object)) {
            for(var param in config) {
                if (config.hasOwnProperty(param)) {
                    this[param] = config[param];
                }
            }
        }

        this._elContainer = Dom.get(container);

        YAHOO.log("LogReader initialized", null, this.toString());
    },

    /**
     * Initializes the primary container element.
     *
     * @method _initContainerEl
     * @private
     */
    _initContainerEl : function() {

        // Default the container if unset or not a div
        if(!this._elContainer || !/div$/i.test(this._elContainer.tagName)) {
            this._elContainer = d.body.insertBefore(make("div"),d.body.firstChild);
            // Only position absolutely if an in-DOM element is not supplied
            Dom.addClass(this._elContainer,"yui-log-container");
        }

        Dom.addClass(this._elContainer,"yui-log");

        // If implementer has provided container values, trust and set those
        var style = this._elContainer.style,
            styleProps = ['width','right','top','fontSize'],
            prop,i;

        for (i = styleProps.length - 1; i >= 0; --i) {
            prop = styleProps[i];
            if (this[prop]){ 
                style[prop] = this[prop];
            }
        }

        if(this.left) {
            style.left  = this.left;
            style.right = "auto";
        }
        if(this.bottom) {
            style.bottom = this.bottom;
            style.top    = "auto";
        }

        // Opera needs a little prodding to reflow sometimes
        if (YAHOO.env.ua.opera) {
            d.body.style += '';
        }

    },

    /**
     * Initializes the header element.
     *
     * @method _initHeaderEl
     * @private
     */
    _initHeaderEl : function() {
        // Destroy header if present
        if(this._elHd) {
            // Unhook DOM events
            Event.purgeElement(this._elHd, true);

            // Remove DOM elements
            this._elHd.innerHTML = "";
        }
        
        // Create header
        // TODO: refactor this into an innerHTML
        this._elHd = make("div",{
            id: 'yui-log-hd' + this._sName,
            className: "yui-log-hd"
        });

        this._elCollapse = make("div",{ className: 'yui-log-btns' });

        this._btnCollapse = make("input",{
            type: 'button',
            className: 'yui-log-button',
            value: 'Collapse'
        });
        Event.on(this._btnCollapse,'click',this._onClickCollapseBtn,this);


        this._title = make("h4",{ innerHTML : "Logger Console" });

        this._elCollapse.appendChild(this._btnCollapse);
        this._elHd.appendChild(this._elCollapse);
        this._elHd.appendChild(this._title);
        this._elContainer.appendChild(this._elHd);
    },

    /**
     * Initializes the console element.
     *
     * @method _initConsoleEl
     * @private
     */
    _initConsoleEl : function() {
        // Destroy console
        if(this._elConsole) {
            // Unhook DOM events
            Event.purgeElement(this._elConsole, true);

            // Remove DOM elements
            this._elConsole.innerHTML = "";
        }

        // Ceate console
        this._elConsole = make("div", { className: "yui-log-bd" });

        // If implementer has provided console, trust and set those
        if(this.height) {
            this._elConsole.style.height = this.height;
        }

        this._elContainer.appendChild(this._elConsole);
    },

    /**
     * Initializes the footer element.
     *
     * @method _initFooterEl
     * @private
     */
    _initFooterEl : function() {
        // Don't create footer elements if footer is disabled
        if(this.footerEnabled) {
            // Destroy console
            if(this._elFt) {
                // Unhook DOM events
                Event.purgeElement(this._elFt, true);

                // Remove DOM elements
                this._elFt.innerHTML = "";
            }

            // TODO: use innerHTML
            this._elFt = make("div",{ className: "yui-log-ft" });
            this._elBtns = make("div", { className: "yui-log-btns" });
            this._btnPause = make("input", {
                type: "button",
                className: "yui-log-button",
                value: "Pause"
            });

            Event.on(this._btnPause,'click',this._onClickPauseBtn,this);

            this._btnClear = make("input", {
                type: "button",
                className: "yui-log-button",
                value: "Clear"
            });

            Event.on(this._btnClear,'click',this._onClickClearBtn,this);

            this._elCategoryFilters = make("div", { className: "yui-log-categoryfilters" });
            this._elSourceFilters = make("div", { className: "yui-log-sourcefilters" });

            this._elBtns.appendChild(this._btnPause);
            this._elBtns.appendChild(this._btnClear);
            this._elFt.appendChild(this._elBtns);
            this._elFt.appendChild(this._elCategoryFilters);
            this._elFt.appendChild(this._elSourceFilters);
            this._elContainer.appendChild(this._elFt);
        }
    },

    /**
     * Initializes Drag and Drop on the header element.
     *
     * @method _initDragDrop
     * @private
     */
    _initDragDrop : function() {
        // If Drag and Drop utility is available...
        // ...and draggable is true...
        // ...then make the header draggable
        if(u.DD && this.draggable && this._elHd) {
            var ylog_dd = new u.DD(this._elContainer);
            ylog_dd.setHandleElId(this._elHd.id);
            //TODO: use class name
            this._elHd.style.cursor = "move";
        }
    },

    /**
     * Initializes category filters.
     *
     * @method _initCategories
     * @private
     */
    _initCategories : function() {
        // Initialize category filters
        this._categoryFilters = [];
        var aInitialCategories = Logger.categories;

        for(var j=0; j < aInitialCategories.length; j++) {
            var sCategory = aInitialCategories[j];

            // Add category to the internal array of filters
            this._categoryFilters.push(sCategory);

            // Add checkbox element if UI is enabled
            if(this._elCategoryFilters) {
                this._createCategoryCheckbox(sCategory);
            }
        }
    },

    /**
     * Initializes source filters.
     *
     * @method _initSources
     * @private
     */
    _initSources : function() {
        // Initialize source filters
        this._sourceFilters = [];
        var aInitialSources = Logger.sources;

        for(var j=0; j < aInitialSources.length; j++) {
            var sSource = aInitialSources[j];

            // Add source to the internal array of filters
            this._sourceFilters.push(sSource);

            // Add checkbox element if UI is enabled
            if(this._elSourceFilters) {
                this._createSourceCheckbox(sSource);
            }
        }
    },

    /**
     * Creates the UI for a category filter in the LogReader footer element.
     *
     * @method _createCategoryCheckbox
     * @param sCategory {String} Category name.
     * @private
     */
    _createCategoryCheckbox : function(sCategory) {
        if(this._elFt) {
            var filter = make("span",{ className: "yui-log-filtergrp" }),
                check  = make("input", {
                    id: "yui-log-filter-" + sCategory + this._sName,
                    className: "yui-log-filter-" + sCategory,
                    type: "checkbox",
                    category: sCategory
                }),
                label  = make("label", {
                    htmlFor: check.id,
                    className: sCategory,
                    innerHTML: sCategory
                });
            

            // Subscribe to the click event
            Event.on(check,'click',this._onCheckCategory,this);

            this._filterCheckboxes[sCategory] = check;

            // Append el at the end so IE 5.5 can set "type" attribute
            // and THEN set checked property
            filter.appendChild(check);
            filter.appendChild(label);
            this._elCategoryFilters.appendChild(filter);
            check.checked = true;
        }
    },

    /**
     * Creates a checkbox in the LogReader footer element to filter by source.
     *
     * @method _createSourceCheckbox
     * @param sSource {String} Source name.
     * @private
     */
    _createSourceCheckbox : function(sSource) {
        if(this._elFt) {
            var filter = make("span",{ className: "yui-log-filtergrp" }),
                check  = make("input", {
                    id: "yui-log-filter-" + sSource + this._sName,
                    className: "yui-log-filter-" + sSource,
                    type: "checkbox",
                    source: sSource
                }),
                label  = make("label", {
                    htmlFor: check.id,
                    className: sSource,
                    innerHTML: sSource
                });
            

            // Subscribe to the click event
            Event.on(check,'click',this._onCheckSource,this);

            this._filterCheckboxes[sSource] = check;

            // Append el at the end so IE 5.5 can set "type" attribute
            // and THEN set checked property
            filter.appendChild(check);
            filter.appendChild(label);
            this._elSourceFilters.appendChild(filter);
            check.checked = true;
        }
    },

    /**
     * Reprints all log messages in the stack through filters.
     *
     * @method _filterLogs
     * @private
     */
    _filterLogs : function() {
        // Reprint stack with new filters
        if (this._elConsole !== null) {
            this.clearConsole();
            this._printToConsole(Logger.getStack());
        }
    },

    /**
     * Sends buffer of log messages to output and clears buffer.
     *
     * @method _printBuffer
     * @private
     */
    _printBuffer : function() {
        this._timeout = null;

        if(this._elConsole !== null) {
            var thresholdMax = this.thresholdMax;
            thresholdMax = (thresholdMax && !isNaN(thresholdMax)) ? thresholdMax : 500;
            if(this._consoleMsgCount < thresholdMax) {
                var entries = [];
                for (var i=0; i<this._buffer.length; i++) {
                    entries[i] = this._buffer[i];
                }
                this._buffer = [];
                this._printToConsole(entries);
            }
            else {
                this._filterLogs();
            }
            
            if(!this.newestOnTop) {
                this._elConsole.scrollTop = this._elConsole.scrollHeight;
            }
        }
    },

    /**
     * Cycles through an array of log messages, and outputs each one to the console
     * if its category has not been filtered out.
     *
     * @method _printToConsole
     * @param aEntries {Object[]} Array of LogMsg objects to output to console.
     * @private
     */
    _printToConsole : function(aEntries) {
        // Manage the number of messages displayed in the console
        var entriesLen         = aEntries.length,
            df                 = d.createDocumentFragment(),
            msgHTML            = [],
            thresholdMin       = this.thresholdMin,
            sourceFiltersLen   = this._sourceFilters.length,
            categoryFiltersLen = this._categoryFilters.length,
            entriesStartIndex,
            i, j, msg, before;

        if(isNaN(thresholdMin) || (thresholdMin > this.thresholdMax)) {
            thresholdMin = 0;
        }
        entriesStartIndex = (entriesLen > thresholdMin) ? (entriesLen - thresholdMin) : 0;
        
        // Iterate through all log entries 
        for(i=entriesStartIndex; i<entriesLen; i++) {
            // Print only the ones that filter through
            var okToPrint = false,
                okToFilterCats = false,
                entry = aEntries[i],
                source = entry.source,
                category = entry.category;

            for(j=0; j<sourceFiltersLen; j++) {
                if(source == this._sourceFilters[j]) {
                    okToFilterCats = true;
                    break;
                }
            }
            if(okToFilterCats) {
                for(j=0; j<categoryFiltersLen; j++) {
                    if(category == this._categoryFilters[j]) {
                        okToPrint = true;
                        break;
                    }
                }
            }
            if(okToPrint) {
                // Start from 0ms elapsed time
                if (this._consoleMsgCount === 0) {
                    this._lastTime = entry.time.getTime();
                }

                msg = this.formatMsg(entry);
                if (typeof msg === 'string') {
                    msgHTML[msgHTML.length] = msg;
                } else {
                    df.insertBefore(msg, this.newestOnTop ?
                        df.firstChild || null : null);
                }
                this._consoleMsgCount++;
                this._lastTime = entry.time.getTime();
            }
        }

        if (msgHTML.length) {
            msgHTML.splice(0,0,this._elConsole.innerHTML);
            this._elConsole.innerHTML = this.newestOnTop ?
                                            msgHTML.reverse().join('') :
                                            msgHTML.join('');
        } else if (df.firstChild) {
            this._elConsole.insertBefore(df, this.newestOnTop ?
                        this._elConsole.firstChild || null : null);
        }
    },

/////////////////////////////////////////////////////////////////////////////
//
// Private event handlers
//
/////////////////////////////////////////////////////////////////////////////

    /**
     * Handles Logger's categoryCreateEvent.
     *
     * @method _onCategoryCreate
     * @param sType {String} The event.
     * @param aArgs {Object[]} Data passed from event firer.
     * @param oSelf {Object} The LogReader instance.
     * @private
     */
    _onCategoryCreate : function(sType, aArgs, oSelf) {
        var category = aArgs[0];
        
        // Add category to the internal array of filters
        oSelf._categoryFilters.push(category);

        if(oSelf._elFt) {
            oSelf._createCategoryCheckbox(category);
        }
    },

    /**
     * Handles Logger's sourceCreateEvent.
     *
     * @method _onSourceCreate
     * @param sType {String} The event.
     * @param aArgs {Object[]} Data passed from event firer.
     * @param oSelf {Object} The LogReader instance.
     * @private
     */
    _onSourceCreate : function(sType, aArgs, oSelf) {
        var source = aArgs[0];
        
        // Add source to the internal array of filters
        oSelf._sourceFilters.push(source);

        if(oSelf._elFt) {
            oSelf._createSourceCheckbox(source);
        }
    },

    /**
     * Handles check events on the category filter checkboxes.
     *
     * @method _onCheckCategory
     * @param v {HTMLEvent} The click event.
     * @param oSelf {Object} The LogReader instance.
     * @private
     */
    _onCheckCategory : function(v, oSelf) {
        var category = this.category;
        if(!this.checked) {
            oSelf.hideCategory(category);
        }
        else {
            oSelf.showCategory(category);
        }
    },

    /**
     * Handles check events on the category filter checkboxes.
     *
     * @method _onCheckSource
     * @param v {HTMLEvent} The click event.
     * @param oSelf {Object} The LogReader instance.
     * @private
     */
    _onCheckSource : function(v, oSelf) {
        var source = this.source;
        if(!this.checked) {
            oSelf.hideSource(source);
        }
        else {
            oSelf.showSource(source);
        }
    },

    /**
     * Handles click events on the collapse button.
     *
     * @method _onClickCollapseBtn
     * @param v {HTMLEvent} The click event.
     * @param oSelf {Object} The LogReader instance
     * @private
     */
    _onClickCollapseBtn : function(v, oSelf) {
        if(!oSelf.isCollapsed) {
            oSelf.collapse();
        }
        else {
            oSelf.expand();
        }
    },

    /**
     * Handles click events on the pause button.
     *
     * @method _onClickPauseBtn
     * @param v {HTMLEvent} The click event.
     * @param oSelf {Object} The LogReader instance.
     * @private
     */
    _onClickPauseBtn : function(v, oSelf) {
        if(!oSelf.isPaused) {
            oSelf.pause();
        }
        else {
            oSelf.resume();
        }
    },

    /**
     * Handles click events on the clear button.
     *
     * @method _onClickClearBtn
     * @param v {HTMLEvent} The click event.
     * @param oSelf {Object} The LogReader instance.
     * @private
     */
    _onClickClearBtn : function(v, oSelf) {
        oSelf.clearConsole();
    },

    /**
     * Handles Logger's newLogEvent.
     *
     * @method _onNewLog
     * @param sType {String} The event.
     * @param aArgs {Object[]} Data passed from event firer.
     * @param oSelf {Object} The LogReader instance.
     * @private
     */
    _onNewLog : function(sType, aArgs, oSelf) {
        var logEntry = aArgs[0];
        oSelf._buffer.push(logEntry);

        if (oSelf.logReaderEnabled === true && oSelf._timeout === null) {
            oSelf._timeout = setTimeout(function(){oSelf._printBuffer();}, oSelf.outputBuffer);
        }
    },

    /**
     * Handles Logger's resetEvent.
     *
     * @method _onReset
     * @param sType {String} The event.
     * @param aArgs {Object[]} Data passed from event firer.
     * @param oSelf {Object} The LogReader instance.
     * @private
     */
    _onReset : function(sType, aArgs, oSelf) {
        oSelf._filterLogs();
    }
};

YAHOO.widget.LogReader = LogReader;

})();
YAHOO.register("logger", YAHOO.widget.Logger, {version: "2.8.0r4", build: "2446"});
/*
Copyright (c) 2009, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://developer.yahoo.net/yui/license.txt
version: 2.8.0r4
*/
YAHOO.namespace("tool");

//-----------------------------------------------------------------------------
// TestCase object
//-----------------------------------------------------------------------------
(function(){
    
    //used for autogenerating test case names
    var tempId = 0;
    
    /**
     * Test case containing various tests to run.
     * @param template An object containing any number of test methods, other methods,
     *                 an optional name, and anything else the test case needs.
     * @class TestCase
     * @namespace YAHOO.tool
     * @constructor
     */
    YAHOO.tool.TestCase = function (template /*:Object*/) {
        
        /**
         * Special rules for the test case. Possible subobjects
         * are fail, for tests that should fail, and error, for
         * tests that should throw an error.
         */
        this._should /*:Object*/ = {};
        
        //copy over all properties from the template to this object
        for (var prop in template) {
            this[prop] = template[prop];
        }    
        
        //check for a valid name
        if (!YAHOO.lang.isString(this.name)){
            /**
             * Name for the test case.
             */
            this.name /*:String*/ = "testCase" + (tempId++);
        }
    
    };
    
    
    YAHOO.tool.TestCase.prototype = {  
    
        /**
         * Resumes a paused test and runs the given function.
         * @param {Function} segment (Optional) The function to run.
         *      If omitted, the test automatically passes.
         * @return {Void}
         * @method resume
         */
        resume : function (segment /*:Function*/) /*:Void*/ {
            YAHOO.tool.TestRunner.resume(segment);
        },
    
        /**
         * Causes the test case to wait a specified amount of time and then
         * continue executing the given code.
         * @param {Function} segment (Optional) The function to run after the delay.
         *      If omitted, the TestRunner will wait until resume() is called.
         * @param {int} delay (Optional) The number of milliseconds to wait before running
         *      the function. If omitted, defaults to zero.
         * @return {Void}
         * @method wait
         */
        wait : function (segment /*:Function*/, delay /*:int*/) /*:Void*/{
            var args = arguments;
            if (YAHOO.lang.isFunction(args[0])){
                throw new YAHOO.tool.TestCase.Wait(args[0], args[1]);
            } else {
                throw new YAHOO.tool.TestCase.Wait(function(){
                    YAHOO.util.Assert.fail("Timeout: wait() called but resume() never called.");
                }, (YAHOO.lang.isNumber(args[0]) ? args[0] : 10000));
            }            
        },
    
        //-------------------------------------------------------------------------
        // Stub Methods
        //-------------------------------------------------------------------------
    
        /**
         * Function to run before each test is executed.
         * @return {Void}
         * @method setUp
         */
        setUp : function () /*:Void*/ {
        },
        
        /**
         * Function to run after each test is executed.
         * @return {Void}
         * @method tearDown
         */
        tearDown: function () /*:Void*/ {    
        }
    };
    
    /**
     * Represents a stoppage in test execution to wait for an amount of time before
     * continuing.
     * @param {Function} segment A function to run when the wait is over.
     * @param {int} delay The number of milliseconds to wait before running the code.
     * @class Wait
     * @namespace YAHOO.tool.TestCase
     * @constructor
     *
     */
    YAHOO.tool.TestCase.Wait = function (segment /*:Function*/, delay /*:int*/) {
        
        /**
         * The segment of code to run when the wait is over.
         * @type Function
         * @property segment
         */
        this.segment /*:Function*/ = (YAHOO.lang.isFunction(segment) ? segment : null);
    
        /**
         * The delay before running the segment of code.
         * @type int
         * @property delay
         */
        this.delay /*:int*/ = (YAHOO.lang.isNumber(delay) ? delay : 0);
    
    };

})();
YAHOO.namespace("tool");


//-----------------------------------------------------------------------------
// TestSuite object
//-----------------------------------------------------------------------------

/**
 * A test suite that can contain a collection of TestCase and TestSuite objects.
 * @param {String||Object} data The name of the test suite or an object containing
 *      a name property as well as setUp and tearDown methods.
 * @namespace YAHOO.tool
 * @class TestSuite
 * @constructor
 */
YAHOO.tool.TestSuite = function (data /*:String||Object*/) {

    /**
     * The name of the test suite.
     * @type String
     * @property name
     */
    this.name /*:String*/ = "";

    /**
     * Array of test suites and
     * @private
     */
    this.items /*:Array*/ = [];

    //initialize the properties
    if (YAHOO.lang.isString(data)){
        this.name = data;
    } else if (YAHOO.lang.isObject(data)){
        YAHOO.lang.augmentObject(this, data, true);
    }

    //double-check name
    if (this.name === ""){
        this.name = YAHOO.util.Dom.generateId(null, "testSuite");
    }

};

YAHOO.tool.TestSuite.prototype = {
    
    /**
     * Adds a test suite or test case to the test suite.
     * @param {YAHOO.tool.TestSuite||YAHOO.tool.TestCase} testObject The test suite or test case to add.
     * @return {Void}
     * @method add
     */
    add : function (testObject /*:YAHOO.tool.TestSuite*/) /*:Void*/ {
        if (testObject instanceof YAHOO.tool.TestSuite || testObject instanceof YAHOO.tool.TestCase) {
            this.items.push(testObject);
        }
    },
    
    //-------------------------------------------------------------------------
    // Stub Methods
    //-------------------------------------------------------------------------

    /**
     * Function to run before each test is executed.
     * @return {Void}
     * @method setUp
     */
    setUp : function () /*:Void*/ {
    },
    
    /**
     * Function to run after each test is executed.
     * @return {Void}
     * @method tearDown
     */
    tearDown: function () /*:Void*/ {
    }
    
};
YAHOO.namespace("tool");

/**
 * The YUI test tool
 * @module yuitest
 * @namespace YAHOO.tool
 * @requires yahoo,dom,event,logger
 * @optional event-simulte
 */


//-----------------------------------------------------------------------------
// TestRunner object
//-----------------------------------------------------------------------------


YAHOO.tool.TestRunner = (function(){

    /**
     * A node in the test tree structure. May represent a TestSuite, TestCase, or
     * test function.
     * @param {Variant} testObject A TestSuite, TestCase, or the name of a test function.
     * @class TestNode
     * @constructor
     * @private
     */
    function TestNode(testObject /*:Variant*/){
    
        /**
         * The TestSuite, TestCase, or test function represented by this node.
         * @type Variant
         * @property testObject
         */
        this.testObject = testObject;
        
        /**
         * Pointer to this node's first child.
         * @type TestNode
         * @property firstChild
         */        
        this.firstChild /*:TestNode*/ = null;
        
        /**
         * Pointer to this node's last child.
         * @type TestNode
         * @property lastChild
         */        
        this.lastChild = null;
        
        /**
         * Pointer to this node's parent.
         * @type TestNode
         * @property parent
         */        
        this.parent = null; 
   
        /**
         * Pointer to this node's next sibling.
         * @type TestNode
         * @property next
         */        
        this.next = null;
        
        /**
         * Test results for this test object.
         * @type object
         * @property results
         */                
        this.results /*:Object*/ = {
            passed : 0,
            failed : 0,
            total : 0,
            ignored : 0
        };
        
        //initialize results
        if (testObject instanceof YAHOO.tool.TestSuite){
            this.results.type = "testsuite";
            this.results.name = testObject.name;
        } else if (testObject instanceof YAHOO.tool.TestCase){
            this.results.type = "testcase";
            this.results.name = testObject.name;
        }
       
    }
    
    TestNode.prototype = {
    
        /**
         * Appends a new test object (TestSuite, TestCase, or test function name) as a child
         * of this node.
         * @param {Variant} testObject A TestSuite, TestCase, or the name of a test function.
         * @return {Void}
         */
        appendChild : function (testObject /*:Variant*/) /*:Void*/{
            var node = new TestNode(testObject);
            if (this.firstChild === null){
                this.firstChild = this.lastChild = node;
            } else {
                this.lastChild.next = node;
                this.lastChild = node;
            }
            node.parent = this;
            return node;
        }       
    };

    /**
     * Runs test suites and test cases, providing events to allowing for the
     * interpretation of test results.
     * @namespace YAHOO.tool
     * @class TestRunner
     * @static
     */
    function TestRunner(){
    
        //inherit from EventProvider
        TestRunner.superclass.constructor.apply(this,arguments);
        
        /**
         * Suite on which to attach all TestSuites and TestCases to be run.
         * @type YAHOO.tool.TestSuite
         * @property masterSuite
         * @private
         * @static
         */
        this.masterSuite /*:YAHOO.tool.TestSuite*/ = new YAHOO.tool.TestSuite("YUI Test Results");        

        /**
         * Pointer to the current node in the test tree.
         * @type TestNode
         * @private
         * @property _cur
         * @static
         */
        this._cur = null;
        
        /**
         * Pointer to the root node in the test tree.
         * @type TestNode
         * @private
         * @property _root
         * @static
         */
        this._root = null;
        
        //create events
        var events /*:Array*/ = [
            this.TEST_CASE_BEGIN_EVENT,
            this.TEST_CASE_COMPLETE_EVENT,
            this.TEST_SUITE_BEGIN_EVENT,
            this.TEST_SUITE_COMPLETE_EVENT,
            this.TEST_PASS_EVENT,
            this.TEST_FAIL_EVENT,
            this.TEST_IGNORE_EVENT,
            this.COMPLETE_EVENT,
            this.BEGIN_EVENT
        ];
        for (var i=0; i < events.length; i++){
            this.createEvent(events[i], { scope: this });
        }       
   
    }
    
    YAHOO.lang.extend(TestRunner, YAHOO.util.EventProvider, {
    
        //-------------------------------------------------------------------------
        // Constants
        //-------------------------------------------------------------------------
         
        /**
         * Fires when a test case is opened but before the first 
         * test is executed.
         * @event testcasebegin
         */         
        TEST_CASE_BEGIN_EVENT /*:String*/ : "testcasebegin",
        
        /**
         * Fires when all tests in a test case have been executed.
         * @event testcasecomplete
         */        
        TEST_CASE_COMPLETE_EVENT /*:String*/ : "testcasecomplete",
        
        /**
         * Fires when a test suite is opened but before the first 
         * test is executed.
         * @event testsuitebegin
         */        
        TEST_SUITE_BEGIN_EVENT /*:String*/ : "testsuitebegin",
        
        /**
         * Fires when all test cases in a test suite have been
         * completed.
         * @event testsuitecomplete
         */        
        TEST_SUITE_COMPLETE_EVENT /*:String*/ : "testsuitecomplete",
        
        /**
         * Fires when a test has passed.
         * @event pass
         */        
        TEST_PASS_EVENT /*:String*/ : "pass",
        
        /**
         * Fires when a test has failed.
         * @event fail
         */        
        TEST_FAIL_EVENT /*:String*/ : "fail",
        
        /**
         * Fires when a test has been ignored.
         * @event ignore
         */        
        TEST_IGNORE_EVENT /*:String*/ : "ignore",
        
        /**
         * Fires when all test suites and test cases have been completed.
         * @event complete
         */        
        COMPLETE_EVENT /*:String*/ : "complete",
        
        /**
         * Fires when the run() method is called.
         * @event begin
         */        
        BEGIN_EVENT /*:String*/ : "begin",    
        
        //-------------------------------------------------------------------------
        // Test Tree-Related Methods
        //-------------------------------------------------------------------------

        /**
         * Adds a test case to the test tree as a child of the specified node.
         * @param {TestNode} parentNode The node to add the test case to as a child.
         * @param {YAHOO.tool.TestCase} testCase The test case to add.
         * @return {Void}
         * @static
         * @private
         * @method _addTestCaseToTestTree
         */
       _addTestCaseToTestTree : function (parentNode /*:TestNode*/, testCase /*:YAHOO.tool.TestCase*/) /*:Void*/{
            
            //add the test suite
            var node = parentNode.appendChild(testCase);
            
            //iterate over the items in the test case
            for (var prop in testCase){
                if (prop.indexOf("test") === 0 && YAHOO.lang.isFunction(testCase[prop])){
                    node.appendChild(prop);
                }
            }
         
        },
        
        /**
         * Adds a test suite to the test tree as a child of the specified node.
         * @param {TestNode} parentNode The node to add the test suite to as a child.
         * @param {YAHOO.tool.TestSuite} testSuite The test suite to add.
         * @return {Void}
         * @static
         * @private
         * @method _addTestSuiteToTestTree
         */
        _addTestSuiteToTestTree : function (parentNode /*:TestNode*/, testSuite /*:YAHOO.tool.TestSuite*/) /*:Void*/ {
            
            //add the test suite
            var node = parentNode.appendChild(testSuite);
            
            //iterate over the items in the master suite
            for (var i=0; i < testSuite.items.length; i++){
                if (testSuite.items[i] instanceof YAHOO.tool.TestSuite) {
                    this._addTestSuiteToTestTree(node, testSuite.items[i]);
                } else if (testSuite.items[i] instanceof YAHOO.tool.TestCase) {
                    this._addTestCaseToTestTree(node, testSuite.items[i]);
                }                   
            }            
        },
        
        /**
         * Builds the test tree based on items in the master suite. The tree is a hierarchical
         * representation of the test suites, test cases, and test functions. The resulting tree
         * is stored in _root and the pointer _cur is set to the root initially.
         * @return {Void}
         * @static
         * @private
         * @method _buildTestTree
         */
        _buildTestTree : function () /*:Void*/ {
        
            this._root = new TestNode(this.masterSuite);
            this._cur = this._root;
            
            //iterate over the items in the master suite
            for (var i=0; i < this.masterSuite.items.length; i++){
                if (this.masterSuite.items[i] instanceof YAHOO.tool.TestSuite) {
                    this._addTestSuiteToTestTree(this._root, this.masterSuite.items[i]);
                } else if (this.masterSuite.items[i] instanceof YAHOO.tool.TestCase) {
                    this._addTestCaseToTestTree(this._root, this.masterSuite.items[i]);
                }                   
            }            
        
        }, 
    
        //-------------------------------------------------------------------------
        // Private Methods
        //-------------------------------------------------------------------------
        
        /**
         * Handles the completion of a test object's tests. Tallies test results 
         * from one level up to the next.
         * @param {TestNode} node The TestNode representing the test object.
         * @return {Void}
         * @method _handleTestObjectComplete
         * @private
         * @static
         */
        _handleTestObjectComplete : function (node /*:TestNode*/) /*:Void*/ {
            if (YAHOO.lang.isObject(node.testObject)){
                node.parent.results.passed += node.results.passed;
                node.parent.results.failed += node.results.failed;
                node.parent.results.total += node.results.total;                
                node.parent.results.ignored += node.results.ignored;                
                node.parent.results[node.testObject.name] = node.results;
            
                if (node.testObject instanceof YAHOO.tool.TestSuite){
                    node.testObject.tearDown();
                    this.fireEvent(this.TEST_SUITE_COMPLETE_EVENT, { testSuite: node.testObject, results: node.results});
                } else if (node.testObject instanceof YAHOO.tool.TestCase){
                    this.fireEvent(this.TEST_CASE_COMPLETE_EVENT, { testCase: node.testObject, results: node.results});
                }      
            } 
        },                
        
        //-------------------------------------------------------------------------
        // Navigation Methods
        //-------------------------------------------------------------------------
        
        /**
         * Retrieves the next node in the test tree.
         * @return {TestNode} The next node in the test tree or null if the end is reached.
         * @private
         * @static
         * @method _next
         */
        _next : function () /*:TestNode*/ {
        
            if (this._cur.firstChild) {
                this._cur = this._cur.firstChild;
            } else if (this._cur.next) {
                this._cur = this._cur.next;            
            } else {
                while (this._cur && !this._cur.next && this._cur !== this._root){
                    this._handleTestObjectComplete(this._cur);
                    this._cur = this._cur.parent;
                }
                
                if (this._cur == this._root){
                    this._cur.results.type = "report";
                    this._cur.results.timestamp = (new Date()).toLocaleString();
                    this._cur.results.duration = (new Date()) - this._cur.results.duration;
                    this.fireEvent(this.COMPLETE_EVENT, { results: this._cur.results});
                    this._cur = null;
                } else {
                    this._handleTestObjectComplete(this._cur);               
                    this._cur = this._cur.next;                
                }
            }
        
            return this._cur;
        },
        
        /**
         * Runs a test case or test suite, returning the results.
         * @param {YAHOO.tool.TestCase|YAHOO.tool.TestSuite} testObject The test case or test suite to run.
         * @return {Object} Results of the execution with properties passed, failed, and total.
         * @private
         * @method _run
         * @static
         */
        _run : function () /*:Void*/ {
        
            //flag to indicate if the TestRunner should wait before continuing
            var shouldWait /*:Boolean*/ = false;
            
            //get the next test node
            var node = this._next();
            
            if (node !== null) {
                var testObject = node.testObject;
                
                //figure out what to do
                if (YAHOO.lang.isObject(testObject)){
                    if (testObject instanceof YAHOO.tool.TestSuite){
                        this.fireEvent(this.TEST_SUITE_BEGIN_EVENT, { testSuite: testObject });
                        testObject.setUp();
                    } else if (testObject instanceof YAHOO.tool.TestCase){
                        this.fireEvent(this.TEST_CASE_BEGIN_EVENT, { testCase: testObject });
                    }
                    
                    //some environments don't support setTimeout
                    if (typeof setTimeout != "undefined"){                    
                        setTimeout(function(){
                            YAHOO.tool.TestRunner._run();
                        }, 0);
                    } else {
                        this._run();
                    }
                } else {
                    this._runTest(node);
                }

            }
        },
        
        _resumeTest : function (segment /*:Function*/) /*:Void*/ {
        
            //get relevant information
            var node /*:TestNode*/ = this._cur;
            var testName /*:String*/ = node.testObject;
            var testCase /*:YAHOO.tool.TestCase*/ = node.parent.testObject;
            
            //cancel other waits if available
            if (testCase.__yui_wait){
                clearTimeout(testCase.__yui_wait);
                delete testCase.__yui_wait;
            }            
            
            //get the "should" test cases
            var shouldFail /*:Object*/ = (testCase._should.fail || {})[testName];
            var shouldError /*:Object*/ = (testCase._should.error || {})[testName];
            
            //variable to hold whether or not the test failed
            var failed /*:Boolean*/ = false;
            var error /*:Error*/ = null;
                
            //try the test
            try {
            
                //run the test
                segment.apply(testCase);
                
                //if it should fail, and it got here, then it's a fail because it didn't
                if (shouldFail){
                    error = new YAHOO.util.ShouldFail();
                    failed = true;
                } else if (shouldError){
                    error = new YAHOO.util.ShouldError();
                    failed = true;
                }
                           
            } catch (thrown /*:Error*/){
                if (thrown instanceof YAHOO.util.AssertionError) {
                    if (!shouldFail){
                        error = thrown;
                        failed = true;
                    }
                } else if (thrown instanceof YAHOO.tool.TestCase.Wait){
                
                    if (YAHOO.lang.isFunction(thrown.segment)){
                        if (YAHOO.lang.isNumber(thrown.delay)){
                        
                            //some environments don't support setTimeout
                            if (typeof setTimeout != "undefined"){
                                testCase.__yui_wait = setTimeout(function(){
                                    YAHOO.tool.TestRunner._resumeTest(thrown.segment);
                                }, thrown.delay);                             
                            } else {
                                throw new Error("Asynchronous tests not supported in this environment.");
                            }
                        }
                    }
                    
                    return;
                
                } else {
                    //first check to see if it should error
                    if (!shouldError) {                        
                        error = new YAHOO.util.UnexpectedError(thrown);
                        failed = true;
                    } else {
                        //check to see what type of data we have
                        if (YAHOO.lang.isString(shouldError)){
                            
                            //if it's a string, check the error message
                            if (thrown.message != shouldError){
                                error = new YAHOO.util.UnexpectedError(thrown);
                                failed = true;                                    
                            }
                        } else if (YAHOO.lang.isFunction(shouldError)){
                        
                            //if it's a function, see if the error is an instance of it
                            if (!(thrown instanceof shouldError)){
                                error = new YAHOO.util.UnexpectedError(thrown);
                                failed = true;
                            }
                        
                        } else if (YAHOO.lang.isObject(shouldError)){
                        
                            //if it's an object, check the instance and message
                            if (!(thrown instanceof shouldError.constructor) || 
                                    thrown.message != shouldError.message){
                                error = new YAHOO.util.UnexpectedError(thrown);
                                failed = true;                                    
                            }
                        
                        }
                    
                    }
                }
                
            }
            
            //fireEvent appropriate event
            if (failed) {
                this.fireEvent(this.TEST_FAIL_EVENT, { testCase: testCase, testName: testName, error: error });
            } else {
                this.fireEvent(this.TEST_PASS_EVENT, { testCase: testCase, testName: testName });
            }
            
            //run the tear down
            testCase.tearDown();
            
            //update results
            node.parent.results[testName] = { 
                result: failed ? "fail" : "pass",
                message: error ? error.getMessage() : "Test passed",
                type: "test",
                name: testName
            };
            
            if (failed){
                node.parent.results.failed++;
            } else {
                node.parent.results.passed++;
            }
            node.parent.results.total++;

            //set timeout not supported in all environments
            if (typeof setTimeout != "undefined"){
                setTimeout(function(){
                    YAHOO.tool.TestRunner._run();
                }, 0);
            } else {
                this._run();
            }
        
        },
                
        /**
         * Runs a single test based on the data provided in the node.
         * @param {TestNode} node The TestNode representing the test to run.
         * @return {Void}
         * @static
         * @private
         * @name _runTest
         */
        _runTest : function (node /*:TestNode*/) /*:Void*/ {
        
            //get relevant information
            var testName /*:String*/ = node.testObject;
            var testCase /*:YAHOO.tool.TestCase*/ = node.parent.testObject;
            var test /*:Function*/ = testCase[testName];
            
            //get the "should" test cases
            var shouldIgnore /*:Object*/ = (testCase._should.ignore || {})[testName];
            
            //figure out if the test should be ignored or not
            if (shouldIgnore){
            
                //update results
                node.parent.results[testName] = { 
                    result: "ignore",
                    message: "Test ignored",
                    type: "test",
                    name: testName
                };
                
                node.parent.results.ignored++;
                node.parent.results.total++;
            
                this.fireEvent(this.TEST_IGNORE_EVENT, { testCase: testCase, testName: testName });
                
                //some environments don't support setTimeout
                if (typeof setTimeout != "undefined"){                    
                    setTimeout(function(){
                        YAHOO.tool.TestRunner._run();
                    }, 0);              
                } else {
                    this._run();
                }

            } else {
            
                //run the setup
                testCase.setUp();
                
                //now call the body of the test
                this._resumeTest(test);                
            }

        },        
        
        //-------------------------------------------------------------------------
        // Protected Methods
        //-------------------------------------------------------------------------   
    
        /**
         * Fires events for the TestRunner. This overrides the default fireEvent()
         * method from EventProvider to add the type property to the data that is
         * passed through on each event call.
         * @param {String} type The type of event to fire.
         * @param {Object} data (Optional) Data for the event.
         * @method fireEvent
         * @static
         * @protected
         */
        fireEvent : function (type /*:String*/, data /*:Object*/) /*:Void*/ {
            data = data || {};
            data.type = type;
            TestRunner.superclass.fireEvent.call(this, type, data);
        },
        
        //-------------------------------------------------------------------------
        // Public Methods
        //-------------------------------------------------------------------------   
    
        /**
         * Adds a test suite or test case to the list of test objects to run.
         * @param testObject Either a TestCase or a TestSuite that should be run.
         * @return {Void}
         * @method add
         * @static
         */
        add : function (testObject /*:Object*/) /*:Void*/ {
            this.masterSuite.add(testObject);
        },
        
        /**
         * Removes all test objects from the runner.
         * @return {Void}
         * @method clear
         * @static
         */
        clear : function () /*:Void*/ {
            this.masterSuite.items = [];
        },
        
        /**
         * Resumes the TestRunner after wait() was called.
         * @param {Function} segment The function to run as the rest
         *      of the haulted test.
         * @return {Void}
         * @method resume
         * @static
         */
        resume : function (segment /*:Function*/) /*:Void*/ {
            this._resumeTest(segment || function(){});
        },
    
        /**
         * Runs the test suite.
         * @return {Void}
         * @method run
         * @static
         */
        run : function (testObject /*:Object*/) /*:Void*/ {
            
            //pointer to runner to avoid scope issues 
            var runner = YAHOO.tool.TestRunner;

            //build the test tree
            runner._buildTestTree();
            
            //set when the test started
            runner._root.results.duration = (new Date()).getTime();
            
            //fire the begin event
            runner.fireEvent(runner.BEGIN_EVENT);
       
            //begin the testing
            runner._run();
        }    
    });
    
    return new TestRunner();
    
})();
YAHOO.namespace("util");

//-----------------------------------------------------------------------------
// Assert object
//-----------------------------------------------------------------------------

/**
 * The Assert object provides functions to test JavaScript values against
 * known and expected results. Whenever a comparison (assertion) fails,
 * an error is thrown.
 *
 * @namespace YAHOO.util
 * @class Assert
 * @static
 */
YAHOO.util.Assert = {

    //-------------------------------------------------------------------------
    // Helper Methods
    //-------------------------------------------------------------------------
    
    /**
     * Formats a message so that it can contain the original assertion message
     * in addition to the custom message.
     * @param {String} customMessage The message passed in by the developer.
     * @param {String} defaultMessage The message created by the error by default.
     * @return {String} The final error message, containing either or both.
     * @protected
     * @static
     * @method _formatMessage
     */
    _formatMessage : function (customMessage /*:String*/, defaultMessage /*:String*/) /*:String*/ {
        var message = customMessage;
        if (YAHOO.lang.isString(customMessage) && customMessage.length > 0){
            return YAHOO.lang.substitute(customMessage, { message: defaultMessage });
        } else {
            return defaultMessage;
        }        
    },
    
    //-------------------------------------------------------------------------
    // Generic Assertion Methods
    //-------------------------------------------------------------------------
    
    /** 
     * Forces an assertion error to occur.
     * @param {String} message (Optional) The message to display with the failure.
     * @method fail
     * @static
     */
    fail : function (message /*:String*/) /*:Void*/ {
        throw new YAHOO.util.AssertionError(this._formatMessage(message, "Test force-failed."));
    },       
    
    //-------------------------------------------------------------------------
    // Equality Assertion Methods
    //-------------------------------------------------------------------------    
    
    /**
     * Asserts that a value is equal to another. This uses the double equals sign
     * so type cohersion may occur.
     * @param {Object} expected The expected value.
     * @param {Object} actual The actual value to test.
     * @param {String} message (Optional) The message to display if the assertion fails.
     * @method areEqual
     * @static
     */
    areEqual : function (expected /*:Object*/, actual /*:Object*/, message /*:String*/) /*:Void*/ {
        if (expected != actual) {
            throw new YAHOO.util.ComparisonFailure(this._formatMessage(message, "Values should be equal."), expected, actual);
        }
    },
    
    /**
     * Asserts that a value is not equal to another. This uses the double equals sign
     * so type cohersion may occur.
     * @param {Object} unexpected The unexpected value.
     * @param {Object} actual The actual value to test.
     * @param {String} message (Optional) The message to display if the assertion fails.
     * @method areNotEqual
     * @static
     */
    areNotEqual : function (unexpected /*:Object*/, actual /*:Object*/, 
                         message /*:String*/) /*:Void*/ {
        if (unexpected == actual) {
            throw new YAHOO.util.UnexpectedValue(this._formatMessage(message, "Values should not be equal."), unexpected);
        }
    },
    
    /**
     * Asserts that a value is not the same as another. This uses the triple equals sign
     * so no type cohersion may occur.
     * @param {Object} unexpected The unexpected value.
     * @param {Object} actual The actual value to test.
     * @param {String} message (Optional) The message to display if the assertion fails.
     * @method areNotSame
     * @static
     */
    areNotSame : function (unexpected /*:Object*/, actual /*:Object*/, message /*:String*/) /*:Void*/ {
        if (unexpected === actual) {
            throw new YAHOO.util.UnexpectedValue(this._formatMessage(message, "Values should not be the same."), unexpected);
        }
    },

    /**
     * Asserts that a value is the same as another. This uses the triple equals sign
     * so no type cohersion may occur.
     * @param {Object} expected The expected value.
     * @param {Object} actual The actual value to test.
     * @param {String} message (Optional) The message to display if the assertion fails.
     * @method areSame
     * @static
     */
    areSame : function (expected /*:Object*/, actual /*:Object*/, message /*:String*/) /*:Void*/ {
        if (expected !== actual) {
            throw new YAHOO.util.ComparisonFailure(this._formatMessage(message, "Values should be the same."), expected, actual);
        }
    },    
    
    //-------------------------------------------------------------------------
    // Boolean Assertion Methods
    //-------------------------------------------------------------------------    
    
    /**
     * Asserts that a value is false. This uses the triple equals sign
     * so no type cohersion may occur.
     * @param {Object} actual The actual value to test.
     * @param {String} message (Optional) The message to display if the assertion fails.
     * @method isFalse
     * @static
     */
    isFalse : function (actual /*:Boolean*/, message /*:String*/) {
        if (false !== actual) {
            throw new YAHOO.util.ComparisonFailure(this._formatMessage(message, "Value should be false."), false, actual);
        }
    },
    
    /**
     * Asserts that a value is true. This uses the triple equals sign
     * so no type cohersion may occur.
     * @param {Object} actual The actual value to test.
     * @param {String} message (Optional) The message to display if the assertion fails.
     * @method isTrue
     * @static
     */
    isTrue : function (actual /*:Boolean*/, message /*:String*/) /*:Void*/ {
        if (true !== actual) {
            throw new YAHOO.util.ComparisonFailure(this._formatMessage(message, "Value should be true."), true, actual);
        }

    },
    
    //-------------------------------------------------------------------------
    // Special Value Assertion Methods
    //-------------------------------------------------------------------------    
    
    /**
     * Asserts that a value is not a number.
     * @param {Object} actual The value to test.
     * @param {String} message (Optional) The message to display if the assertion fails.
     * @method isNaN
     * @static
     */
    isNaN : function (actual /*:Object*/, message /*:String*/) /*:Void*/{
        if (!isNaN(actual)){
            throw new YAHOO.util.ComparisonFailure(this._formatMessage(message, "Value should be NaN."), NaN, actual);
        }    
    },
    
    /**
     * Asserts that a value is not the special NaN value.
     * @param {Object} actual The value to test.
     * @param {String} message (Optional) The message to display if the assertion fails.
     * @method isNotNaN
     * @static
     */
    isNotNaN : function (actual /*:Object*/, message /*:String*/) /*:Void*/{
        if (isNaN(actual)){
            throw new YAHOO.util.UnexpectedValue(this._formatMessage(message, "Values should not be NaN."), NaN);
        }    
    },
    
    /**
     * Asserts that a value is not null. This uses the triple equals sign
     * so no type cohersion may occur.
     * @param {Object} actual The actual value to test.
     * @param {String} message (Optional) The message to display if the assertion fails.
     * @method isNotNull
     * @static
     */
    isNotNull : function (actual /*:Object*/, message /*:String*/) /*:Void*/ {
        if (YAHOO.lang.isNull(actual)) {
            throw new YAHOO.util.UnexpectedValue(this._formatMessage(message, "Values should not be null."), null);
        }
    },

    /**
     * Asserts that a value is not undefined. This uses the triple equals sign
     * so no type cohersion may occur.
     * @param {Object} actual The actual value to test.
     * @param {String} message (Optional) The message to display if the assertion fails.
     * @method isNotUndefined
     * @static
     */
    isNotUndefined : function (actual /*:Object*/, message /*:String*/) /*:Void*/ {
        if (YAHOO.lang.isUndefined(actual)) {
            throw new YAHOO.util.UnexpectedValue(this._formatMessage(message, "Value should not be undefined."), undefined);
        }
    },

    /**
     * Asserts that a value is null. This uses the triple equals sign
     * so no type cohersion may occur.
     * @param {Object} actual The actual value to test.
     * @param {String} message (Optional) The message to display if the assertion fails.
     * @method isNull
     * @static
     */
    isNull : function (actual /*:Object*/, message /*:String*/) /*:Void*/ {
        if (!YAHOO.lang.isNull(actual)) {
            throw new YAHOO.util.ComparisonFailure(this._formatMessage(message, "Value should be null."), null, actual);
        }
    },
        
    /**
     * Asserts that a value is undefined. This uses the triple equals sign
     * so no type cohersion may occur.
     * @param {Object} actual The actual value to test.
     * @param {String} message (Optional) The message to display if the assertion fails.
     * @method isUndefined
     * @static
     */
    isUndefined : function (actual /*:Object*/, message /*:String*/) /*:Void*/ {
        if (!YAHOO.lang.isUndefined(actual)) {
            throw new YAHOO.util.ComparisonFailure(this._formatMessage(message, "Value should be undefined."), undefined, actual);
        }
    },    
    
    //--------------------------------------------------------------------------
    // Instance Assertion Methods
    //--------------------------------------------------------------------------    
   
    /**
     * Asserts that a value is an array.
     * @param {Object} actual The value to test.
     * @param {String} message (Optional) The message to display if the assertion fails.
     * @method isArray
     * @static
     */
    isArray : function (actual /*:Object*/, message /*:String*/) /*:Void*/ {
        if (!YAHOO.lang.isArray(actual)){
            throw new YAHOO.util.UnexpectedValue(this._formatMessage(message, "Value should be an array."), actual);
        }    
    },
   
    /**
     * Asserts that a value is a Boolean.
     * @param {Object} actual The value to test.
     * @param {String} message (Optional) The message to display if the assertion fails.
     * @method isBoolean
     * @static
     */
    isBoolean : function (actual /*:Object*/, message /*:String*/) /*:Void*/ {
        if (!YAHOO.lang.isBoolean(actual)){
            throw new YAHOO.util.UnexpectedValue(this._formatMessage(message, "Value should be a Boolean."), actual);
        }    
    },
   
    /**
     * Asserts that a value is a function.
     * @param {Object} actual The value to test.
     * @param {String} message (Optional) The message to display if the assertion fails.
     * @method isFunction
     * @static
     */
    isFunction : function (actual /*:Object*/, message /*:String*/) /*:Void*/ {
        if (!YAHOO.lang.isFunction(actual)){
            throw new YAHOO.util.UnexpectedValue(this._formatMessage(message, "Value should be a function."), actual);
        }    
    },
   
    /**
     * Asserts that a value is an instance of a particular object. This may return
     * incorrect results when comparing objects from one frame to constructors in
     * another frame. For best results, don't use in a cross-frame manner.
     * @param {Function} expected The function that the object should be an instance of.
     * @param {Object} actual The object to test.
     * @param {String} message (Optional) The message to display if the assertion fails.
     * @method isInstanceOf
     * @static
     */
    isInstanceOf : function (expected /*:Function*/, actual /*:Object*/, message /*:String*/) /*:Void*/ {
        if (!(actual instanceof expected)){
            throw new YAHOO.util.ComparisonFailure(this._formatMessage(message, "Value isn't an instance of expected type."), expected, actual);
        }
    },
    
    /**
     * Asserts that a value is a number.
     * @param {Object} actual The value to test.
     * @param {String} message (Optional) The message to display if the assertion fails.
     * @method isNumber
     * @static
     */
    isNumber : function (actual /*:Object*/, message /*:String*/) /*:Void*/ {
        if (!YAHOO.lang.isNumber(actual)){
            throw new YAHOO.util.UnexpectedValue(this._formatMessage(message, "Value should be a number."), actual);
        }    
    },    
    
    /**
     * Asserts that a value is an object.
     * @param {Object} actual The value to test.
     * @param {String} message (Optional) The message to display if the assertion fails.
     * @method isObject
     * @static
     */
    isObject : function (actual /*:Object*/, message /*:String*/) /*:Void*/ {
        if (!YAHOO.lang.isObject(actual)){
            throw new YAHOO.util.UnexpectedValue(this._formatMessage(message, "Value should be an object."), actual);
        }
    },
    
    /**
     * Asserts that a value is a string.
     * @param {Object} actual The value to test.
     * @param {String} message (Optional) The message to display if the assertion fails.
     * @method isString
     * @static
     */
    isString : function (actual /*:Object*/, message /*:String*/) /*:Void*/ {
        if (!YAHOO.lang.isString(actual)){
            throw new YAHOO.util.UnexpectedValue(this._formatMessage(message, "Value should be a string."), actual);
        }
    },
    
    /**
     * Asserts that a value is of a particular type. 
     * @param {String} expectedType The expected type of the variable.
     * @param {Object} actualValue The actual value to test.
     * @param {String} message (Optional) The message to display if the assertion fails.
     * @method isTypeOf
     * @static
     */
    isTypeOf : function (expected /*:String*/, actual /*:Object*/, message /*:String*/) /*:Void*/{
        if (typeof actual != expected){
            throw new YAHOO.util.ComparisonFailure(this._formatMessage(message, "Value should be of type " + expected + "."), expected, typeof actual);
        }
    }
};

//-----------------------------------------------------------------------------
// Assertion errors
//-----------------------------------------------------------------------------

/**
 * AssertionError is thrown whenever an assertion fails. It provides methods
 * to more easily get at error information and also provides a base class
 * from which more specific assertion errors can be derived.
 *
 * @param {String} message The message to display when the error occurs.
 * @namespace YAHOO.util
 * @class AssertionError
 * @extends Error
 * @constructor
 */ 
YAHOO.util.AssertionError = function (message /*:String*/){

    //call superclass
    //arguments.callee.superclass.constructor.call(this, message);
    
    /*
     * Error message. Must be duplicated to ensure browser receives it.
     * @type String
     * @property message
     */
    this.message /*:String*/ = message;
    
    /**
     * The name of the error that occurred.
     * @type String
     * @property name
     */
    this.name /*:String*/ = "AssertionError";
};

//inherit methods
YAHOO.lang.extend(YAHOO.util.AssertionError, Object, {

    /**
     * Returns a fully formatted error for an assertion failure. This should
     * be overridden by all subclasses to provide specific information.
     * @method getMessage
     * @return {String} A string describing the error.
     */
    getMessage : function () /*:String*/ {
        return this.message;
    },
    
    /**
     * Returns a string representation of the error.
     * @method toString
     * @return {String} A string representation of the error.
     */
    toString : function () /*:String*/ {
        return this.name + ": " + this.getMessage();
    }
    
});

/**
 * ComparisonFailure is subclass of AssertionError that is thrown whenever
 * a comparison between two values fails. It provides mechanisms to retrieve
 * both the expected and actual value.
 *
 * @param {String} message The message to display when the error occurs.
 * @param {Object} expected The expected value.
 * @param {Object} actual The actual value that caused the assertion to fail.
 * @namespace YAHOO.util
 * @extends YAHOO.util.AssertionError
 * @class ComparisonFailure
 * @constructor
 */ 
YAHOO.util.ComparisonFailure = function (message /*:String*/, expected /*:Object*/, actual /*:Object*/){

    //call superclass
    YAHOO.util.AssertionError.call(this, message);
    
    /**
     * The expected value.
     * @type Object
     * @property expected
     */
    this.expected /*:Object*/ = expected;
    
    /**
     * The actual value.
     * @type Object
     * @property actual
     */
    this.actual /*:Object*/ = actual;
    
    /**
     * The name of the error that occurred.
     * @type String
     * @property name
     */
    this.name /*:String*/ = "ComparisonFailure";
    
};

//inherit methods
YAHOO.lang.extend(YAHOO.util.ComparisonFailure, YAHOO.util.AssertionError, {

    /**
     * Returns a fully formatted error for an assertion failure. This message
     * provides information about the expected and actual values.
     * @method toString
     * @return {String} A string describing the error.
     */
    getMessage : function () /*:String*/ {
        return this.message + "\nExpected: " + this.expected + " (" + (typeof this.expected) + ")"  +
            "\nActual:" + this.actual + " (" + (typeof this.actual) + ")";
    }

});

/**
 * UnexpectedValue is subclass of AssertionError that is thrown whenever
 * a value was unexpected in its scope. This typically means that a test
 * was performed to determine that a value was *not* equal to a certain
 * value.
 *
 * @param {String} message The message to display when the error occurs.
 * @param {Object} unexpected The unexpected value.
 * @namespace YAHOO.util
 * @extends YAHOO.util.AssertionError
 * @class UnexpectedValue
 * @constructor
 */ 
YAHOO.util.UnexpectedValue = function (message /*:String*/, unexpected /*:Object*/){

    //call superclass
    YAHOO.util.AssertionError.call(this, message);
    
    /**
     * The unexpected value.
     * @type Object
     * @property unexpected
     */
    this.unexpected /*:Object*/ = unexpected;
    
    /**
     * The name of the error that occurred.
     * @type String
     * @property name
     */
    this.name /*:String*/ = "UnexpectedValue";
    
};

//inherit methods
YAHOO.lang.extend(YAHOO.util.UnexpectedValue, YAHOO.util.AssertionError, {

    /**
     * Returns a fully formatted error for an assertion failure. The message
     * contains information about the unexpected value that was encountered.
     * @method getMessage
     * @return {String} A string describing the error.
     */
    getMessage : function () /*:String*/ {
        return this.message + "\nUnexpected: " + this.unexpected + " (" + (typeof this.unexpected) + ") ";
    }

});

/**
 * ShouldFail is subclass of AssertionError that is thrown whenever
 * a test was expected to fail but did not.
 *
 * @param {String} message The message to display when the error occurs.
 * @namespace YAHOO.util
 * @extends YAHOO.util.AssertionError
 * @class ShouldFail
 * @constructor
 */  
YAHOO.util.ShouldFail = function (message /*:String*/){

    //call superclass
    YAHOO.util.AssertionError.call(this, message || "This test should fail but didn't.");
    
    /**
     * The name of the error that occurred.
     * @type String
     * @property name
     */
    this.name /*:String*/ = "ShouldFail";
    
};

//inherit methods
YAHOO.lang.extend(YAHOO.util.ShouldFail, YAHOO.util.AssertionError);

/**
 * ShouldError is subclass of AssertionError that is thrown whenever
 * a test is expected to throw an error but doesn't.
 *
 * @param {String} message The message to display when the error occurs.
 * @namespace YAHOO.util
 * @extends YAHOO.util.AssertionError
 * @class ShouldError
 * @constructor
 */  
YAHOO.util.ShouldError = function (message /*:String*/){

    //call superclass
    YAHOO.util.AssertionError.call(this, message || "This test should have thrown an error but didn't.");
    
    /**
     * The name of the error that occurred.
     * @type String
     * @property name
     */
    this.name /*:String*/ = "ShouldError";
    
};

//inherit methods
YAHOO.lang.extend(YAHOO.util.ShouldError, YAHOO.util.AssertionError);

/**
 * UnexpectedError is subclass of AssertionError that is thrown whenever
 * an error occurs within the course of a test and the test was not expected
 * to throw an error.
 *
 * @param {Error} cause The unexpected error that caused this error to be 
 *                      thrown.
 * @namespace YAHOO.util
 * @extends YAHOO.util.AssertionError
 * @class UnexpectedError
 * @constructor
 */  
YAHOO.util.UnexpectedError = function (cause /*:Object*/){

    //call superclass
    YAHOO.util.AssertionError.call(this, "Unexpected error: " + cause.message);
    
    /**
     * The unexpected error that occurred.
     * @type Error
     * @property cause
     */
    this.cause /*:Error*/ = cause;
    
    /**
     * The name of the error that occurred.
     * @type String
     * @property name
     */
    this.name /*:String*/ = "UnexpectedError";
    
    /**
     * Stack information for the error (if provided).
     * @type String
     * @property stack
     */
    this.stack /*:String*/ = cause.stack;
    
};

//inherit methods
YAHOO.lang.extend(YAHOO.util.UnexpectedError, YAHOO.util.AssertionError);
//-----------------------------------------------------------------------------
// ArrayAssert object
//-----------------------------------------------------------------------------

/**
 * The ArrayAssert object provides functions to test JavaScript array objects
 * for a variety of cases.
 *
 * @namespace YAHOO.util
 * @class ArrayAssert
 * @static
 */
 
YAHOO.util.ArrayAssert = {

    /**
     * Asserts that a value is present in an array. This uses the triple equals 
     * sign so no type cohersion may occur.
     * @param {Object} needle The value that is expected in the array.
     * @param {Array} haystack An array of values.
     * @param {String} message (Optional) The message to display if the assertion fails.
     * @method contains
     * @static
     */
    contains : function (needle /*:Object*/, haystack /*:Array*/, 
                           message /*:String*/) /*:Void*/ {
        
        var found /*:Boolean*/ = false;
        var Assert = YAHOO.util.Assert;
        
        //begin checking values
        for (var i=0; i < haystack.length && !found; i++){
            if (haystack[i] === needle) {
                found = true;
            }
        }
        
        if (!found){
            Assert.fail(Assert._formatMessage(message, "Value " + needle + " (" + (typeof needle) + ") not found in array [" + haystack + "]."));
        }
    },

    /**
     * Asserts that a set of values are present in an array. This uses the triple equals 
     * sign so no type cohersion may occur. For this assertion to pass, all values must
     * be found.
     * @param {Object[]} needles An array of values that are expected in the array.
     * @param {Array} haystack An array of values to check.
     * @param {String} message (Optional) The message to display if the assertion fails.
     * @method containsItems
     * @static
     */
    containsItems : function (needles /*:Object[]*/, haystack /*:Array*/, 
                           message /*:String*/) /*:Void*/ {

        //begin checking values
        for (var i=0; i < needles.length; i++){
            this.contains(needles[i], haystack, message);
        }
    },

    /**
     * Asserts that a value matching some condition is present in an array. This uses
     * a function to determine a match.
     * @param {Function} matcher A function that returns true if the items matches or false if not.
     * @param {Array} haystack An array of values.
     * @param {String} message (Optional) The message to display if the assertion fails.
     * @method containsMatch
     * @static
     */
    containsMatch : function (matcher /*:Function*/, haystack /*:Array*/, 
                           message /*:String*/) /*:Void*/ {
        
        //check for valid matcher
        if (typeof matcher != "function"){
            throw new TypeError("ArrayAssert.containsMatch(): First argument must be a function.");
        }
        
        var found /*:Boolean*/ = false;
        var Assert = YAHOO.util.Assert;
        
        //begin checking values
        for (var i=0; i < haystack.length && !found; i++){
            if (matcher(haystack[i])) {
                found = true;
            }
        }
        
        if (!found){
            Assert.fail(Assert._formatMessage(message, "No match found in array [" + haystack + "]."));
        }
    },

    /**
     * Asserts that a value is not present in an array. This uses the triple equals 
     * sign so no type cohersion may occur.
     * @param {Object} needle The value that is expected in the array.
     * @param {Array} haystack An array of values.
     * @param {String} message (Optional) The message to display if the assertion fails.
     * @method doesNotContain
     * @static
     */
    doesNotContain : function (needle /*:Object*/, haystack /*:Array*/, 
                           message /*:String*/) /*:Void*/ {
        
        var found /*:Boolean*/ = false;
        var Assert = YAHOO.util.Assert;
        
        //begin checking values
        for (var i=0; i < haystack.length && !found; i++){
            if (haystack[i] === needle) {
                found = true;
            }
        }
        
        if (found){
            Assert.fail(Assert._formatMessage(message, "Value found in array [" + haystack + "]."));
        }
    },

    /**
     * Asserts that a set of values are not present in an array. This uses the triple equals 
     * sign so no type cohersion may occur. For this assertion to pass, all values must
     * not be found.
     * @param {Object[]} needles An array of values that are not expected in the array.
     * @param {Array} haystack An array of values to check.
     * @param {String} message (Optional) The message to display if the assertion fails.
     * @method doesNotContainItems
     * @static
     */
    doesNotContainItems : function (needles /*:Object[]*/, haystack /*:Array*/, 
                           message /*:String*/) /*:Void*/ {

        for (var i=0; i < needles.length; i++){
            this.doesNotContain(needles[i], haystack, message);
        }

    },
        
    /**
     * Asserts that no values matching a condition are present in an array. This uses
     * a function to determine a match.
     * @param {Function} matcher A function that returns true if the items matches or false if not.
     * @param {Array} haystack An array of values.
     * @param {String} message (Optional) The message to display if the assertion fails.
     * @method doesNotContainMatch
     * @static
     */
    doesNotContainMatch : function (matcher /*:Function*/, haystack /*:Array*/, 
                           message /*:String*/) /*:Void*/ {
        
        //check for valid matcher
        if (typeof matcher != "function"){
            throw new TypeError("ArrayAssert.doesNotContainMatch(): First argument must be a function.");
        }

        var found /*:Boolean*/ = false;
        var Assert = YAHOO.util.Assert;
        
        //begin checking values
        for (var i=0; i < haystack.length && !found; i++){
            if (matcher(haystack[i])) {
                found = true;
            }
        }
        
        if (found){
            Assert.fail(Assert._formatMessage(message, "Value found in array [" + haystack + "]."));
        }
    },
        
    /**
     * Asserts that the given value is contained in an array at the specified index.
     * This uses the triple equals sign so no type cohersion will occur.
     * @param {Object} needle The value to look for.
     * @param {Array} haystack The array to search in.
     * @param {int} index The index at which the value should exist.
     * @param {String} message (Optional) The message to display if the assertion fails.
     * @method indexOf
     * @static
     */
    indexOf : function (needle /*:Object*/, haystack /*:Array*/, index /*:int*/, message /*:String*/) /*:Void*/ {
    
        //try to find the value in the array
        for (var i=0; i < haystack.length; i++){
            if (haystack[i] === needle){
                YAHOO.util.Assert.areEqual(index, i, message || "Value exists at index " + i + " but should be at index " + index + ".");
                return;
            }
        }
        
        var Assert = YAHOO.util.Assert;
        
        //if it makes it here, it wasn't found at all
        Assert.fail(Assert._formatMessage(message, "Value doesn't exist in array [" + haystack + "]."));
    },
        
    /**
     * Asserts that the values in an array are equal, and in the same position,
     * as values in another array. This uses the double equals sign
     * so type cohersion may occur. Note that the array objects themselves
     * need not be the same for this test to pass.
     * @param {Array} expected An array of the expected values.
     * @param {Array} actual Any array of the actual values.
     * @param {String} message (Optional) The message to display if the assertion fails.
     * @method itemsAreEqual
     * @static
     */
    itemsAreEqual : function (expected /*:Array*/, actual /*:Array*/, 
                           message /*:String*/) /*:Void*/ {
        
        //one may be longer than the other, so get the maximum length
        var len /*:int*/ = Math.max(expected.length, actual.length || 0);
        var Assert = YAHOO.util.Assert;
       
        //begin checking values
        for (var i=0; i < len; i++){
            Assert.areEqual(expected[i], actual[i], 
                Assert._formatMessage(message, "Values in position " + i + " are not equal."));
        }
    },
    
    /**
     * Asserts that the values in an array are equivalent, and in the same position,
     * as values in another array. This uses a function to determine if the values
     * are equivalent. Note that the array objects themselves
     * need not be the same for this test to pass.
     * @param {Array} expected An array of the expected values.
     * @param {Array} actual Any array of the actual values.
     * @param {Function} comparator A function that returns true if the values are equivalent
     *      or false if not.
     * @param {String} message (Optional) The message to display if the assertion fails.
     * @return {Void}
     * @method itemsAreEquivalent
     * @static
     */
    itemsAreEquivalent : function (expected /*:Array*/, actual /*:Array*/, 
                           comparator /*:Function*/, message /*:String*/) /*:Void*/ {
        
        //make sure the comparator is valid
        if (typeof comparator != "function"){
            throw new TypeError("ArrayAssert.itemsAreEquivalent(): Third argument must be a function.");
        }
        
        //one may be longer than the other, so get the maximum length
        var len /*:int*/ = Math.max(expected.length, actual.length || 0);
        
        //begin checking values
        for (var i=0; i < len; i++){
            if (!comparator(expected[i], actual[i])){
                throw new YAHOO.util.ComparisonFailure(YAHOO.util.Assert._formatMessage(message, "Values in position " + i + " are not equivalent."), expected[i], actual[i]);
            }
        }
    },
    
    /**
     * Asserts that an array is empty.
     * @param {Array} actual The array to test.
     * @param {String} message (Optional) The message to display if the assertion fails.
     * @method isEmpty
     * @static
     */
    isEmpty : function (actual /*:Array*/, message /*:String*/) /*:Void*/ {        
        if (actual.length > 0){
            var Assert = YAHOO.util.Assert;
            Assert.fail(Assert._formatMessage(message, "Array should be empty."));
        }
    },    
    
    /**
     * Asserts that an array is not empty.
     * @param {Array} actual The array to test.
     * @param {String} message (Optional) The message to display if the assertion fails.
     * @method isNotEmpty
     * @static
     */
    isNotEmpty : function (actual /*:Array*/, message /*:String*/) /*:Void*/ {        
        if (actual.length === 0){
            var Assert = YAHOO.util.Assert;
            Assert.fail(Assert._formatMessage(message, "Array should not be empty."));
        }
    },    
    
    /**
     * Asserts that the values in an array are the same, and in the same position,
     * as values in another array. This uses the triple equals sign
     * so no type cohersion will occur. Note that the array objects themselves
     * need not be the same for this test to pass.
     * @param {Array} expected An array of the expected values.
     * @param {Array} actual Any array of the actual values.
     * @param {String} message (Optional) The message to display if the assertion fails.
     * @method itemsAreSame
     * @static
     */
    itemsAreSame : function (expected /*:Array*/, actual /*:Array*/, 
                          message /*:String*/) /*:Void*/ {
        
        //one may be longer than the other, so get the maximum length
        var len /*:int*/ = Math.max(expected.length, actual.length || 0);
        var Assert = YAHOO.util.Assert;
        
        //begin checking values
        for (var i=0; i < len; i++){
            Assert.areSame(expected[i], actual[i], 
                Assert._formatMessage(message, "Values in position " + i + " are not the same."));
        }
    },
    
    /**
     * Asserts that the given value is contained in an array at the specified index,
     * starting from the back of the array.
     * This uses the triple equals sign so no type cohersion will occur.
     * @param {Object} needle The value to look for.
     * @param {Array} haystack The array to search in.
     * @param {int} index The index at which the value should exist.
     * @param {String} message (Optional) The message to display if the assertion fails.
     * @method lastIndexOf
     * @static
     */
    lastIndexOf : function (needle /*:Object*/, haystack /*:Array*/, index /*:int*/, message /*:String*/) /*:Void*/ {
    
        var Assert = YAHOO.util.Assert;
    
        //try to find the value in the array
        for (var i=haystack.length; i >= 0; i--){
            if (haystack[i] === needle){
                Assert.areEqual(index, i, Assert._formatMessage(message, "Value exists at index " + i + " but should be at index " + index + "."));
                return;
            }
        }
        
        //if it makes it here, it wasn't found at all
        Assert.fail(Assert._formatMessage(message, "Value doesn't exist in array."));        
    }
    
};
YAHOO.namespace("util");


//-----------------------------------------------------------------------------
// ObjectAssert object
//-----------------------------------------------------------------------------

/**
 * The ObjectAssert object provides functions to test JavaScript objects
 * for a variety of cases.
 *
 * @namespace YAHOO.util
 * @class ObjectAssert
 * @static
 */
YAHOO.util.ObjectAssert = {
        
    /**
     * Asserts that all properties in the object exist in another object.
     * @param {Object} expected An object with the expected properties.
     * @param {Object} actual An object with the actual properties.
     * @param {String} message (Optional) The message to display if the assertion fails.
     * @method propertiesAreEqual
     * @static
     */
    propertiesAreEqual : function (expected /*:Object*/, actual /*:Object*/, 
                           message /*:String*/) /*:Void*/ {
        
        var Assert = YAHOO.util.Assert;
        
        //get all properties in the object
        var properties /*:Array*/ = [];        
        for (var property in expected){
            properties.push(property);
        }
        
        //see if the properties are in the expected object
        for (var i=0; i < properties.length; i++){
            Assert.isNotUndefined(actual[properties[i]], 
                Assert._formatMessage(message, "Property '" + properties[i] + "' expected."));
        }

    },
    
    /**
     * Asserts that an object has a property with the given name.
     * @param {String} propertyName The name of the property to test.
     * @param {Object} object The object to search.
     * @param {String} message (Optional) The message to display if the assertion fails.
     * @method hasProperty
     * @static
     */    
    hasProperty : function (propertyName /*:String*/, object /*:Object*/, message /*:String*/) /*:Void*/ {
        if (!(propertyName in object)){
            var Assert = YAHOO.util.Assert;
            Assert.fail(Assert._formatMessage(message, "Property '" + propertyName + "' not found on object."));
        }    
    },
    
    /**
     * Asserts that a property with the given name exists on an object instance (not on its prototype).
     * @param {String} propertyName The name of the property to test.
     * @param {Object} object The object to search.
     * @param {String} message (Optional) The message to display if the assertion fails.
     * @method hasProperty
     * @static
     */    
    hasOwnProperty : function (propertyName /*:String*/, object /*:Object*/, message /*:String*/) /*:Void*/ {
        if (!YAHOO.lang.hasOwnProperty(object, propertyName)){
            var Assert = YAHOO.util.Assert;
            Assert.fail(Assert._formatMessage(message, "Property '" + propertyName + "' not found on object instance."));
        }     
    }
};
//-----------------------------------------------------------------------------
// DateAssert object
//-----------------------------------------------------------------------------

/**
 * The DateAssert object provides functions to test JavaScript Date objects
 * for a variety of cases.
 *
 * @namespace YAHOO.util
 * @class DateAssert
 * @static
 */
 
YAHOO.util.DateAssert = {

    /**
     * Asserts that a date's month, day, and year are equal to another date's.
     * @param {Date} expected The expected date.
     * @param {Date} actual The actual date to test.
     * @param {String} message (Optional) The message to display if the assertion fails.
     * @method datesAreEqual
     * @static
     */
    datesAreEqual : function (expected /*:Date*/, actual /*:Date*/, message /*:String*/){
        if (expected instanceof Date && actual instanceof Date){
            var Assert = YAHOO.util.Assert;
            Assert.areEqual(expected.getFullYear(), actual.getFullYear(), Assert._formatMessage(message, "Years should be equal."));
            Assert.areEqual(expected.getMonth(), actual.getMonth(), Assert._formatMessage(message, "Months should be equal."));
            Assert.areEqual(expected.getDate(), actual.getDate(), Assert._formatMessage(message, "Day of month should be equal."));
        } else {
            throw new TypeError("DateAssert.datesAreEqual(): Expected and actual values must be Date objects.");
        }
    },

    /**
     * Asserts that a date's hour, minutes, and seconds are equal to another date's.
     * @param {Date} expected The expected date.
     * @param {Date} actual The actual date to test.
     * @param {String} message (Optional) The message to display if the assertion fails.
     * @method timesAreEqual
     * @static
     */
    timesAreEqual : function (expected /*:Date*/, actual /*:Date*/, message /*:String*/){
        if (expected instanceof Date && actual instanceof Date){
            var Assert = YAHOO.util.Assert;
            Assert.areEqual(expected.getHours(), actual.getHours(), Assert._formatMessage(message, "Hours should be equal."));
            Assert.areEqual(expected.getMinutes(), actual.getMinutes(), Assert._formatMessage(message, "Minutes should be equal."));
            Assert.areEqual(expected.getSeconds(), actual.getSeconds(), Assert._formatMessage(message, "Seconds should be equal."));
        } else {
            throw new TypeError("DateAssert.timesAreEqual(): Expected and actual values must be Date objects.");
        }
    }
    
};
YAHOO.namespace("tool");

//-----------------------------------------------------------------------------
// TestManager object
//-----------------------------------------------------------------------------

/**
 * Runs pages containing test suite definitions.
 * @namespace YAHOO.tool
 * @class TestManager
 * @static
 */
YAHOO.tool.TestManager = {

    /**
     * Constant for the testpagebegin custom event
     * @property TEST_PAGE_BEGIN_EVENT
     * @static
     * @type string
     * @final
     */
    TEST_PAGE_BEGIN_EVENT /*:String*/ : "testpagebegin",

    /**
     * Constant for the testpagecomplete custom event
     * @property TEST_PAGE_COMPLETE_EVENT
     * @static
     * @type string
     * @final
     */
    TEST_PAGE_COMPLETE_EVENT /*:String*/ : "testpagecomplete",

    /**
     * Constant for the testmanagerbegin custom event
     * @property TEST_MANAGER_BEGIN_EVENT
     * @static
     * @type string
     * @final
     */
    TEST_MANAGER_BEGIN_EVENT /*:String*/ : "testmanagerbegin",

    /**
     * Constant for the testmanagercomplete custom event
     * @property TEST_MANAGER_COMPLETE_EVENT
     * @static
     * @type string
     * @final
     */
    TEST_MANAGER_COMPLETE_EVENT /*:String*/ : "testmanagercomplete",

    //-------------------------------------------------------------------------
    // Private Properties
    //-------------------------------------------------------------------------
    
    
    /**
     * The URL of the page currently being executed.
     * @type String
     * @private
     * @property _curPage
     * @static
     */
    _curPage /*:String*/ : null,
    
    /**
     * The frame used to load and run tests.
     * @type Window
     * @private
     * @property _frame
     * @static
     */
    _frame /*:Window*/ : null,
    
    /**
     * The logger used to output results from the various tests.
     * @type YAHOO.tool.TestLogger
     * @private
     * @property _logger
     * @static
     */
    _logger : null,
    
    /**
     * The timeout ID for the next iteration through the tests.
     * @type int
     * @private
     * @property _timeoutId
     * @static
     */
    _timeoutId /*:int*/ : 0,
    
    /**
     * Array of pages to load.
     * @type String[]
     * @private
     * @property _pages
     * @static
     */
    _pages /*:String[]*/ : [],
    
    /**
     * Aggregated results
     * @type Object
     * @private
     * @property _results
     * @static
     */
    _results: null,
    
    //-------------------------------------------------------------------------
    // Private Methods
    //-------------------------------------------------------------------------
    
    /**
     * Handles TestRunner.COMPLETE_EVENT, storing the results and beginning
     * the loop again.
     * @param {Object} data Data about the event.
     * @return {Void}
     * @private
     * @static
     */
    _handleTestRunnerComplete : function (data /*:Object*/) /*:Void*/ {

        this.fireEvent(this.TEST_PAGE_COMPLETE_EVENT, {
                page: this._curPage,
                results: data.results
            });
    
        //save results
        //this._results[this.curPage] = data.results;
        
        //process 'em
        this._processResults(this._curPage, data.results);
        
        this._logger.clearTestRunner();
    
        //if there's more to do, set a timeout to begin again
        if (this._pages.length){
            this._timeoutId = setTimeout(function(){
                YAHOO.tool.TestManager._run();
            }, 1000);
        } else {
            this.fireEvent(this.TEST_MANAGER_COMPLETE_EVENT, this._results);
        }
    },
    
    /**
     * Processes the results of a test page run, outputting log messages
     * for failed tests.
     * @return {Void}
     * @private
     * @static
     */
    _processResults : function (page /*:String*/, results /*:Object*/) /*:Void*/ {

        var r = this._results;
        
        r.passed += results.passed;
        r.failed += results.failed;
        r.ignored += results.ignored;
        r.total += results.total;
        r.duration += results.duration;
        
        if (results.failed){
            r.failedPages.push(page);
        } else {
            r.passedPages.push(page);
        }
        
        results.name = page;
        results.type = "page";
        
        r[page] = results;
    },
    
    /**
     * Loads the next test page into the iframe.
     * @return {Void}
     * @static
     * @private
     */
    _run : function () /*:Void*/ {
    
        //set the current page
        this._curPage = this._pages.shift();

        this.fireEvent(this.TEST_PAGE_BEGIN_EVENT, this._curPage);
        
        //load the frame - destroy history in case there are other iframes that
        //need testing
        this._frame.location.replace(this._curPage);
    
    },
        
    //-------------------------------------------------------------------------
    // Public Methods
    //-------------------------------------------------------------------------
    
    /**
     * Signals that a test page has been loaded. This should be called from
     * within the test page itself to notify the TestManager that it is ready.
     * @return {Void}
     * @static
     */
    load : function () /*:Void*/ {
        if (parent.YAHOO.tool.TestManager !== this){
            parent.YAHOO.tool.TestManager.load();
        } else {
            
            if (this._frame) {
                //assign event handling
                var TestRunner = this._frame.YAHOO.tool.TestRunner;

                this._logger.setTestRunner(TestRunner);
                TestRunner.subscribe(TestRunner.COMPLETE_EVENT, this._handleTestRunnerComplete, this, true);
                
                //run it
                TestRunner.run();
            }
        }
    },
    
    /**
     * Sets the pages to be loaded.
     * @param {String[]} pages An array of URLs to load.
     * @return {Void}
     * @static
     */
    setPages : function (pages /*:String[]*/) /*:Void*/ {
        this._pages = pages;
    },
    
    /**
     * Begins the process of running the tests.
     * @return {Void}
     * @static
     */
    start : function () /*:Void*/ {

        if (!this._initialized) {

            /**
             * Fires when loading a test page
             * @event testpagebegin
             * @param curPage {string} the page being loaded
             * @static
             */
            this.createEvent(this.TEST_PAGE_BEGIN_EVENT);

            /**
             * Fires when a test page is complete
             * @event testpagecomplete
             * @param obj {page: string, results: object} the name of the
             * page that was loaded, and the test suite results
             * @static
             */
            this.createEvent(this.TEST_PAGE_COMPLETE_EVENT);

            /**
             * Fires when the test manager starts running all test pages
             * @event testmanagerbegin
             * @static
             */
            this.createEvent(this.TEST_MANAGER_BEGIN_EVENT);

            /**
             * Fires when the test manager finishes running all test pages.  External
             * test runners should subscribe to this event in order to get the
             * aggregated test results.
             * @event testmanagercomplete
             * @param obj { pages_passed: int, pages_failed: int, tests_passed: int
             *              tests_failed: int, passed: string[], failed: string[],
             *              page_results: {} }
             * @static
             */
            this.createEvent(this.TEST_MANAGER_COMPLETE_EVENT);

            //create iframe if not already available
            if (!this._frame){
                var frame /*:HTMLElement*/ = document.createElement("iframe");
                frame.style.visibility = "hidden";
                frame.style.position = "absolute";
                document.body.appendChild(frame);
                this._frame = frame.contentWindow || frame.contentDocument.parentWindow;
            }
            
            //create test logger if not already available
            if (!this._logger){
                this._logger = new YAHOO.tool.TestLogger();
            }

            this._initialized = true;
        }


        // reset the results cache
        this._results = {
        
            passed: 0,
            failed: 0,
            ignored: 0,
            total: 0,
            type: "report",
            name: "YUI Test Results",
            duration: 0,
            failedPages:[],
            passedPages:[]
            /*
            // number of pages that pass
            pages_passed: 0,
            // number of pages that fail
            pages_failed: 0,
            // total number of tests passed
            tests_passed: 0,
            // total number of tests failed
            tests_failed: 0,
            // array of pages that passed
            passed: [],
            // array of pages that failed
            failed: [],
            // map of full results for each page
            page_results: {}*/
        };

        this.fireEvent(this.TEST_MANAGER_BEGIN_EVENT, null);
        this._run();
    
    },

    /**
     * Stops the execution of tests.
     * @return {Void}
     * @static
     */
    stop : function () /*:Void*/ {
        clearTimeout(this._timeoutId);
    }

};

YAHOO.lang.augmentObject(YAHOO.tool.TestManager, YAHOO.util.EventProvider.prototype);

YAHOO.namespace("tool");

//-----------------------------------------------------------------------------
// TestLogger object
//-----------------------------------------------------------------------------

/**
 * Displays test execution progress and results, providing filters based on
 * different key events.
 * @namespace YAHOO.tool
 * @class TestLogger
 * @constructor
 * @param {HTMLElement} element (Optional) The element to create the logger in.
 * @param {Object} config (Optional) Configuration options for the logger.
 */
YAHOO.tool.TestLogger = function (element, config) {
    YAHOO.tool.TestLogger.superclass.constructor.call(this, element, config);
    this.init();
};

YAHOO.lang.extend(YAHOO.tool.TestLogger, YAHOO.widget.LogReader, {

    footerEnabled : true,
    newestOnTop : false,

    /**
     * Formats message string to HTML for output to console.
     * @private
     * @method formatMsg
     * @param oLogMsg {Object} Log message object.
     * @return {String} HTML-formatted message for output to console.
     */
    formatMsg : function(message /*:Object*/) {
    
        var category /*:String*/ = message.category;        
        var text /*:String*/ = this.html2Text(message.msg);
        
        return "<pre><p><span class=\"" + category + "\">" + category.toUpperCase() + "</span> " + text + "</p></pre>";
    
    },
    
    //-------------------------------------------------------------------------
    // Private Methods
    //-------------------------------------------------------------------------
    
    /*
     * Initializes the logger.
     * @private
     */
    init : function () {
    
        //attach to any available TestRunner
        if (YAHOO.tool.TestRunner){
            this.setTestRunner(YAHOO.tool.TestRunner);
        }
        
        //hide useless sources
        this.hideSource("global");
        this.hideSource("LogReader");
        
        //hide useless message categories
        this.hideCategory("warn");
        this.hideCategory("window");
        this.hideCategory("time");
        
        //reset the logger
        this.clearConsole();
    },
    
    /**
     * Clears the reference to the TestRunner from previous operations. This 
     * unsubscribes all events and removes the object reference.
     * @return {Void}
     * @static
     */
    clearTestRunner : function () /*:Void*/ {
        if (this._runner){
            this._runner.unsubscribeAll();
            this._runner = null;
        }
    },
    
    /**
     * Sets the source test runner that the logger should monitor.
     * @param {YAHOO.tool.TestRunner} testRunner The TestRunner to observe.
     * @return {Void}
     * @static
     */
    setTestRunner : function (testRunner /*:YAHOO.tool.TestRunner*/) /*:Void*/ {
    
        if (this._runner){
            this.clearTestRunner();
        }
        
        this._runner = testRunner;
        
        //setup event _handlers
        testRunner.subscribe(testRunner.TEST_PASS_EVENT, this._handleTestRunnerEvent, this, true);
        testRunner.subscribe(testRunner.TEST_FAIL_EVENT, this._handleTestRunnerEvent, this, true);
        testRunner.subscribe(testRunner.TEST_IGNORE_EVENT, this._handleTestRunnerEvent, this, true);
        testRunner.subscribe(testRunner.BEGIN_EVENT, this._handleTestRunnerEvent, this, true);
        testRunner.subscribe(testRunner.COMPLETE_EVENT, this._handleTestRunnerEvent, this, true);
        testRunner.subscribe(testRunner.TEST_SUITE_BEGIN_EVENT, this._handleTestRunnerEvent, this, true);
        testRunner.subscribe(testRunner.TEST_SUITE_COMPLETE_EVENT, this._handleTestRunnerEvent, this, true);
        testRunner.subscribe(testRunner.TEST_CASE_BEGIN_EVENT, this._handleTestRunnerEvent, this, true);
        testRunner.subscribe(testRunner.TEST_CASE_COMPLETE_EVENT, this._handleTestRunnerEvent, this, true);    
    },
    
    //-------------------------------------------------------------------------
    // Event Handlers
    //-------------------------------------------------------------------------
    
    /**
     * Handles all TestRunner events, outputting appropriate data into the console.
     * @param {Object} data The event data object.
     * @return {Void}
     * @private
     */
    _handleTestRunnerEvent : function (data /*:Object*/) /*:Void*/ {
    
        //shortcut variables
        var TestRunner /*:Object*/ = YAHOO.tool.TestRunner;
    
        //data variables
        var message /*:String*/ = "";
        var messageType /*:String*/ = "";
        
        switch(data.type){
            case TestRunner.BEGIN_EVENT:
                message = "Testing began at " + (new Date()).toString() + ".";
                messageType = "info";
                break;
                
            case TestRunner.COMPLETE_EVENT:
                message = "Testing completed at " + (new Date()).toString() + ".\nPassed:" + 
                    data.results.passed + " Failed:" + data.results.failed + " Total:" + data.results.total;
                messageType = "info";
                break;
                
            case TestRunner.TEST_FAIL_EVENT:
                message = data.testName + ": " + data.error.getMessage();
                messageType = "fail";
                break;
                
            case TestRunner.TEST_IGNORE_EVENT:
                message = data.testName + ": ignored.";
                messageType = "ignore";
                break;
                
            case TestRunner.TEST_PASS_EVENT:
                message = data.testName + ": passed.";
                messageType = "pass";
                break;
                
            case TestRunner.TEST_SUITE_BEGIN_EVENT:
                message = "Test suite \"" + data.testSuite.name + "\" started.";
                messageType = "info";
                break;
                
            case TestRunner.TEST_SUITE_COMPLETE_EVENT:
                message = "Test suite \"" + data.testSuite.name + "\" completed.\nPassed:" + 
                    data.results.passed + " Failed:" + data.results.failed + " Total:" + data.results.total;
                messageType = "info";
                break;
                
            case TestRunner.TEST_CASE_BEGIN_EVENT:
                message = "Test case \"" + data.testCase.name + "\" started.";
                messageType = "info";
                break;
                
            case TestRunner.TEST_CASE_COMPLETE_EVENT:
                message = "Test case \"" + data.testCase.name + "\" completed.\nPassed:" + 
                    data.results.passed + " Failed:" + data.results.failed + " Total:" + data.results.total;
                messageType = "info";
                break;
            default:
                message = "Unexpected event " + data.type;
                message = "info";
        }
    
        YAHOO.log(message, messageType, "TestRunner");    
    }
    
});
YAHOO.namespace("tool.TestFormat");

/**
 * Returns test results formatted as a JSON string. Requires JSON utility.
 * @param {Object} result The results object created by TestRunner.
 * @return {String} An XML-formatted string of results.
 * @namespace YAHOO.tool.TestFormat
 * @method JSON
 * @static
 */
YAHOO.tool.TestFormat.JSON = function(results /*:Object*/) /*:String*/ {
    return YAHOO.lang.JSON.stringify(results);
};

/**
 * Returns test results formatted as an XML string.
 * @param {Object} result The results object created by TestRunner.
 * @return {String} An XML-formatted string of results.
 * @namespace YAHOO.tool.TestFormat
 * @method XML
 * @static
 */
YAHOO.tool.TestFormat.XML = function(results /*:Object*/) /*:String*/ {

    var l = YAHOO.lang;
    var xml /*:String*/ = "<" + results.type + " name=\"" + results.name.replace(/"/g, "&quot;").replace(/'/g, "&apos;") + "\"";
    
    if (l.isNumber(results.duration)){
        xml += " duration=\"" + results.duration + "\"";
    }
    
    if (results.type == "test"){
        xml += " result=\"" + results.result + "\" message=\"" + results.message + "\">";
    } else {
        xml += " passed=\"" + results.passed + "\" failed=\"" + results.failed + "\" ignored=\"" + results.ignored + "\" total=\"" + results.total + "\">";
        for (var prop in results) {
            if (l.hasOwnProperty(results, prop) && l.isObject(results[prop]) && !l.isArray(results[prop])){
                xml += arguments.callee(results[prop]);
            }
        }        
    }

    xml += "</" + results.type + ">";
    
    return xml;

};
YAHOO.namespace("tool");

/**
 * An object capable of sending test results to a server.
 * @param {String} url The URL to submit the results to.
 * @param {Function} format (Optiona) A function that outputs the results in a specific format.
 *      Default is YAHOO.tool.TestFormat.XML.
 * @constructor
 * @namespace YAHOO.tool
 * @class TestReporter
 */
YAHOO.tool.TestReporter = function(url /*:String*/, format /*:Function*/) {

    /**
     * The URL to submit the data to.
     * @type String
     * @property url
     */
    this.url /*:String*/ = url;

    /**
     * The formatting function to call when submitting the data.
     * @type Function
     * @property format
     */
    this.format /*:Function*/ = format || YAHOO.tool.TestFormat.XML;

    /**
     * Extra fields to submit with the request.
     * @type Object
     * @property _fields
     * @private
     */
    this._fields /*:Object*/ = new Object();
    
    /**
     * The form element used to submit the results.
     * @type HTMLFormElement
     * @property _form
     * @private
     */
    this._form /*:HTMLElement*/ = null;

    /**
     * Iframe used as a target for form submission.
     * @type HTMLIFrameElement
     * @property _iframe
     * @private
     */
    this._iframe /*:HTMLElement*/ = null;
};

YAHOO.tool.TestReporter.prototype = {

    //restore missing constructor
    constructor: YAHOO.tool.TestReporter,
    
    /**
     * Convert a date into ISO format.
     * From Douglas Crockford's json2.js
     * @param {Date} date The date to convert.
     * @return {String} An ISO-formatted date string
     * @method _convertToISOString
     * @private
     */    
    _convertToISOString: function(date){
        function f(n) {
            // Format integers to have at least two digits.
            return n < 10 ? '0' + n : n;
        }

        return date.getUTCFullYear()   + '-' +
             f(date.getUTCMonth() + 1) + '-' +
             f(date.getUTCDate())      + 'T' +
             f(date.getUTCHours())     + ':' +
             f(date.getUTCMinutes())   + ':' +
             f(date.getUTCSeconds())   + 'Z';     
    
    },

    /**
     * Adds a field to the form that submits the results.
     * @param {String} name The name of the field.
     * @param {Variant} value The value of the field.
     * @return {Void}
     * @method addField
     */
    addField : function (name /*:String*/, value /*:Variant*/) /*:Void*/{
        this._fields[name] = value;    
    },
    
    /**
     * Removes all previous defined fields.
     * @return {Void}
     * @method addField
     */
    clearFields : function() /*:Void*/{
        this._fields = new Object();
    },

    /**
     * Cleans up the memory associated with the TestReporter, removing DOM elements
     * that were created.
     * @return {Void}
     * @method destroy
     */
    destroy : function() /*:Void*/ {
        if (this._form){
            this._form.parentNode.removeChild(this._form);
            this._form = null;
        }        
        if (this._iframe){
            this._iframe.parentNode.removeChild(this._iframe);
            this._iframe = null;
        }
        this._fields = null;
    },

    /**
     * Sends the report to the server.
     * @param {Object} results The results object created by TestRunner.
     * @return {Void}
     * @method report
     */
    report : function(results /*:Object*/) /*:Void*/{
    
        //if the form hasn't been created yet, create it
        if (!this._form){
            this._form = document.createElement("form");
            this._form.method = "post";
            this._form.style.visibility = "hidden";
            this._form.style.position = "absolute";
            this._form.style.top = 0;
            document.body.appendChild(this._form);
        
            //IE won't let you assign a name using the DOM, must do it the hacky way
            if (YAHOO.env.ua.ie){
                this._iframe = document.createElement("<iframe name=\"yuiTestTarget\" />");
            } else {
                this._iframe = document.createElement("iframe");
                this._iframe.name = "yuiTestTarget";
            }

            this._iframe.src = "javascript:false";
            this._iframe.style.visibility = "hidden";
            this._iframe.style.position = "absolute";
            this._iframe.style.top = 0;
            document.body.appendChild(this._iframe);

            this._form.target = "yuiTestTarget";
        }

        //set the form's action
        this._form.action = this.url;
    
        //remove any existing fields
        while(this._form.hasChildNodes()){
            this._form.removeChild(this._form.lastChild);
        }
        
        //create default fields
        this._fields.results = this.format(results);
        this._fields.useragent = navigator.userAgent;
        this._fields.timestamp = this._convertToISOString(new Date());

        //add fields to the form
        for (var prop in this._fields){
            if (YAHOO.lang.hasOwnProperty(this._fields, prop) && typeof this._fields[prop] != "function"){
                if (YAHOO.env.ua.ie){
                    input = document.createElement("<input name=\"" + prop + "\" >");
                } else {
                    input = document.createElement("input");
                    input.name = prop;
                }
                input.type = "hidden";
                input.value = this._fields[prop];
                this._form.appendChild(input);
            }
        }

        //remove default fields
        delete this._fields.results;
        delete this._fields.useragent;
        delete this._fields.timestamp;
        
        if (arguments[1] !== false){
            this._form.submit();
        }
    
    }

};
YAHOO.register("yuitest", YAHOO.tool.TestRunner, {version: "2.8.0r4", build: "2446"});
