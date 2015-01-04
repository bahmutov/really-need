var n1 = require('./random');
console.log('first random', n1);

var n2 = require('./random');
console.log('second random', n2);

var n3 = require('./random');
console.log('third random', n3);

console.assert(n1 === n2 && n2 === n3, 'first 3 numbers should be equal');

require = require('../index');
console.assert(typeof require === 'function', 'expected require to be a function');
console.log('got back require', require);

// var a = require('./random');
//console.log('a random number', a);

var k1 = require('./random', { bust: true, debug: true });
console.log('first random', k1);

var k2 = require('./random');
console.log('second random', k2);

var k3 = require('./random');
console.log('third random', k3);

console.assert(k1 !== n3, 'new number was generated because cache was busted');
console.assert(k1 === k2 && k2 === k3, 'new 3 numbers are the same');
