require('lazy-ass');
var check = require('check-more-types');
var path = require('path');
var Module = require('module');
// console.log(Module);

// console.log(Module._load.toString());

// console.log('Module.load');
// console.log(new Module('./test/foo', this).load.toString());

// console.log('require');
// console.log(Module.prototype.require)

var _require = Module.prototype.require;
la(check.fn(_require), 'cannot find global require');

function shouldBustCache(options) {
  // allow aliases to bust cache
  return check.object(options) &&
    (!options.cache || !options.cached || options.bust || options.bustCache);
}

Module.prototype.require = function reallyNeedRequire(name, options) {
  console.log('require', arguments);
  console.log('called from file', this.filename);

  la(check.unemptyString(name), 'expected module name', arguments);
  la(check.unemptyString(this.filename), 'expected called from module to have filename', this);
  var nameToLoad = Module._resolveFilename(name, this);

  if (check.object(options)) {

    if (shouldBustCache(options)) {
      console.log('deleting before require', name);
      delete require.cache[nameToLoad];
    }
  }

  console.log('calling _require', nameToLoad);
  var result = _require.call(this, nameToLoad);
  console.log('_require result', result);
  return result;
};

module.exports = Module.prototype.require.bind(module.parent);
