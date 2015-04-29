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
  la(check.object(options), 'missing options object', options);

  // allow aliases to bust cache
  return options.bust || options.bustCache;
}

function shouldFreeWhenDone(options) {
  la(check.object(options), 'missing options object', options);

  return ((check.has(options, 'keep') && !options.keep) ||
    (check.has(options, 'cache') && !options.cache));
}

function noop() {}

function logger(options) {
  return check.object(options) &&
    (options.debug || options.verbose) ? console.log : noop;
}

function argsToDeclaration(args) {
  la(check.object(args), 'expected args object', args);
  var names = Object.keys(args);
  return names.map(function (name) {
    var val = args[name];
    var value = check.fn(val) ? val.toString() : JSON.stringify(val);
    return 'var ' + name + ' = ' + value + ';';
  }).join('\n') + '\n';
}

function load(transform, module, filename) {
  la(check.fn(transform), 'expected transform function');
  la(check.object(module), 'expected module');
  la(check.unemptyString(filename), 'expected filename', filename);

  var fs = require('fs');
  var source = fs.readFileSync(filename, 'utf8');
  var transformed = transform(source, filename);
  if (check.string(transformed)) {
    module._compile(transformed, filename);
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

  if (shouldFreeWhenDone(options)) {
    log('deleting from cache after loading', name);
    delete require.cache[nameToLoad];
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
  var options = tempOptions[filename] || {};
  var log = logger(options);

  if (check.has(options, 'args') && check.object(options.args)) {
    log('injecting arguments', Object.keys(options.args).join(','), 'into', filename);
    var added = argsToDeclaration(options.args);
    content = added + content;
  }

  var result = patchedCompile.call(this, content, filename);

  if (check.fn(options.post)) {
    log('transforming result' + (options.post.name ? ' ' + options.post.name : ''));

    var transformed = options.post(this.exports, filename);
    if (typeof transformed !== 'undefined') {
      log('transform function returned undefined, using original result');
      this.exports = transformed;
    }
  }

  if (shouldFreeWhenDone(options)) {
    log('deleting from cache after loading', filename);
    delete require.cache[filename];
  }
  return result;
};

var need = Module.prototype.require.bind(module.parent);
need.cache = require.cache;
module.exports = need;
