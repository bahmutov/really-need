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

[paranoid]: http://glebbahmutov.com/blog/paranoid-coding/
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

## Inject values into the script on load

After the source for the module has been loaded and transformed using `pre` function, the `Module` compiles
it into the exported value. You can inject extra variables using `args` property. For example, we
can pass values to be added

```js
// sum.js
module.exports = a + b;
// index.js
require = require('really-need');
var sum = require('./sum', {
  args: {
    a: 10,
    b: 2
  }
});
console.log(sum);
// output 12
```

Notice that variables `a` and `b` are not declared in `sum.js`. Usually this means a `ReferenceError`, but
we are injecting values at load time. We could have done similar thing using `pre` callback, but using `args`
is simpler and does not replace any existing source transformations.

You can even mess with built-in variables. When `Module` compiles the source, it wraps the loaded source
into a function call. Print the `module` object from Node REPL to see before / after text

```js
require('module');
wrapper: 
 [ '(function (exports, require, module, __filename, __dirname) { ',
   '\n});' ],
```
Because we are appending `args` directly to the loaded source, they take precedence. Thus we can do things like
overwriting `__filename`.

```js
// filename.js
console.log('filename', __filename);
// index.js
require = require('really-need');
require('./filename', {
  args: {
    __filename: 'hi there'
  }
});
// prints filename hi there
```

We can even disable all calls to `require` from the given script

```js
// another-require.js
require('something');
// index.js
require = require('really-need');
require('./another-require', {
  args: {
    require: function (name) {
      console.log('no requires allowed');
    }
  }
});
// prints "no requires allowed"
```

## Determine if a module was really used

Read the blog post [Was NodeJS module used](http://glebbahmutov.com/blog/was-nodejs-module-used/) 
and see the project [was-it-used](https://github.com/bahmutov/was-it-used).
