# really-need

> Node require wrapper with options for cache busting, pre- and post-processing

[![NPM][really-need-icon] ][really-need-url]

[![Build status][really-need-ci-image] ][really-need-ci-url]
[![dependencies][really-need-dependencies-image] ][really-need-dependencies-url]
[![devdependencies][really-need-devdependencies-image] ][really-need-devdependencies-url]
[![semantic-release][semantic-image] ][semantic-url]
[![manpm](https://img.shields.io/badge/manpm-%E2%9C%93-3399ff.svg)](https://github.com/bahmutov/manpm)

[really-need-icon]: https://nodei.co/npm/really-need.png?downloads=true
[really-need-url]: https://npmjs.org/package/really-need
[really-need-ci-image]: https://travis-ci.org/bahmutov/really-need.png?branch=master
[really-need-ci-url]: https://travis-ci.org/bahmutov/really-need
[really-need-dependencies-image]: https://david-dm.org/bahmutov/really-need.png
[really-need-dependencies-url]: https://david-dm.org/bahmutov/really-need
[really-need-devdependencies-image]: https://david-dm.org/bahmutov/really-need/dev-status.png
[really-need-devdependencies-url]: https://david-dm.org/bahmutov/really-need#info=devDependencies
[semantic-image]: https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg
[semantic-url]: https://github.com/semantic-release/semantic-release


First call to `require('really-need')` replaced `Module.prototype.require` with a better version.
Other modules can use new `require` directly. The module making the call to `really-need` needs
to use the returned value.

```js
require = require('really-need');
// global require is now a better one!
// evaluate foo.js again, busting the cache
var foo = require('./foo', {
    // remove previously loaded foo module
    bustCache: true,
    // remove from cache AFTER loading
    keep: false,
    // skip the real or non-existent file and just use fake source
    // fake can also be a JavaScript value, object or function
    fake: 'fake source goes here',
    pre: function (source, filename) {
        // transform the source before compiling it
        return source;
    },
    post: function (exported, filename) {
        // transform the exported object / value from the file
        return exported;
    },
    // inject additional values into foo.js
    args: {
        a: 10,
        b: 5,
        __dirname: '/some/path'
    }
});
```


### API

The `require` function provided by `really-need` takes a second argument: an options object.

#### bust

Removes the previously cached module before loading.
Equivalent to loading and compiling the JavaScript again.
Alias *bustCache*, default `false`.

#### keep

Deletes loaded instance from the cache after loading to make sure the next `require` call loads
it again. Alias *cache*, default `false`.

#### pre

Gives you a chance to transform the loaded source before compiling it. Can be used to instrument the loaded code,
compile other languages into JavaScript, etc. See the related project [node-hook][node-hook] and
read [Hooking into Node loader for fun and profit][hooking].

```js
// foo.js
module.exports = function() { return 'foo'; };
// index.js
require = require('really-need');
require('./foo', {
    pre: function (source, filename) {
        return 'console.log("loading ' + filename + '");\n' + source;
    }
});
// loading /path/to/foo.js
```

[node-hook]: https://github.com/bahmutov/node-hook
[hooking]: http://glebbahmutov.com/blog/hooking-into-node-loader-for-fun-and-profit/

#### post

Function to transform the module's exported value. For example, you can replace the exported function with
another one on the fly.

```js
// foo.js
module.exports = function() { return 'foo'; };
// index.js
require = require('really-need');
var foo = require('./foo', {
    post: function (exported, filename) {
        return function () { return 'bar'; }
    }
});
console.log(foo()); // "bar"
```

#### parent

You can set the parent module to be `undefined` or a mock object. For example, to load
a module, but make it think it has no parent

```js
require('./foo', {
  parent: undefined
});
```

You can use an object (not a plain string though) as a parent too

```js
require('./foo', {
  parent: {
    filename: 'ha/ha/mock.js'
  }
});
```

#### args

You can inject variables into the loaded module source. These variables will be declared at the top
of the module.

```js
require('./foo', {
    args: {
        a: 10,
        b: 20
    }
});
// foo.js will have var a = 10, b = 20; at the top.
```

Each value will stringified to JSON, functions will be copied as a string.

#### fake

You can load non-existing modules from JSON or JavaScript code. Both `pre` and `post` apply.

```js
require('./does-not-exist.json', {
  fake: '{ "foo": 42 }',
  pre: function (source, filename) { /* source is '{"foo": 42}' */ },
  post: function (o, filename) { /* o is {foo: 42} */ }
});
```

```js
require('./does-not-exist.js', {
  fake: 'module.exports = { foo: 42 }',
  pre: function (source, filename) { /* source is 'module.exports = {foo: 42}' */ },
  post: function (o, filename) { /* o is {foo: 42} */ }
});
```

You can even load fake value, without compiling it. The `post` hook still applies if needed

```js
var loaded = require('./does-not-exist.js', {
  fake: { foo: 42 },
  post: function (o, filename) { /* o is {foo: 42} */ }
})
// loaded is { foo: 42 }
```

See [Unit test using non-existent files](#unit-test-using-non-existent-files).

#### verbose

Print debug messages while loading. Alias *debug*, default `false`.


## Use examples

### Load a different module

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

You can see this in action when I work around a broken dependency twice removed from
my code in [manpm](https://github.com/bahmutov/manpm)
inside the [github url parsing][c].

[c]: https://github.com/bahmutov/manpm/blob/a713009fd068da4c99f354b70936ef5ccd3fe7e2/src/get-readme.js#L10

### Instrument code on load

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

### Mock user module during testing

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

### Advanced mocking of environment during testing

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

### Inject values into the script on load

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

### Determine if a module was really used

Read the blog post [Was NodeJS module used](http://glebbahmutov.com/blog/was-nodejs-module-used/)
and see the project [was-it-used](https://github.com/bahmutov/was-it-used).

### Unit test private variables / functions

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

### Unit test using non-existent files

Imagine a piece of code under test loads a file. You do not want to create a fake file
for every unit test. You can easily create fake modules before the code runs, letting it
load cached fake copy.

```js
// get-version.js
function getVersion() {
  var pkg = require(process.cwd() + '/example.json');
  return pkg.version;
}
module.exports = getVersion;
```

The unit test places the fake module into the require cache

```js
// get-version-spec.js
require = require('../..');
describe('get version', function () {
  var getVersion = require('./get-version');
  var loaded = require(process.cwd() + '/example.json', {
    fake: { version: '1.2.3' }
  });
  it('returns 1.2.3', function () {
    console.assert(getVersion() === '1.2.3');
  });
});
```


### How it works

Read [Hacking Node require](http://glebbahmutov.com/blog/hacking-node-require/)


### Small print

Author: Gleb Bahmutov &copy; 2014

* [@bahmutov](https://twitter.com/bahmutov)
* [glebbahmutov.com](http://glebbahmutov.com)
* [blog](http://glebbahmutov.com/blog)

License: MIT - do anything with the code, but don't blame me if it does not work.

Spread the word: tweet, star on github, etc.

Support: if you find any problems with this module, email / tweet /
[open issue](https://github.com/bahmutov/really-need/issues) on Github



## MIT License

The MIT License (MIT)

Copyright (c) 2015 Gleb Bahmutov

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.



