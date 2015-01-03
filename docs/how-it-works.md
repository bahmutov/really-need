## How it works

Everything related to loading CommonJS modules in Node is factored into a `module` class.
Take a look at [module.js][module.js]. You can inspect most of the functions even from REPL

```js
var Module = require('module');
console.log(Module);
// inspect one function for example
console.log(Module._load.toString());
```

[module.js]: https://github.com/joyent/node/blob/master/lib/module.js
