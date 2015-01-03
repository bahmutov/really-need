require = require('..');

var postCalled;

var loaded = require('./foo', {
  debug: true,
  post: function testPost(exported, filename) {
    console.assert(typeof exported === 'function', 'expected function from\n' + filename);
    console.assert(typeof filename === 'string', 'expected filename\n' + filename);
    postCalled = true;

    console.log('post', filename);
    // replace exported function with new function
    return function () {
      return 'bar';
    };
  }
});

console.assert(postCalled, 'post was not called');
console.assert(typeof loaded === 'function', 'should have returned a function');
console.assert(loaded() === 'bar', 'function returned wrong result');
