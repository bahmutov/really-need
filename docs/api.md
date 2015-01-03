## API

The `require` function provided by `really-need` takes a second argument: an options object. 

### cache

*false* - Delete previously loaded object for the given module id from internal cache before loading.
Equivalent to loading and compiling the JavaScript again. Alias *cached*.

### bust

The opposite of `cache` - when `bust: true`, the previously cached is deleted. Alias *bustCache*.

### pre

Gives you a chance to transform loaded source before compiling it. Can be used to instrument code,
compile other languages into JavaScript, etc. See related project [node-hook][node-hook] and
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

### post

Function that transform the exported object. For example, you can replace exported function with
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

### verbose

Print debug messages while loading. Alias *debug*.
