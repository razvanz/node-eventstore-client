var util = require('util');
var uuid = require('uuid');
var client = require('../src/client');

const numberOfStreams = 20;
const maxBatch = 10;
const minBatch = 1;
const maxCount = 500;
const allCredentials = new client.UserCredentials("admin", "changeit");

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = {
  setUp: function(cb) {
    var streams = [];
    for(var s = 0; s < numberOfStreams; s++) {
      streams.push('test-' + uuid.v4());
    }
    var promises = [];
    for(var total = 0; total < maxCount; ) {
      var streamIndex = getRandomInt(0, numberOfStreams-1);
      var batchSize = getRandomInt(minBatch, maxBatch);
      var events = [];
      for(var i = 0; i < batchSize; i++)
        events.push(client.createJsonEventData(uuid.v4(), {a: uuid.v4(), b: Math.random()}, null, 'anEvent'));
      promises.push(this.conn.appendToStream(streams[streamIndex], client.expectedVersion.any, events));
      total += batchSize;
    }
    Promise.all(promises)
        .then(function() {
          cb();
        })
        .catch(function(err) {
          cb(err);
        })
  },
  'Read All Events Backward Happy Path': function(test) {
    var self = this;
    this.conn.readAllEventsBackward(client.positions.end, maxCount, false, allCredentials)
        .then(function(slice) {
          test.areEqual('slice.readDirection', slice.readDirection, 'backward');
          //test.areEqual('slice.fromPosition', slice.fromPosition, client.positions.end);
          test.ok(slice.nextPosition.compareTo(slice.fromPosition) < 0, "slice.nextPosition is not lower than slice.fromPosition.");
          test.areEqual('slice.isEndOfStream', slice.isEndOfStream, false);
          test.areEqual('slice.events.length', slice.events.length, maxCount);
          var lastPosition = client.positions.end;
          for(var i = 0; i < maxCount; i++)
            test.ok(slice.events[i].originalPosition.compareTo(lastPosition) > 0,
                    util.format("wrong order at slice.events[%d].", i));
          test.done();
        })
        .catch(function(err) {
          test.done(err);
        })
  },
  'Read All Events Backward With No Access': function(test) {
    this.conn.readAllEventsBackward(client.positions.end, maxCount)
        .then(function(slice) {
          test.fail("readAllEventsBackward succeeded but should have failed.");
          test.done();
        })
        .catch(function(err) {
          var isAccessDenied = err instanceof client.AccessDeniedError;
          test.ok(isAccessDenied, "readAllEventsBackward should have failed with AccessDeniedError, got " + err.constructor.name);
          if (isAccessDenied) return test.done();
          test.done(err);
        });
  }
};

require('./common/base_test').init(module.exports);