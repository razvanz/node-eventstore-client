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
  'Read All Events Forward Happy Path': function(test) {
    this.conn.readAllEventsForward(client.positions.start, maxCount, false, allCredentials)
        .then(function(slice) {
          test.areEqual('slice.readDirection', slice.readDirection, 'forward');
          test.areEqual('slice.fromPosition', slice.fromPosition, client.positions.start);
          test.ok(slice.nextPosition.compareTo(client.positions.start) > 0, "slice.nextPosition is not greater than start.");
          test.areEqual('slice.isEndOfStream', slice.isEndOfStream, false);
          test.areEqual('slice.events.length', slice.events.length, maxCount);
          var lastPosition = client.positions.start;
          for(var i = 0; i < maxCount; i++) {
            test.ok(slice.events[i].originalPosition.compareTo(lastPosition) > 0,
                util.format("wrong order at slice.events[%d].", i));
            lastPosition = slice.events[i].originalPosition;
          }
          test.done();
        })
        .catch(function(err) {
          test.done(err);
        })
  },
  'Read All Events Forward With No Access': function(test) {
    this.conn.readAllEventsForward(client.positions.start, maxCount)
        .then(function(slice) {
          test.fail("readAllEventsForward succeeded but should have failed.");
          test.done();
        })
        .catch(function(err) {
          var isAccessDenied = err instanceof client.AccessDeniedError;
          test.ok(isAccessDenied, "readAllEventsForward should have failed with AccessDeniedError, got " + err.constructor.name);
          if (isAccessDenied) return test.done();
          test.done(err);
        });
  }
};

require('./common/base_test').init(module.exports);