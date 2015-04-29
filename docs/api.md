## API

The `require` function provided by `really-need` takes a second argument: an options object. 

### bust

Removes the previously cached module before loading. 
Equivalent to loading and compiling the JavaScript again.
Alias *bustCache*, default `false`.

### keep

Deletes loaded instance from the cache after loading to make sure the next `require` call loads
it again. Alias *cache*, default `false`.

### pre

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

### post

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

### args

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

### verbose

Print debug messages while loading. Alias *debug*, default `false`.
