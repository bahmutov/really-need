describe('original require', function () {
  it('is a function', function () {
    console.assert(typeof require === 'function');
  });

  it('has cache', function () {
    console.assert(typeof require.cache === 'object');
  });
});

describe('patched require', function () {
  var need = require('..');

  it('is still a function', function () {
    console.assert(typeof require === 'function');
  });

  it('has cache', function () {
    console.assert(typeof need.cache === 'object');
  });
});
