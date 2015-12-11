var la = require('lazy-ass');
var is = require('check-more-types');
var basename = require('path').basename;
require = require('..');

(function testFakeObject() {
  var fakeObject = {foo: 42};

  function verifyFilename(filename) {
    la(basename(filename) === 'does-not-exist-object.json',
      'different filename', filename);
  }

  function verifyLoaded(loaded) {
    la(is.object(loaded), 'loaded not an object', loaded);
    la(loaded.foo === 42, 'wrong foo value', loaded);
  }

  var loadFilename = './does-not-exist-object.json';

  var loaded = require(loadFilename, {
    verbose: true,
    fake: fakeObject,
    post: function (o, filename) {
      la(is.object(o), 'expected an object', o);
      verifyFilename(filename);
      la(o.foo === 42, 'invalid object', o);
      return o;
    }
  });
  verifyLoaded(loaded);

  // try loading the fake file again without any flags
  var loaded2 = require(loadFilename);
  verifyLoaded(loaded2);
}());

(function testFakeFn() {
  function fake() {
    return 42;
  }

  function verifyFilename(filename) {
    la(basename(filename) === 'does-not-exist-fn.json',
      'different filename', filename);
  }

  function verifyLoaded(loaded) {
    la(is.fn(loaded), 'loaded not a function', loaded);
    la(loaded() === 42, 'wrong returned value', loaded);
  }

  var loadFilename = './does-not-exist-fn.json';

  var loaded = require(loadFilename, {
    verbose: true,
    fake: fake,
    post: function (o, filename) {
      la(is.fn(o), 'expected a function', o);
      verifyFilename(filename);
      la(o() === 42, 'invalid returned value', o);
      return o;
    }
  });
  verifyLoaded(loaded);

  // try loading the fake file again without any flags
  var loaded2 = require(loadFilename);
  verifyLoaded(loaded2);
}());

