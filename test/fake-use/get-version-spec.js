require = require('../..');
describe('get version', function () {
  var getVersion = require('./get-version');
  var loaded = require(process.cwd() + '/example.json', {
    fake: { version: '1.2.3' }
  });
  it('returns 1.2.3', function () {
    console.assert(getVersion() === '1.2.3');
  });
});
