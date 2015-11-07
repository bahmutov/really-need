require = require('../../index');
console.log('first module loading second module');
require('./second', {
  pre: function () {},
  parent: undefined
});
