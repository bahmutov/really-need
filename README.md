# really-need v1.4.0

> Node require wrapper with options for cache busting, pre- and post-processing

[![NPM][really-need-icon] ][really-need-url]

[![Build status][really-need-ci-image] ][really-need-ci-url]
[![dependencies][really-need-dependencies-image] ][really-need-dependencies-url]
[![devdependencies][really-need-devdependencies-image] ][really-need-devdependencies-url]

[really-need-icon]: https://nodei.co/npm/really-need.png?downloads=true
[really-need-url]: https://npmjs.org/package/really-need
[really-need-ci-image]: https://travis-ci.org/bahmutov/really-need.png?branch=master
[really-need-ci-url]: https://travis-ci.org/bahmutov/really-need
[really-need-dependencies-image]: https://david-dm.org/bahmutov/really-need.png
[really-need-dependencies-url]: https://david-dm.org/bahmutov/really-need
[really-need-devdependencies-image]: https://david-dm.org/bahmutov/really-need/dev-status.png
[really-need-devdependencies-url]: https://david-dm.org/bahmutov/really-need#info=devDependencies


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
    cache: false,
    pre: function (source, filename) {
        // transform the source before compiling it
        return source;
    },
    post: function (exported, filename) {
        // transform the exported object / value from the file
        return exported;
    }
});
```


### API

The `require` function provided by `really-need` takes a second argument: an options object. 

#### bust

Removes the previously cached module before loading. 
Equivalent to loading and compiling the JavaScript again.
Alias *bustCache*, default `false`.

#### cache

Deletes loaded instance from the cache after loading to make sure the next `require` call loads
it again. Alias *cached*, default `false`.

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
[hooking]: http://bahmutov.calepin.co/hooking-into-node-loader-for-fun-and-profit.html

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

#### verbose

Print debug messages while loading. Alias *debug*, default `false`.


## Use

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


### How it works

Everything related to loading CommonJS modules in Node is factored into a `module` class.
Take a look at [module.js][module.js]. You can inspect most of the functions even from REPL

```js
var Module = require('module');
console.log(Module);
// inspect one function for example
console.log(Module._load.toString());
```

[module.js]: https://github.com/joyent/node/blob/master/lib/module.js


### Small print

Author: Gleb Bahmutov &copy; 2014

* [@bahmutov](https://twitter.com/bahmutov)
* [glebbahmutov.com](http://glebbahmutov.com)
* [blog](http://bahmutov.calepin.co/)

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



