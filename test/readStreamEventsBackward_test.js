var util = require('util');
var uuid = require('uuid');
var client = require('../src/client');
var Long = require('long');

const streamSize = 100;

module.exports = {
  setUp: function(cb) {
    this.eventsData = [];
    for(var i = 0; i < streamSize; i++)
      this.eventsData.push(client.createJsonEventData(uuid.v4(), {a: uuid.v4(), b: Math.random()}, null, 'anEvent'));
    this.conn.appendToStream(this.testStreamName, client.expectedVersion.noStream, this.eventsData)
        .then(function() {
          cb();
        })
        .catch(cb);
  },
  'Read Stream Events Backward Happy Path': function(test) {
    test.expect(7 + (streamSize * 6));
    var self = this;
    this.conn.readStreamEventsBackward(this.testStreamName, streamSize-1, streamSize)
        .then(function(slice) {
          test.areEqual('slice.status', slice.status, client.eventReadStatus.Success);
          test.areEqual('slice.stream', slice.stream, self.testStreamName);
          test.areEqual('slice.fromEventNumber', slice.fromEventNumber, Long.fromNumber(streamSize-1));
          test.areEqual('slice.readDirection', slice.readDirection, 'backward');
          test.areEqual('slice.nextEventNumber', slice.nextEventNumber, Long.fromNumber(-1));
          test.areEqual('slice.lastEventNumber', slice.lastEventNumber, Long.fromNumber(streamSize-1));
          test.areEqual('slice.isEndOfStream', slice.isEndOfStream, true);
          for(var i = 0; i < streamSize; i++) {
            var reverseIndex = streamSize - i - 1;
            test.eventEqualEventData('slice.events[' + i + ']', slice.events[i], self.eventsData[reverseIndex]);
            test.areEqual('slice.events[' + i + '].originalEventNumber', slice.events[i].originalEventNumber, Long.fromNumber(reverseIndex));
          }
          test.done();
        })
        .catch(function(err) {
          test.done(err);
        })
  },
  'Read Stream Events Backward With Non-Existing Stream': function(test) {
    test.expect(4);
    var anotherStream = 'test' + uuid.v4();
    this.conn.readStreamEventsBackward(anotherStream, streamSize-1, streamSize)
        .then(function(slice) {
          test.areEqual('slice.status', slice.status, client.sliceReadStatus.StreamNotFound);
          test.areEqual('slice.stream', slice.stream, anotherStream);
          test.areEqual('slice.fromEventNumber', slice.fromEventNumber, Long.fromNumber(streamSize-1));
          test.areEqual('slice.events.length', slice.events.length, 0);
          test.done();
        })
        .catch(function(err) {
          test.done(err);
        });
  },
  'Read Stream Events Backward With Deleted Stream': function(test) {
    test.expect(4);
    var self = this;
    this.conn.deleteStream(this.testStreamName, streamSize-1, true)
        .then(function() {
          return self.conn.readStreamEventsBackward(self.testStreamName, streamSize-1, streamSize)
        })
        .then(function(slice) {
          test.areEqual('slice.status', slice.status, client.eventReadStatus.StreamDeleted);
          test.areEqual('slice.stream', slice.stream, self.testStreamName);
          test.areEqual('slice.fromEventNumber', slice.fromEventNumber, Long.fromNumber(streamSize-1));
          test.areEqual('slice.events.length', slice.events.length, 0);
          test.done();
        })
        .catch(function(err) {
          test.done(err);
        });
  },
  'Read Stream Events Backward With Inexisting Version': function(test) {
    test.expect(4);
    var self = this;
    return self.conn.readStreamEventsBackward(self.testStreamName, streamSize * 2, streamSize)
        .then(function(slice) {
          test.areEqual('slice.status', slice.status, client.eventReadStatus.Success);
          test.areEqual('slice.stream', slice.stream, self.testStreamName);
          test.areEqual('slice.fromEventNumber', slice.fromEventNumber, Long.fromNumber(streamSize*2));
          test.areEqual('slice.events.length', slice.events.length, 0);
          test.done();
        })
        .catch(function(err) {
          test.done(err);
        });
  },
  'Read Stream Events Backward With No Access': function(test) {
    test.expect(1);
    var self = this;
    var metadata = {$acl: {$r: '$admins'}};
    this.conn.setStreamMetadataRaw(self.testStreamName, client.expectedVersion.noStream, metadata)
        .then(function(){
          return self.conn.readStreamEventsBackward(self.testStreamName, streamSize-1, streamSize);
        })
        .then(function(slice) {
          test.fail("readStreamEventsBackward succeeded but should have failed.");
          test.done();
        })
        .catch(function(err) {
          var isAccessDenied = err instanceof client.AccessDeniedError;
          test.ok(isAccessDenied, "readStreamEventsBackward should have failed with AccessDeniedError, got " + err.constructor.name);
          if (isAccessDenied) return test.done();
          test.done(err);
        });
  }
};

require('./common/base_test').init(module.exports);