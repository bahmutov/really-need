require = require('..');
var sum = require('./sum', {
  debug: true,
  args: {
    a: 10,
    b: 2
  },
  pre: function (source) {
    console.log('loading sum source\n' + source);
  }
});
console.assert(sum === 12, 'could not compute sum of a and b');
