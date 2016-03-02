'use strict';

var la = require('lazy-ass');
var check = require('check-more-types');
var Module = require('module');

// these variables are needed inside eval _compile
/* jshint -W098 */
var runInNewContext = require('vm').runInNewContext;
var runInThisContext = require('vm').runInThisContext;
var path = require('path');
var shebangRe = /^\#\!.*/;

var _require = Module.prototype.require;
la(check.fn(_require), 'cannot find module require');
var _compile = Module.prototype._compile;
la(check.fn(_compile), 'cannot find module _compile');

// options for the patching
var patchOptions = {
  printWrappedCode: false
};
// options by filename
var tempOptions = {};

function isJson(filename) {
  return /\.json$/.test(filename);
}

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

  var options = tempOptions[filename] || {};

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

function loadFakeModule(options, filename) {
  var log = logger(options);
  log('loading fake module');

  var source = options.fake;

  if (check.string(source)) {
    la(check.unemptyString(source),
      'expected fake source', source, 'in', options);

    var transformed = source;
    if (check.fn(options.pre)) {
      transformed = options.pre(source, filename);
      if (!transformed) {
        transformed = source;
      }
    }
    if (isJson(filename)) {
      return JSON.parse(transformed);
    }

    module._compile(transformed, filename);
    return module.exports;
  } else {
    var posted = options.fake;
    if (check.fn(options.post)) {
      posted = options.post(posted, filename);
      if (typeof posted !== 'undefined') {
        return posted;
      }
    }
    return options.fake;
  }

}

function loadRealModule(options, filename, self) {
  var log = logger(options);
  log('calling _require', filename);

  var extension = '.js';
  var prevPre = Module._extensions[extension];
  if (check.fn(options.pre)) {
    log('using pre- function' + (options.pre.name ? ' ' + options.pre.name : ''));
    Module._extensions[extension] = load.bind(null, options.pre);
  }

  var parent = options.hasOwnProperty('parent') ? options.parent : self;
  if (parent && !parent.paths) {
    la(check.object(parent), 'expected a parent object', parent);
    parent.paths = self.paths;
  }

  var result = Module._load(filename, parent);
  log('_require result', result);

  if (check.fn(options.pre)) {
    Module._extensions[extension] = prevPre;
  }
  return result;
}

Module.prototype.require = function reallyNeedRequire(name, options) {
  options = options || {};

  var log = logger(options);
  log('really-need', arguments);
  log('called from file', this.filename);

  la(check.unemptyString(name), 'expected module name', arguments);
  la(check.unemptyString(this.filename), 'expected called from module to have filename', this);

  var nameToLoad;
  if (check.has(options, 'fake')) {
    nameToLoad = path.resolve(process.cwd(), name);
  } else {
    try {
      nameToLoad = Module._resolveFilename(name, this);
    } catch (err) {
      nameToLoad = path.resolve(process.cwd(), name);
      if (!require.cache[nameToLoad]) {
        throw err;
      }
      log('using cached module', nameToLoad);
    }
  }
  log('full name to load', nameToLoad);
  tempOptions[nameToLoad] = options;

  if (shouldBustCache(options)) {
    log('deleting from cache before require', name);
    delete require.cache[nameToLoad];
  }

  var result;

  if (check.has(options, 'fake')) {
    result = loadFakeModule(options, nameToLoad);
    require.cache[nameToLoad] = result;
  } else {
    try {
      result = loadRealModule(options, nameToLoad, this);
    } catch (err) {
      if (!require.cache[nameToLoad]) {
        throw err;
      }
      result = require.cache[nameToLoad];
    }
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

if (patchOptions.printWrappedCode) {
  (function printCompileResult() {
    var wrapper = 'var wrapper = Module.wrap(content);\n';
    var printWrapped = 'console.log(wrapper);';
    var wrapperIndex = _compileStr.indexOf(wrapper);
    if (wrapperIndex) {
      wrapperIndex += wrapper.length;
      _compileStr = _compileStr.substr(0, wrapperIndex) +
        printWrapped +
        _compileStr.substr(wrapperIndex);
    }
    console.log('compiled and print wrapped');
    console.log(_compileStr);
  }());
}

// console.log('patched compile code');
// console.log(_compileStr);
/* jshint -W061 */
var patchedCompile;
var _compileStrExpr = '(' + _compileStr + ')';

if (global.v8debug) {
  _compileStrExpr = 'var resolvedArgv;\n' + _compileStrExpr;
}

try {
  patchedCompile = eval(_compileStrExpr);
} catch (err) {
  console.error('Problem evaluating the new compile');
  console.error(err.message);
  console.error(err.stack);
}

Module.prototype._compile = function (content, filename) {
  var options = tempOptions[filename] || {};
  var log = logger(options);

  if (check.has(options, 'args') && check.object(options.args)) {
    log('injecting arguments', Object.keys(options.args).join(','), 'into', filename);
    var added = argsToDeclaration(options.args);
    content = added + content;
  }

  var result;
  try {
    log('compiling', filename);
    log(content);
    result = patchedCompile.call(this, content, filename);
  } catch (err) {
    console.error('patched compile has crashed');
    console.error(err.message);
    console.error(err.stack);
    console.error('the patched compile source');
    console.error(_compileStr);
    console.error('died while processing content in', filename);
    console.error(content);
  }

  if (check.fn(options.post)) {
    log('transforming result' + (options.post.name ? ' ' + options.post.name : ''));

    var transformed = options.post(this.exports, filename);
    if (typeof transformed !== 'undefined') {
      log('transform function returned something');
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
