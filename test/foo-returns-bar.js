console.log('loading', __filename);
var foo = require('./foo');
console.log('loaded ./foo returns\n' + foo.toString());

// foo should be mocked, and returns "bar"
console.assert(typeof foo === 'function', 'foo is a function');
console.assert(foo() === 'bar', 'mocked foo returns "bar"');
