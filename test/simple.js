console.assert(require.length === 1, 'only takes in module id');
var _require = require;

require('../index');
console.log('loaded really-need 1');
console.assert(require === _require, 'require is still old require');

var foo = require('./foo');
console.log('require foo');
console.assert(typeof foo === 'function', 'expected foo function');
console.assert(foo() === 'foo', 'foo should return "foo"');

// get new, improved require
require = require('../index');
console.log('loaded really-need 2');
console.assert(require !== _require);

var foo2 = require('./foo', { verbose: true });
console.log('loaded foo2');
console.assert(typeof foo2 === 'function', 'expected foo function');
console.assert(foo2() === 'foo', 'foo should return "foo"');

console.assert(foo === foo2, 'require returned cached result');
