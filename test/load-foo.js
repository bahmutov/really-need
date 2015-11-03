// just load another file using really-need
// get new, improved require
require = require('../index');
var foo = require('./foo');
console.log('loaded %s foo', typeof foo);
