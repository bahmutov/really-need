require('lazy-ass');
var check = require('check-more-types');
var path = require('path');
var Module = require('module');
var runInNewContext = require('vm').runInNewContext;
var runInThisContext = require('vm').runInThisContext;

var _require = Module.prototype.require;
la(check.fn(_require), 'cannot find module require');
var _compile = Module.prototype._compile;
la(check.fn(_compile), 'cannot find module _compile');

function shouldBustCache(options) {
  // allow aliases to bust cache
  return check.object(options) &&
    (!options.cache || !options.cached || options.bust || options.bustCache);
}

function noop() {}

function logger(options) {
  return check.object(options) &&
    (options.debug || options.verbose) ? console.log : noop;
}

Module.prototype.require = function reallyNeedRequire(name, options) {
  var log = logger(options);
  log('really-need', arguments);
  log('called from file', this.filename);

  la(check.unemptyString(name), 'expected module name', arguments);
  la(check.unemptyString(this.filename), 'expected called from module to have filename', this);
  var nameToLoad = Module._resolveFilename(name, this);

  if (check.object(options)) {
    if (shouldBustCache(options)) {
      log('deleting from cache before require', name);
      delete require.cache[nameToLoad];
    }
  }

  log('calling _require', nameToLoad);

  var result = _require.call(this, nameToLoad);
  log('_require result', result);
  return result;
};

// see Module.prototype._compile in
// https://github.com/joyent/node/blob/master/lib/module.js
var _compileStr = _compile.toString();
_compileStr = _compileStr.replace('self.require(path);', 'self.require.apply(self, arguments);');

var patchedCompile = eval('(' + _compileStr + ')');

Module.prototype._compile = function(content, filename) {
  return patchedCompile.call(this, content, filename);
};

module.exports = Module.prototype.require.bind(module.parent);

