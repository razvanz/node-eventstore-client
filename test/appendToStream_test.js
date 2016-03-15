var uuid = require('uuid');
var client = require('../src/client');

module.exports = {
  'Append One Event To Stream Happy Path': function(test) {
    var event = client.createJsonEventData(uuid.v4(), {a: Math.random(), b: uuid.v4()}, null, 'testEvent');
    this.conn.appendToStream(this.testStreamName, client.expectedVersion.any, event)
        .then(function(result) {
          test.areEqual("nextExpectedVersion", result.nextExpectedVersion, 0);
          test.ok(result.logPosition, "No log position in result.");
          test.done();
        })
        .catch(function(err) {
          test.done(err);
        });
  },
  'Append Multiple Events To Stream Happy Path': function(test) {
    const expectedVersion = 25;
    var events = [];
    for(var i = 0; i <= expectedVersion; i++) {
      if (i % 2 === 0)
        events.push(client.createJsonEventData(uuid.v4(), {a: Math.random(), b: uuid.v4()}, null, 'testEvent'));
      else
        events.push(client.createJsonEventData(uuid.v4(), {b: Math.random(), a: uuid.v4()}, null, 'otherEvent'));
    }
    this.conn.appendToStream(this.testStreamName, client.expectedVersion.any, events)
        .then(function(result) {
          test.areEqual("result.nextExpectedVersion", result.nextExpectedVersion, expectedVersion);
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
          test.fail("Append succeeded but should have failed.");
          test.done();
        })
        .catch(function(err) {
          var isWrongExpectedVersion = err instanceof client.WrongExpectedVersionError;
          test.ok(isWrongExpectedVersion, "Expected WrongExpectedVersionError, got " + err.constructor.name);
          if (isWrongExpectedVersion) return test.done();
          test.done(err);
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
          test.fail("Append succeeded but should have failed.");
          test.done();
        })
        .catch(function(err) {
          var isStreamDeleted = err instanceof client.StreamDeletedError;
          test.ok(isStreamDeleted, "Expected StreamDeletedError, got " + err.constructor.name);
          if (isStreamDeleted) return test.done();
          test.done(err);
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
          test.fail("Append succeeded but should have failed.");
          test.done();
        })
        .catch(function(err) {
          var isStreamDeleted = err instanceof client.AccessDeniedError;
          test.ok(isStreamDeleted, "Expected AccessDeniedError, got " + err.constructor.name);
          if (isStreamDeleted) return test.done();
          test.done(err);
        });
  }
};

require('./common/base_test').init(module.exports);
