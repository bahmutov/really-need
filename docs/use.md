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

## Advanced mocking of environment during testing

Sometimes our end to end testing scenario requires using an external service,
like hitting Github API. Usually this runs into the throttling limit pretty quickly,
generating a response like this

    {
      "message":"API rate limit exceeded for 52.0.240.122.
      (But here's the good news: Authenticated requests get a higher rate limit.
      Check out the documentation for more details.)",
      "documentation_url":"https://developer.github.com/v3/#rate-limiting"
    }

We like to be able to test the entire program though, so how do we mock the API in this case?

As an example, take a look at [changed-log](https://github.com/bahmutov/changed-log).
It shows the commit messages for any NPM package or Github repo between specific versions.
One can install and run `changed-log` like this

    npm install -g changed-log
    changed-log chalk 0.3.0 0.5.1

During testing I like to run the above command to make sure it works. Thus I defined
a script in the `package.json`

    "scripts": {
      "chalk": "node bin/changed-log.js chalk 0.3.0 0.5.1"
    }

During the program's run, the Github api is hit twice: first to collect the commit ids
between the two given versions, and then to collect the actual commit messages.

First, I collected the JSON response from the API as received inside the source files
`changed-log/src/get-commits-from-tags.js` and `changed-log/src/get-commits-between.js`.
I saved these objects as plain JSON files in a folder
[changed-log/mocks](https://github.com/bahmutov/changed-log/tree/master/mocks).

Second, I wrote a new source file that will mock the above two methods to return the
JSON from the files. Take a look at [changed-log/mocks/mock-for-chalk.js][mock-for-chalk.js].
This file sets the mock functions to be loaded into the module cache.

```js
// load mock data
var Promise = require('bluebird');
var mockCommits = require('./mock-chalk-ids.json');
var mockComments = require('./mock-chalk-comments.json');
// grab a better require
require = require('really-need');
// prepare the mock functions to be plugged in
function mockGetCommitsFromTags(info) {
  return Promise.resolve(mockCommits);
}
function mockGetComments(info) {
  return Promise.resolve(mockComments);
}
// finally, place the mock functions into module cache
require('../src/get-commits-from-tags', {
  post: function (exported, filename) {
    return mockGetCommitsFromTags;
  }
});
require('../src/get-commits-between', {
  post: function (exported, filename) {
    return mockGetComments;
  }
});
// to be continued ...
```

This is how we run the `chalk` command with the mocked environment. We will run
the `mock-for-chalk.js` and let it load the normal `bin/changed-log.js`. Thus the test
script is now the following command

    "scripts": {
      "chalk-with-mock": "node mocks/mock-for-chalk.js bin/changed-log.js chalk 0.3.0 0.5.1",
    }

The `mock-for-chalk.js` continues after cache mocking

```js
// same mock as above
(function adjustProcessArgs() {
  process.argv.splice(1, 1);
  console.log('removed this filename from process arguments');
  process.argv[1] = require('path').resolve(process.argv[1]);
  console.log('resolved the name of the next script to load');
}());
console.log('loading the real script from %s', process.argv[1]);
require(process.argv[1]);
```

After mocking we adjust the program's arguments array and let the actual program take over,
as it was the original script. Mission accomplished - end to end testing, but with
mocked code and data.

[mock-for-chalk.js]: https://github.com/bahmutov/changed-log/blob/master/mocks/mock-for-chalk.js

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

## Unit test private variables / functions

You can quickly load / access most private functions and variables, see
[describe-it](https://github.com/bahmutov/describe-it) project for details

```js
// get-foo.js
(function reallyPrivate() {
  function getFoo() {
    return 'foo';
  }
}());
```

Notice that `getFoo` is not exported from the file, thus only can be tested indirectly. Or is it?

```js
// get-foo-spec.js
var describeIt = require('describe-it');
describeIt(__dirname + '/foo.js', 'getFoo()', function (getFn) {
  it('returns "foo"', function () {
    var getFoo = getFn();
    console.assert(getFoo() === 'foo');
  });
});
```

Custom loader with source modification makes it simple to gain access to any desired
function declaration, functional expression and even most variables.
