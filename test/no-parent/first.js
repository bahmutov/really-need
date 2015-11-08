require = require('../../index');
console.log('first module loading second module');
// use pre- and parent options together
require('./second', {
  pre: function () {},
  parent: undefined
});

// use just parent option
require('./second', {
  bust: true,
  parent: undefined,
  verbose: false
});

// parent can be anything really
require('./parent-should-be-foo', {
  parent: {
    filename: 'foo'
  }
});
