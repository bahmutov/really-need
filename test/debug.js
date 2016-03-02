var assert = require('assert');
var spawn = require('child_process').spawn;
var script = __dirname + '/simple.js';

var child = spawn(process.execPath, ['--debug', script]);

child.on('close', function(code) {
  console.assert(0 === code, 'node debug should terminated successfully');
});
