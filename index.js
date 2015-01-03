'use strict';

require('lazy-ass');
var check = require('check-more-types');
var Module = require('module');

// these variables are needed inside eval _compile
/* jshint -W098 */
var runInNewContext = require('vm').runInNewContext;
var runInThisContext = require('vm').runInThisContext;
var path = require('path');

var _require = Module.prototype.require;
la(check.fn(_require), 'cannot find module require');
var _compile = Module.prototype._compile;
la(check.fn(_compile), 'cannot find module _compile');

function shouldBustCache(options) {
  // allow aliases to bust cache
  return check.object(options) &&
    ((check.has(options, 'cache') && !options.cache) ||
      (check.has(options, 'cached') && !options.cached) ||
      options.bust || options.bustCache);
}

function noop() {}

function logger(options) {
  return check.object(options) &&
    (options.debug || options.verbose) ? console.log : noop;
}

function load(transform, module, filename) {
  la(check.fn(transform), 'expected transform function');
  la(check.object(module), 'expected module');
  la(check.unemptyString(filename), 'expected filename', filename);

  var fs = require('fs');
  var source = fs.readFileSync(filename, 'utf8');
  var ret = transform(source, filename);
  if (typeof ret === 'string') {
    module._compile(ret, filename);
  } else {
    console.error('transforming source from', filename, 'has not returned a string');
    module._compile(source, filename);
  }
}

// options by filename
var tempOptions = {};

Module.prototype.require = function reallyNeedRequire(name, options) {
  options = options || {};

  var log = logger(options);
  log('really-need', arguments);
  log('called from file', this.filename);

  la(check.unemptyString(name), 'expected module name', arguments);
  la(check.unemptyString(this.filename), 'expected called from module to have filename', this);
  var nameToLoad = Module._resolveFilename(name, this);
  tempOptions[nameToLoad] = options;

  if (shouldBustCache(options)) {
    log('deleting from cache before require', name);
    delete require.cache[nameToLoad];
  }

  log('calling _require', nameToLoad);

  var extension = '.js';
  var prevPre = Module._extensions[extension];
  if (check.fn(options.pre)) {
    log('using pre- function' + (options.pre.name ? ' ' + options.pre.name : ''));
    Module._extensions[extension] = load.bind(null, options.pre);
  }

  var result = _require.call(this, nameToLoad);
  log('_require result', result);

  if (check.fn(options.pre)) {
    Module._extensions[extension] = prevPre;
  }

  return result;
};

// see Module.prototype._compile in
// https://github.com/joyent/node/blob/master/lib/module.js
var _compileStr = _compile.toString();
_compileStr = _compileStr.replace('self.require(path);', 'self.require.apply(self, arguments);');

/* jshint -W061 */
var patchedCompile = eval('(' + _compileStr + ')');

Module.prototype._compile = function (content, filename) {
  var result = patchedCompile.call(this, content, filename);
  var options = tempOptions[filename];
  if (options && check.fn(options.post)) {
    var log = logger(options);
    log('transforming result' + (options.post.name ? ' ' + options.post.name : ''));

    var transformed = options.post(this.exports, filename);
    if (typeof transformed !== 'undefined') {
      log('transform function returned undefined, using original result');
      this.exports = transformed;
    }
  }
  return result;
};

module.exports = Module.prototype.require.bind(module.parent);
