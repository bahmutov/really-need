require = require('..');
console.assert(require.length === 2,
  'expected require to have 2 arguments');
var foo = require('./nested-b', {
  cache: false
});
console.assert(foo === 'foo', 'expected foo string');
