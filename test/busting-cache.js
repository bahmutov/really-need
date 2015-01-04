var foo = require('./foo');

// get new, improved require
require = require('../index');

// get NEW instance from ./foo.js
console.log('Get NEW instance from ./foo.js');
var foo3 = require('./foo', { bust: true });
console.assert(typeof foo3 === 'function', 'expected foo function');
console.assert(foo3() === 'foo', 'foo should return "foo"');

console.assert(foo !== foo3, 'returned different instance');
