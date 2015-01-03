# really-need

> A wrapper for Node require with options for cache busting, pre- and post-processing.

[![NPM][really-need-icon] ][really-need-url]

[![Build status][really-need-ci-image] ][really-need-ci-url]
[![dependencies][really-need-dependencies-image] ][really-need-dependencies-url]
[![devdependencies][really-need-devdependencies-image] ][really-need-devdependencies-url]

## How it works

Everything related to loading CommonJS modules in Node is factored into a `module` class.
Take a look at [module.js][module.js]. You can inspect most of the functions even from REPL

```js
var Module = require('module');
console.log(Module);
// inspect one function for example
console.log(Module._load.toString());
```

## Related projects

* [node-hook][node-hook] - simple source code transformation on load, 
see [Hooking into Node loader for fun and profit].

[module.js]: https://github.com/joyent/node/blob/master/lib/module.js
[node-hook]: https://github.com/bahmutov/node-hook
[hooking]: http://bahmutov.calepin.co/hooking-into-node-loader-for-fun-and-profit.html

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

[really-need-icon]: https://nodei.co/npm/really-need.png?downloads=true
[really-need-url]: https://npmjs.org/package/really-need
[really-need-ci-image]: https://travis-ci.org/bahmutov/really-need.png?branch=master
[really-need-ci-url]: https://travis-ci.org/bahmutov/really-need
[really-need-dependencies-image]: https://david-dm.org/bahmutov/really-need.png
[really-need-dependencies-url]: https://david-dm.org/bahmutov/really-need
[really-need-devdependencies-image]: https://david-dm.org/bahmutov/really-need/dev-status.png
[really-need-devdependencies-url]: https://david-dm.org/bahmutov/really-need#info=devDependencies
