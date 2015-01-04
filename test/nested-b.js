// console.assert(require.length === 2,
// 'expected require to have 2 arguments ' + require.toString());
module.exports = require('./nested-c', {
  bust: true
});
