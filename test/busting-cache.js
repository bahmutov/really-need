var foo = require('./foo');

// get new, improved require
require = require('../index');

// get NEW instance from ./foo.js
console.log('Get NEW instance from ./foo.js');
var foo3 = require('./foo', { bust: true });
console.assert(typeof foo3 === 'function', 'expected foo function');
console.assert(foo3() === 'foo', 'foo should return "foo"');

console.assert(foo !== foo3, 'returned different instance');

var foo4 = require('./foo', {
  keep: false,
  debug: true
});
console.assert(foo3 === foo4, 'same foo returned again');
// the returned instance is not cached, so next time it will load fresh instance

var foo5 = require('./foo');
console.assert(foo4 !== foo5, 'got new instance');
