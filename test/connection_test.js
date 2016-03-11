var util = require('util');
var client = require('../src/client.js');

var consoleLogger = {
  debug: function() {
    var msg = util.format.apply(util, Array.prototype.slice.call(arguments));
    util.log(msg);
  },
  info: function() {},
  error: function() {}
};

var settings = {};//verboseLogging: true, log: consoleLogger};

module.exports = {
  'Connect To Endpoint Happy Path': function(test) {
    var tcpEndpoint = {hostname: 'localhost', port: 1113};
    var conn = client.EventStoreConnection.create({}, tcpEndpoint);
    conn.connect()
        .catch(function(e) {
          test.done(e);
        });
    conn.on('connected', function(endPoint){
      test.deepEqual(endPoint, tcpEndpoint);
      done();
    });
    conn.on('error', done);

    function done(e) {
      conn.close();
      if (e) {
        test.done(e);
        return;
      }
      test.done();
    }
  },
  'Connect To Endpoint That Don\'t Exist': function(test) {
    var tcpEndpoint = {hostname: 'localhost', port: 1114};
    var conn = client.EventStoreConnection.create({maxReconnections: 1}, tcpEndpoint);
    conn.connect()
        .catch(function (e) {
          test.done(e);
        });
    conn.on('connected', function () {
      test.ok(false, "Should not be able to connect.");
      test.done();
    });
    conn.on('error', function (e) {
      test.done(e);
    });
    conn.on('closed', function(reason) {
      test.ok(reason.indexOf("Reconnection limit reached") === 0, "Wrong expected reason.");
      test.done();
    });
  }
};
