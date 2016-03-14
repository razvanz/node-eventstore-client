var uuid = require('uuid');
var client = require('../src/client');

module.exports = {
  setUp: function(cb) {
    var events = [
      client.createJsonEventData(uuid.v4(), {a: Math.random(), b: uuid.v4()}, null, 'testEvent'),
      client.createJsonEventData(uuid.v4(), {a: Math.random(), b: uuid.v4()}, null, 'testEvent')
    ];
    this.conn.appendToStream(this.testStreamName, client.expectedVersion.noStream, events)
        .then(function() {
          cb();
        })
        .catch(cb);
  },
  'Test Delete Stream Soft Happy Path': function(test) {
    var self = this;
    this.conn.deleteStream(this.testStreamName, 1, false)
        .then(function(result) {
          test.ok(result.logPosition, "No log position in result.");
          return self.conn.getStreamMetadataRaw(self.testStreamName);
        })
        .then(function(metadata) {
          test.areEqual("metadata.stream", metadata.stream, self.testStreamName);
          test.areEqual("metadata.isStreamDeleted", metadata.isStreamDeleted, false);
          test.ok(metadata.streamMetadata.$tb, "Expected Truncate Before to be set");
          test.done();
        })
        .catch(function(err) {
          test.done(err);
        });
  },
  'Test Delete Stream Hard Happy Path': function(test) {
    var self = this;
    this.conn.deleteStream(this.testStreamName, 1, true)
        .then(function(result) {
          test.ok(result.logPosition, "No log position in result.");
          return self.conn.getStreamMetadataRaw(self.testStreamName);
        })
        .then(function(metadata) {
          test.areEqual("metadata.stream", metadata.stream, self.testStreamName);
          test.areEqual("metadata.isStreamDeleted", metadata.isStreamDeleted, true);
          test.areEqual("metadata.streamMetadata", metadata.streamMetadata, null);
          test.done();
        })
        .catch(function(err) {
          test.done(err);
        });
  },
  'Test Delete Stream With Wrong Expected Version': function(test) {
    this.conn.deleteStream(this.testStreamName, 10)
        .then(function(result) {
          test.fail("Delete succeeded but should have failed.");
          test.done();
        })
        .catch(function(err) {
          var isWrongExpectedVersion = err instanceof client.WrongExpectedVersionError;
          test.ok(isWrongExpectedVersion, "Expected WrongExpectedVersionError, but got " + err.constructor.name);
          if (isWrongExpectedVersion) return test.done();
          test.done(err);
        });
  },
  'Test Delete Stream With No Access': function(test) {
    var self = this;
    this.conn.setStreamMetadataRaw(this.testStreamName, client.expectedVersion.any, {$acl: {$d: "$admins"}})
        .then(function() {
          return self.conn.deleteStream(self.testStreamName, 10);
        })
        .then(function(result) {
          test.fail("Delete succeeded but should have failed.");
          test.done();
        })
        .catch(function(err) {
          var isAccessDenied = err instanceof client.AccessDeniedError;
          test.ok(isAccessDenied, "Expected AccessDeniedError, but got " + err.constructor.name);
          if (isAccessDenied) return test.done();
          test.done(err);
        });
  },
  'Test Delete Stream Hard When Already Deleted': function(test) {
    var self = this;
    this.conn.deleteStream(this.testStreamName, 1, true)
        .then(function() {
          return self.conn.deleteStream(self.testStreamName, 1, true);
        })
        .then(function(result) {
          test.fail("Delete succeeded but should have failed.");
          test.done();
        })
        .catch(function(err) {
          var isStreamDeleted = err instanceof client.StreamDeletedError;
          test.ok(isStreamDeleted, "Expected StreamDeletedError, but got " + err.constructor.name);
          if (isStreamDeleted) return test.done();
          test.done(err);
        });
  }
};

require('./common/base_test').init(module.exports);