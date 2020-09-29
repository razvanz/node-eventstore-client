const uuid = require('uuid');
const client = require('../lib/dist');
const Long = require('long');

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
      // Filter non-compliant events (only the one we've published)
      let eventData;
      try {
        eventData = JSON.parse(event.event.data.toString());
      } catch(e){}
      if (eventData && eventData.a && eventData.b){
        receivedEvents.push(event);
      }
      if (receivedEvents.length === numberOfPublishedEvents) subscription.close();
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
