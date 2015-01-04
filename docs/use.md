# Use

## Load a different module

I love [defensive programming][paranoid] and write a lot of assertions when programming.
My favorite predicate and type checking library is [check-types][check-types]. It was missing
a few checks we needed, so we wrote and open sourced a library [check-more-types][check-more-types].
Typically, one needs to require `check-more-type` in any place where `check-types` is used to get
our library. This means a lot of code editions to make. 

We can use `really-need` to load `check-more-types` instead of `check-types`. Just include
this code in the beginning of the application to place `check-more-types` in the cache.

```js
require = require('really-need');
require('check-types', {
  post: function () {
    return require('check-more-types');
  }
});
// any code later will get check-more-type
var check = require('check-types');
console.log('check.bit(1) =', check.bit(1));
// check.bit(1) = true
```

[paranoid]: http://bahmutov.calepin.co/paranoid-coding.html
[check-types]: https://github.com/philbooth/check-types.js
[check-more-types]: https://github.com/kensho/check-more-types

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
