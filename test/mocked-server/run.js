// Runs the my-app testing suite
var require = require('../..');

describe('Running all My App tests:', function() {
  var testData = {};

  beforeEach(function () {
    testData.server = require('./server.js', {
      bustCache: true
    });
  });

  afterEach(function () {
    testData.server.close();
  });

  describe('Check that all public routes are responding...',
    function () {
      require('./route-tests.js')(testData);
    });
});
