var uuid = require('uuid');
var client = require('../src/client');

var settings = {};
if (process.env.TESTS_VERBOSE_LOGGING === '1') {
  settings.verboseLogging = true;
  var FileLogger = require('../src/common/log/fileLogger');
  settings.log = new FileLogger('deleteStream_test.log');
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
    var self = this;
    this.conn.on('connected', function() {
      connected = true;
      var events = [
        client.createJsonEventData(uuid.v4(), {a: Math.random(), b: uuid.v4()}, null, 'testEvent'),
        client.createJsonEventData(uuid.v4(), {a: Math.random(), b: uuid.v4()}, null, 'testEvent')
      ];
      self.conn.appendToStream(self.testStreamName, client.expectedVersion.noStream, events)
          .then(function() {
            cb();
          })
          .catch(cb);
    });
  },
  tearDown: function(cb) {
    this.conn.close();
    this.conn.on('closed', function() {
      cb();
    });
    this.conn = null;
  },
  'Test Delete Stream Soft Happy Path': function(test) {
    var self = this;
    this.conn.deleteStream(this.testStreamName, 1, false)
        .then(function(result) {
          test.ok(result.logPosition, "No log position in result.");
          return self.conn.getStreamMetadataRaw(self.testStreamName);
        })
        .then(function(metadata) {
          test.ok(metadata.stream === self.testStreamName, "Metadata stream doesn't match.");
          test.ok(metadata.isStreamDeleted === false, "Metadata says stream is deleted.");
          test.ok(metadata.streamMetadata.$tb, "Expected Truncate Before to be set");
          test.done();
        })
        .catch(function(err) {
          test.done(err);
        });
  },
  /*
  This test fails because of a protobufjs error.
  Client.ReadEventCompleted fails to decode because ResolvedIndexedEvent.event is null and it's marked as required.
  Test will pass if messages.proto is modified so that ResolvedIndexedEvent.event is optional.
  Unsure if it's a protobufjs issue or a GES issue. Need to duplicate this test with .Net Client.

  'Test Delete Stream Hard Happy Path': function(test) {
    var self = this;
    this.conn.deleteStream(this.testStreamName, 1, true)
        .then(function(result) {
          test.ok(result.logPosition, "No log position in result.");
          return self.conn.getStreamMetadataRaw(self.testStreamName);
        })
        .then(function(metadata) {
          test.ok(metadata.stream === self.testStreamName, "Metadata stream doesn't match.");
          test.ok(metadata.isStreamDeleted === true, "Metadata says stream is deleted.");
          test.ok(metadata.streamMetadata === null, "Expected streamMetadata to be null.");
          test.done();
        })
        .catch(function(err) {
          test.done(err);
        });
  }
  */

};
