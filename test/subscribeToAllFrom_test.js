var util = require('util');
var uuid = require('uuid');
var client = require('../lib/dist');
const allCredentials = new client.UserCredentials("admin", "changeit");

function createRandomEvent() {
  return client.createJsonEventData(uuid.v4(), {a: uuid.v4(), b: Math.random()}, {createdAt: Date.now()}, 'testEvent');
}

module.exports = {
  'Test Subscribe to All From (Start)': function(test) {
    test.expect(6);
    var self = this;
    var liveProcessing = false;
    var catchUpEvents = [];
    var liveEvents = [];
    var _doneCount = 0;
    function done(err) {
      test.ok(!err, err ? err.stack : '');
      _doneCount++;
      if (_doneCount < 2) return;

      var catchUpInOrder = true;
      for(var i = 1; i < catchUpEvents.length; i++)
        catchUpInOrder = catchUpInOrder && (catchUpEvents[i].originalPosition.compareTo(catchUpEvents[i-1].originalPosition) > 0);
      test.ok(catchUpInOrder, "Catch-up events are out of order.");

      var liveInOrder = true;
      for(var j = 1; j < liveEvents.length; j++)
        liveInOrder = liveInOrder && (liveEvents[j].originalPosition.compareTo(liveEvents[j-1].originalPosition) > 0);
      test.ok(liveInOrder, "Live events are out of order.");

      test.done();
    }
    function eventAppeared(s, e) {
      var isLive = liveProcessing;
      if (isLive) {
        liveEvents.push(e);
      } else {
        catchUpEvents.push(e);
      }
      if (isLive && liveEvents.length === 2) s.stop();
    }
    function liveProcessingStarted() {
      liveProcessing = true;
      var events = [createRandomEvent(), createRandomEvent()];
      self.conn.appendToStream(self.testStreamName, client.expectedVersion.any, events)
          .then(function () {
            done();
          })
          .catch(done);
    }
    function subscriptionDropped(connection, reason, error) {
      test.ok(liveEvents.length === 2, "Expecting 2 live event, got " + liveEvents.length);
      test.ok(catchUpEvents.length > 1, "Expecting at least 1 catchUp event, got " + catchUpEvents.length);
      done(error);
    }
    var subscription = this.conn.subscribeToAllFrom(null, false, eventAppeared, liveProcessingStarted, subscriptionDropped, allCredentials);
  },
  'Test Subscribe to All From (Position)': function(test) {
    test.expect(7);
    var self = this;
    var liveProcessing = false;
    var catchUpEvents = [];
    var liveEvents = [];
    var _doneCount = 0;
    function done(err) {
      test.ok(!err, err ? err.stack : '');
      _doneCount++;
      if (_doneCount < 2) return;

      var catchUpInOrder = true;
      for(var i = 1; i < catchUpEvents.length; i++)
        catchUpInOrder = catchUpInOrder && (catchUpEvents[i].originalPosition.compareTo(catchUpEvents[i-1].originalPosition) > 0);
      test.ok(catchUpInOrder, "Catch-up events are out of order.");

      var liveInOrder = true;
      for(var j = 1; j < liveEvents.length; j++)
        liveInOrder = liveInOrder && (liveEvents[j].originalPosition.compareTo(liveEvents[j-1].originalPosition) > 0);
      test.ok(liveInOrder, "Live events are out of order.");

      test.done();
    }
    function eventAppeared(s, e) {
      var isLive = liveProcessing;
      if (isLive) {
        liveEvents.push(e);
      } else {
        catchUpEvents.push(e);
      }
      if (isLive && liveEvents.length === 2) s.stop();
    }
    function liveProcessingStarted() {
      liveProcessing = true;
      var events = [createRandomEvent(), createRandomEvent()];
      self.conn.appendToStream(self.testStreamName, client.expectedVersion.any, events)
        .then(function () {
          done();
        })
        .catch(done);
    }
    function subscriptionDropped(connection, reason, error) {
      test.ok(liveEvents.length === 2, "Expecting 2 live event, got " + liveEvents.length);
      test.ok(catchUpEvents.length > 1, "Expecting at least 1 catchUp event, got " + catchUpEvents.length);
      done(error);
    }
    this.conn.readAllEventsForward(client.positions.start, 512, true, allCredentials)
      .then(function (slice) {
        var subscription = self.conn.subscribeToAllFrom(slice.nextPosition, false, eventAppeared, liveProcessingStarted, subscriptionDropped, allCredentials);
        test.ok(subscription, "Subscription is null/undefined.");
      });
  },
  'Test Subscribe to All From (End)': function(test) {
    test.expect(6);
    var self = this;
    var liveProcessing = false;
    var catchUpEvents = [];
    var liveEvents = [];
    var _doneCount = 0;
    function done(err) {
      test.ok(!err, err ? err.stack : '');
      _doneCount++;
      if (_doneCount < 2) return;

      var liveInOrder = true;
      for(var j = 1; j < liveEvents.length; j++)
        liveInOrder = liveInOrder && (liveEvents[j].originalPosition.compareTo(liveEvents[j-1].originalPosition) > 0);
      test.ok(liveInOrder, "Live events are out of order.");

      test.done();
    }
    function eventAppeared(s, e) {
      var isLive = liveProcessing;
      if (isLive) {
        liveEvents.push(e);
      } else {
        catchUpEvents.push(e);
      }
      if (isLive && liveEvents.length === 2) s.stop();
    }
    function liveProcessingStarted() {
      liveProcessing = true;
      var events = [createRandomEvent(), createRandomEvent()];
      self.conn.appendToStream(self.testStreamName, client.expectedVersion.any, events)
        .then(function () {
          done();
        })
        .catch(done);
    }
    function subscriptionDropped(connection, reason, error) {
      test.ok(liveEvents.length === 2, "Expecting 2 live event, got " + liveEvents.length);
      test.ok(catchUpEvents.length === 0, "Expecting 0 catchUp event, got " + catchUpEvents.length);
      done(error);
    }
    this.conn.readAllEventsForward(client.positions.end, 512, true, allCredentials)
      .then(function (slice) {
        var subscription = self.conn.subscribeToAllFrom(slice.nextPosition, false, eventAppeared, liveProcessingStarted, subscriptionDropped, allCredentials);
        test.ok(subscription, "Subscription is null/undefined.");
      });
  }
};

require('./common/base_test').init(module.exports);
