var foo = require('./foo');
console.log(foo);
// { foo: 'foo' }

require('./nested');
foo.bar = 'bar';
