const uuid = require('uuid');
const client = require('../src/client');

module.exports = {
  'Test Subscribe To Stream Happy Path': function(test) {
    const resolveLinkTos = false;
    const numberOfPublishedEvents = 5;
    var publishedEvents = [];
    for(var i=0;i<numberOfPublishedEvents;i++)
      publishedEvents.push(client.createJsonEventData(uuid.v4(), {a: Math.random(), b: uuid.v4()}, null, 'anEvent'));

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
      receivedEvents.push(event);
      if (receivedEvents.length === numberOfPublishedEvents) subscription.close();
    }
    function subscriptionDropped(subscription, reason, error) {
      if (error) return test.done(error);
      testAllPublishedEventsAppeared();
      testEventsAppearedInCorrectOrder();
      test.done();
    }
    var self = this;
    this.conn.subscribeToStream(this.testStreamName, resolveLinkTos, eventAppeared, subscriptionDropped)
        .then(function(subscription) {
          test.areEqual("subscription.streamId", subscription.streamId, self.testStreamName);
          test.areEqual("subscription.isSubscribedToAll", subscription.isSubscribedToAll, false);
          test.areEqual("subscription.lastEventNumber", subscription.lastEventNumber, client.expectedVersion.emptyStream);

          return self.conn.appendToStream(self.testStreamName, client.expectedVersion.emptyStream, publishedEvents);
        })
        .catch(test.done)
  }
};

require('./common/base_test').init(module.exports);