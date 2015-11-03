var fs = require('fs');
module.exports = function checkFileExists(filename) {
  var exists = fs.existsSync(filename);
  console.log('loads-first: does file %s exists? %s', filename, exists);
  return exists;
};
