require('lazy-ass');
var check = require('check-more-types');
var quote = require('quote');

require = require('../..');

var used = {};

function isPrimitive(x) {
  return check.string(x) ||
    check.number(x) ||
    check.bool(x);
}

function proxyExports(options, exports, filename) {
  options = options || {};

  la(check.unemptyString(filename), 'missing loaded filename');
  console.log('loaded', filename);

  if (!check.has(used, filename)) {
    used[filename] = false;
  }

  if (isPrimitive(exports)) {
    used[filename] = true;
    return exports;
  }

  if (check.fn(exports)) {
    console.log('proxying a function', quote(exports.name));
    return function proxyFn() {
      used[filename] = true;
      return exports.apply(null, arguments);
    };
  }

  return exports;
}

require('./foo', {
  bust: true,
  post: proxyExports.bind(null, {})
});

require('./bar', {
  bust: true,
  post: proxyExports.bind(null, {})
});

require('./use-foo');

console.log('after finished proxying');
console.log(used);

var filenames = Object.keys(used);
la(filenames.length === 2, 'should have info about two modules', used);
filenames.forEach(function (filename) {
  if (/foo\.js$/.test(filename)) {
    la(used[filename], filename, 'should have been used', used);
  } else if (/bar\.js$/.test(filename)) {
    la(!used[filename], filename, 'should NOT have been used', used);
  }
});

