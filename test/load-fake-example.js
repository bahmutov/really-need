require = require('..');
var loaded = require(process.cwd() + '/example.json', {
  fake: { version: '1.2.3' }
});
console.log('loaded fake example', loaded);
console.assert(loaded, 'missing loaded object');
