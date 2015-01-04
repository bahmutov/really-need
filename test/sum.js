// a and b will be passed on require call
console.assert(typeof a !== 'undefined', 'missing a');
console.assert(typeof b !== 'undefined', 'missing b');
module.exports = a + b;
