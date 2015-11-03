var fakeFilename = './does-not-exist';
var existsFirst = require('./loads-first');
console.assert(!existsFirst(fakeFilename));

var fs = require('fs');
fs.existsSync = function mockExistsSync(name) {
  console.log('mock exists sync returns true for %s', name);
  return true;
};

console.assert(existsFirst(fakeFilename));
