require = require('../..');

function proxyExports(options, exports, filename) {
  options = options || {};

  console.log('loaded', filename);
  console.log('it exports', exports);

  return exports;
}

require('./foo', {
  bust: true,
  post: proxyExports.bind(null, {})
});

require('./use-foo');

