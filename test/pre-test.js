require = require('..');

var preCalled;

var loaded = require('./foo', {
  debug: true,
  pre: function testPre(src, filename) {
    console.assert(typeof src === 'string', 'expected string source\n' + src);
    console.assert(typeof filename === 'string', 'expected filename\n' + filename);
    preCalled = true;

    console.log('pre', filename);
    // completely replace loaded source
    return 'module.exports = "bar"';
  }
});

console.assert(preCalled, 'pre was not called');
console.assert(loaded === 'bar', 'loaded result');
