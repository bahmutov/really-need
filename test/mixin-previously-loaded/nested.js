setTimeout(function () {
  var foo = require('./foo');
  console.log('in nested');
  console.log(foo);
  // { foo: 'foo', bar: 'bar' }
}, 1000);
