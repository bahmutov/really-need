var la = require('lazy-ass');
var is = require('check-more-types');
var basename = require('path').basename;
require = require('..');

var fakeSource = 'module.exports = { foo: 42 }';

function verifyFilename(filename) {
  la(basename(filename) === 'does-not-exist.js',
    'different filename', filename);
}

var loaded = require('./does-not-exist.js', {
  verbose: true,
  fake: fakeSource,
  pre: function (source, filename) {
    la(source === fakeSource, 'different source', source);
    verifyFilename(filename);
  },
  post: function postFake(o, filename) {
    la(is.object(o), 'expected an object', o);
    verifyFilename(filename);
    la(o.foo === 42, 'invalid object', o);
    return o;
  }
});

la(is.object(loaded), 'loaded not an object', loaded);
la(loaded.foo === 42, 'wrong foo value', loaded);
