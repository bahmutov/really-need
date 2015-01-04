# Use

## Instrument code on load

One can instrument the loaded JavaScript file to collect the code coverage information. 
I am using the excellent [istanbul][istanbul] library in the example below.

```js
var istanbul = require('istanbul');
var instrumenter = new istanbul.Instrumenter();
var instrument = instrumenter.instrumentSync.bind(instrumenter);
require = require('really-need');
var foo = require('./foo', {
  bust: true, // make sure to load foo.js again
  pre: instrument // signatures for post and instrument match exactly
});
console.log(foo());
console.log(foo());
console.log(foo());
// how many times did foo run?
var fooFilename = require('path').resolve('./foo.js');
console.log('function in foo.js ran', __coverage__[fooFilename].f[1], 'times');
// or you can generate detailed reports
```

output

    foo
    foo
    foo
    function in foo.js ran 3 times

[istanbul]: https://www.npmjs.com/package/istanbul

## Mock user module during testing

Require a user module during the suite setup, then modify the module's exports in the `post` function.
Any module loaded afterwards that requires the mocked module will get the mock value.

```js
// foo.js
module.exports = function () { return 'foo'; }
// foo-spec.js
describe('mocking a module', function () {
  require = require('really-need');
  var foo;
  beforeEach(function () {
    foo = require('./foo', {
      debug: true,
      post: function (exported) {
        // return anything you want.
        return function mockFoo() {
          return 'bar';
        };
      }
    });
  });
  it('mocked foo returns "bar"', function () {
    console.assert(foo() === 'bar', foo());
  });
  it.only('works even if some other module requires ./foo', function () {
    require('./foo-returns-bar');
  });
});
// foo-returns-bar.js
var foo = require('./foo');
console.assert(foo() === 'bar', 'OMG, ./foo.js was mocked!');
```
