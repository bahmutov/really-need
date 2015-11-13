module.exports = function(testData) {
  console.assert(testData, 'missing test data object');

  var first;

  it('has server', function () {
    console.assert(testData.server, 'has server');
    console.assert(testData.server.fresh, 'server is fresh');
    testData.server.fresh = false;
    first = testData.server;
  });

  it('has the second server', function () {
    console.assert(testData.server, 'has server');
    console.assert(testData.server.fresh, 'server is fresh');
    testData.server.fresh = false;
  });

  it('gets different server', function () {
    // assumes tests execute in order
    console.assert(first !== testData.server);
  });
}
