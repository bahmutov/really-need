require = require('..');
var path = require('path');
console.assert(path, 'need path object');

if (path.isAbsolute) {
  console.assert(path.isAbsolute(__filename));
}

var resolved = path.resolve(__filename);
console.assert(resolved === __filename, 'full __filename');

require('path', {
  debug: true,
  cache: false
});
