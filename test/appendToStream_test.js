var uuid = require('uuid');
var client = require('../src/client');

var settings = {};
if (process.env.TESTS_VERBOSE_LOGGING === '1') {
  settings.verboseLogging = true;
  var FileLogger = require('../src/common/log/fileLogger');
  settings.log = new FileLogger('appendToStream_test.log');
}

module.exports = {
  setUp: function(cb) {
    this.testStreamName = 'test-' + uuid.v4();
    var connected = false;
    this.conn = client.EventStoreConnection.create(settings, {host: 'localhost', port: 1113});
    this.conn.connect()
        .then(function() {
          //Doesn't mean anything, connection is just initiated
        })
        .catch(function(err) {
          cb(err);
        });
    this.conn.on('closed', function(reason){
      if (connected) return;
      cb(new Error("Connection failed: " + reason));
    });
    this.conn.on('connected', function() {
      connected = true;
      cb();
    });
  },
  tearDown: function(cb) {
    this.conn.close();
    this.conn.on('closed', function() {
      cb();
    });
    this.conn = null;
  },
  'Append One Event To Stream Happy Path': function(test) {
    var event = client.createJsonEventData(uuid.v4(), {a: Math.random(), b: uuid.v4()}, null, 'testEvent');
    this.conn.appendToStream(this.testStreamName, client.expectedVersion.any, event)
        .then(function(result) {
          test.ok(result.nextExpectedVersion === 0, "Expected nextExpectedVersion === 0, but was " + result.nextExpectedVersion);
          test.ok(result.logPosition, "No log position in result.");
          test.done();
        })
        .catch(function(err) {
          test.done(err);
        });
  },
  'Append Multiple Events To Stream Happy Path': function(test) {
    var events = [
      client.createJsonEventData(uuid.v4(), {a: Math.random(), b: uuid.v4()}, null, 'testEvent'),
      client.createJsonEventData(uuid.v4(), {b: Math.random(), a: uuid.v4()}, null, 'otherEvent')
    ];
    this.conn.appendToStream(this.testStreamName, client.expectedVersion.any, events)
        .then(function(result) {
          test.ok(result.nextExpectedVersion === 1, "Expected nextExpectedVersion === 1, but was " + result.nextExpectedVersion);
          test.ok(result.logPosition, "No log position in result.");
          test.done();
        })
        .catch(function(err) {
          test.done(err);
        });
  },
  'Append To Stream Wrong Expected Version': function(test) {
    var event = client.createJsonEventData(uuid.v4(), {a: Math.random(), b: uuid.v4()}, null, 'testEvent');
    this.conn.appendToStream(this.testStreamName, 10, event)
        .then(function(result) {
          test.ok(false, "Append succeeded but should have failed.");
          test.done();
        })
        .catch(function(err) {
          var isWrongExpectedVersion = err instanceof client.WrongExpectedVersionError;
          test.ok(isWrongExpectedVersion, "Expected WrongExpectedVersionError, got " + err.constructor.name);
          if (!isWrongExpectedVersion) {
            test.done(err);
            return;
          }
          test.done();
        });
  },
  'Append To Stream Deleted': function(test) {
    var self = this;
    this.conn.deleteStream(this.testStreamName, client.expectedVersion.noStream, true)
        .then(function() {
          var event = client.createJsonEventData(uuid.v4(), {a: Math.random(), b: uuid.v4()}, null, 'testEvent');
          return self.conn.appendToStream(self.testStreamName, client.expectedVersion.any, event)
        })
        .then(function(result) {
          test.ok(false, "Append succeeded but should have failed.");
          test.done();
        })
        .catch(function(err) {
          var isStreamDeleted = err instanceof client.StreamDeletedError;
          test.ok(isStreamDeleted, "Expected StreamDeletedError, got " + err.constructor.name);
          if (!isStreamDeleted) {
            test.done(err);
            return;
          }
          test.done();
        });
  },
  'Append To Stream Access Denied': function(test) {
    var self = this;
    var metadata = {$acl: {$w: "$admins"}};
    this.conn.setStreamMetadataRaw(this.testStreamName, client.expectedVersion.noStream, metadata)
        .then(function() {
          var event = client.createJsonEventData(uuid.v4(), {a: Math.random(), b: uuid.v4()}, null, 'testEvent');
          return self.conn.appendToStream(self.testStreamName, client.expectedVersion.any, event)
        })
        .then(function(result) {
          test.ok(false, "Append succeeded but should have failed.");
          test.done();
        })
        .catch(function(err) {
          var isStreamDeleted = err instanceof client.AccessDeniedError;
          test.ok(isStreamDeleted, "Expected AccessDeniedError, got " + err.constructor.name);
          if (!isStreamDeleted) {
            test.done(err);
            return;
          }
          test.done();
        });
  }
};
