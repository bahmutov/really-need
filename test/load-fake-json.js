var la = require('lazy-ass');
var is = require('check-more-types');
var basename = require('path').basename;
require = require('..');

/*
  One cannot simple
    require.cache['fake filename'] = whatever
  and expect the calls to
    require('fake filename')
  to work. Must use our patched require with "fake" property
*/

(function testFakeString() {
  var fakeSource = '{ "foo": 42 }';

  function verifyFilename(filename) {
    la(basename(filename) === 'does-not-exist.json',
      'different filename', filename);
  }

  function verifyLoaded(loaded) {
    la(is.object(loaded), 'loaded not an object', loaded);
    la(loaded.foo === 42, 'wrong foo value', loaded);
  }

  var loadFilename = './does-not-exist.json';

  var loaded = require(loadFilename, {
    verbose: true,
    fake: fakeSource,
    pre: function (source, filename) {
      la(source === fakeSource, 'different source', source);
      verifyFilename(filename);
    },
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
