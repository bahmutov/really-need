var server = {
  fresh: true,
  close: function () {
    console.log('server closed');
  }
};
module.exports = server;
