# really-need

> A wrapper for Node require with options and arguments

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
