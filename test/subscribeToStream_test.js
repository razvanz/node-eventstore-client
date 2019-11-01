const uuid = require('uuid');
const client = require('../lib/dist');
const Long = require('long');

function delay(ms) {
  return new Promise(function (resolve, reject) {
    setTimeout(resolve, ms);
  })
}

function delayOnlyFirst(count, action) {
  if (count === 0) return action();
  return delay(200)
    .then(function () {
      action();
    })
}

module.exports = {
  'Test Subscribe To Stream Happy Path': function(test) {
    const resolveLinkTos = false;
    const numberOfPublishedEvents = 5;
    test.expect(numberOfPublishedEvents + 6);
    var publishedEvents = [];
    for(var i=0;i<numberOfPublishedEvents;i++)
      publishedEvents.push(client.createJsonEventData(uuid.v4(), {a: Math.random(), b: uuid.v4()}, null, 'anEvent'));

    var _doneCount = 0;
    function done(err) {
      test.ok(!err, err ? err.stack : '');
      if (++_doneCount < 2) return;
      test.done();
    }

    function testAllPublishedEventsAppeared() {
      test.areEqual("receivedEvents.length", receivedEvents.length, numberOfPublishedEvents);
    }
    function testEventsAppearedInCorrectOrder() {
      for (var j = 0; j < numberOfPublishedEvents; j++)
        test.ok(receivedEvents[j].originalEvent.eventId === publishedEvents[j].eventId,
            "receivedEvents[" + j + "] != publishedEvents[" + j + "]");
    }

    var receivedEvents = [];
    function eventAppeared(subscription, event) {
      delayOnlyFirst(receivedEvents.length, function () {
        receivedEvents.push(event);
        if (receivedEvents.length === numberOfPublishedEvents) subscription.close();
      });
    }
    function subscriptionDropped(subscription, reason, error) {
      if (error) return done(error);
      testAllPublishedEventsAppeared();
      testEventsAppearedInCorrectOrder();
      done();
    }
    var self = this;
    this.conn.subscribeToStream(this.testStreamName, resolveLinkTos, eventAppeared, subscriptionDropped)
        .then(function(subscription) {
          test.areEqual("subscription.streamId", subscription.streamId, self.testStreamName);
          test.areEqual("subscription.isSubscribedToAll", subscription.isSubscribedToAll, false);
          test.areEqual("subscription.lastEventNumber", subscription.lastEventNumber, Long.fromNumber(client.expectedVersion.emptyStream));

          return self.conn.appendToStream(self.testStreamName, client.expectedVersion.emptyStream, publishedEvents);
        })
        .then(function () {
          done();
        })
        .catch(test.done)
  }
};

require('./common/base_test').init(module.exports);
