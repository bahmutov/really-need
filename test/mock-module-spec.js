describe('mocking a module', function () {
  require = require('..');
  var foo;

  beforeEach(function () {
    foo = require('./foo', {
      debug: true,
      post: function (exported) {
        console.log('changing foo exports');
        return function mockFoo() {
          return 'bar';
        };
      }
    });
  });

  it('loads module foo', function () {
    console.assert(typeof foo === 'function');
  });

  it('mocked foo returns "bar"', function () {
    console.assert(foo() === 'bar', foo());
  });

  it('works even if some other module requires ./foo', function () {
    require('./foo-returns-bar');
  });
});
