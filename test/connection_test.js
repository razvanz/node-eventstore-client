var client = require('../src/client.js');

var testBase = require('./common/base_test');

module.exports = {
  'Connect To Endpoint Happy Path': function(test) {
    var tcpEndpoint = {hostname: 'localhost', port: 1113};
    var conn = client.EventStoreConnection.create(testBase.settings(), tcpEndpoint);
    conn.connect()
        .catch(function(err) {
          test.done(err);
        });
    conn.on('connected', function(endPoint){
      test.areEqual("connected endPoint", endPoint, tcpEndpoint);
      done();
    });
    conn.on('error', done);

    function done(err) {
      conn.close();
      if (err) return test.done(err);
      test.done();
    }
  },
  'Connect To Endpoint That Don\'t Exist': function(test) {
    var tcpEndpoint = {hostname: 'localhost', port: 1114};
    var conn = client.EventStoreConnection.create(testBase.settings({maxReconnections:1}), tcpEndpoint);
    conn.connect()
        .catch(function (err) {
          test.done(err);
        });
    conn.on('connected', function () {
      test.fail("Should not be able to connect.");
      test.done();
    });
    conn.on('error', function (err) {
      test.done(err);
    });
    conn.on('closed', function(reason) {
      test.ok(reason.indexOf("Reconnection limit reached") === 0, "Wrong expected reason.");
      test.done();
    });
  }
};

testBase.init(module.exports, false);