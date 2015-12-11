function getVersion() {
  var pkg = require(process.cwd() + '/example.json');
  return pkg.version;
}
module.exports = getVersion;
