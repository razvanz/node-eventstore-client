var util = require('util');
var uuid = require('uuid');
var client = require('../src/client');

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
  'Read Stream Events Forward Happy Path': function(test) {
    var self = this;
    this.conn.readStreamEventsForward(this.testStreamName, 0, streamSize)
        .then(function(slice) {
          test.areEqual('slice.status', slice.status, client.eventReadStatus.Success);
          test.areEqual('slice.stream', slice.stream, self.testStreamName);
          test.areEqual('slice.fromEventNumber', slice.fromEventNumber, 0);
          test.areEqual('slice.readDirection', slice.readDirection, 'forward');
          test.areEqual('slice.nextEventNumber', slice.nextEventNumber, streamSize);
          test.areEqual('slice.lastEventNumber', slice.lastEventNumber, streamSize-1);
          test.areEqual('slice.isEndOfStream', slice.isEndOfStream, true);
          for(var i = 0; i < streamSize; i++) {
            test.eventEqualEventData('slice.events[' + i + ']', slice.events[i], self.eventsData[i]);
            test.areEqual('slice.events[' + i + '].originalEventNumber', slice.events[i].originalEventNumber, i);
          }
          test.done();
        })
        .catch(function(err) {
          test.done(err);
        })
  },
  'Read Stream Events Forward With Non-Existing Stream': function(test) {
    var anotherStream = 'test' + uuid.v4();
    this.conn.readStreamEventsForward(anotherStream, 0, streamSize)
        .then(function(slice) {
          test.areEqual('slice.status', slice.status, client.sliceReadStatus.StreamNotFound);
          test.areEqual('slice.stream', slice.stream, anotherStream);
          test.areEqual('slice.fromEventNumber', slice.fromEventNumber, 0);
          test.areEqual('slice.events.length', slice.events.length, 0);
          test.done();
        })
        .catch(function(err) {
          test.done(err);
        });
  },
  'Read Stream Events Forward With Deleted Stream': function(test) {
    var self = this;
    this.conn.deleteStream(this.testStreamName, streamSize-1, true)
        .then(function() {
          return self.conn.readStreamEventsForward(self.testStreamName, 0, streamSize)
        })
        .then(function(slice) {
          test.areEqual('slice.status', slice.status, client.eventReadStatus.StreamDeleted);
          test.areEqual('slice.stream', slice.stream, self.testStreamName);
          test.areEqual('slice.fromEventNumber', slice.fromEventNumber, 0);
          test.areEqual('slice.events.length', slice.events.length, 0);
          test.done();
        })
        .catch(function(err) {
          test.done(err);
        });
  },
  'Read Stream Events Forward With Inexisting Version': function(test) {
    var self = this;
    return self.conn.readStreamEventsForward(self.testStreamName, streamSize * 2, streamSize)
        .then(function(slice) {
          test.areEqual('slice.status', slice.status, client.eventReadStatus.Success);
          test.areEqual('slice.stream', slice.stream, self.testStreamName);
          test.areEqual('slice.fromEventNumber', slice.fromEventNumber, streamSize*2);
          test.areEqual('slice.events.length', slice.events.length, 0);
          test.done();
        })
        .catch(function(err) {
          test.done(err);
        });
  },
  'Read Stream Events Forward With No Access': function(test) {
    var self = this;
    var metadata = {$acl: {$r: '$admins'}};
    this.conn.setStreamMetadataRaw(self.testStreamName, client.expectedVersion.noStream, metadata)
        .then(function(){
          return self.conn.readStreamEventsForward(self.testStreamName, 0, streamSize);
        })
        .then(function(slice) {
          test.fail("readStreamEventsForward succeeded but should have failed.");
          test.done();
        })
        .catch(function(err) {
          var isAccessDenied = err instanceof client.AccessDeniedError;
          test.ok(isAccessDenied, "readStreamEventsForward should have failed with AccessDeniedError, got " + err.constructor.name);
          if (isAccessDenied) return test.done();
          test.done(err);
        });
  }
};

require('./common/base_test').init(module.exports);