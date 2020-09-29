const uuid = require('uuid');
const client = require('../lib/dist');
const allCredentials = new client.UserCredentials("admin", "changeit");

module.exports = {
  'Test Subscribe To All Happy Path': function(test) {
    const resolveLinkTos = false;
    const numberOfPublishedEvents = 5;
    test.expect(numberOfPublishedEvents + 4);

    var _doneCount = 0;
    function done(err) {
      test.ok(!err, err ? err.stack : '');
      if (++_doneCount < 2) return;
      test.done();
    }

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
    this.conn.subscribeToAll(resolveLinkTos, eventAppeared, subscriptionDropped, allCredentials)
      .then(function(subscription) {
        test.areEqual("subscription.isSubscribedToAll", subscription.isSubscribedToAll, true);

        return self.conn.appendToStream(self.testStreamName, client.expectedVersion.emptyStream, publishedEvents);
      })
      .then(function () {
        done();
      })
      .catch(test.done)
  }
};

require('./common/base_test').init(module.exports);
