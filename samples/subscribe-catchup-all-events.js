// Subscribe to all events on the $all stream. Catch up from the beginning, then listen for any new events as they occur.
// This can be used (e.g.) for subscribers which populate read models. 

var esClient = require('../src/client');      // When  running in 'eventstore-node/samples' folder.
// var esClient = require('eventstore-node'); // Otherwise

const credentialsForAllEventsStream = new esClient.UserCredentials("admin", "changeit");

var esConnection = esClient.createConnection({}, {"host": "localhost", "port": 1113});
esConnection.connect();
esConnection.once('connected', function (tcpEndPoint) {
    console.log('Connected to eventstore at ' + tcpEndPoint.host + ":" + tcpEndPoint.port);
    var subscription = esConnection.subscribeToAllFrom(null, true, eventAppeared, liveProcessingStarted, subscriptionDropped, credentialsForAllEventsStream);
    console.log("subscription.isSubscribedToAll: " + subscription.isSubscribedToAll);    
});

function eventAppeared(subscription, event) {
    // This is where to filter out events which the subscriber isn't interested in.
    // For an example, see 'subscribe-all-events.js'.
    console.log(event.originalEvent.eventStreamId);
}

function subscriptionDropped(subscription, reason, error) {
    if (error) {
        console.log(error);
    }
    console.log('Subscription dropped.');
}

function liveProcessingStarted() {
    console.log("Caught up with previously stored events. Listening for new events.");
    console.log("(To generate a test event, try running 'node store-event.js' in a separate console.)")
}

function eventAppeared(stream, event) {
    console.log(event.originalEvent.eventStreamId, event.originalEvent.eventId, event.originalEvent.eventType);
    // Data:
    // console.log(event.originalEvent.data.toString());

    // Position in the event stream. Can be persisted and used to catch up with missed events when re-starting subscribers instead of re-reading
    // all events from the beginning. 
    // console.log(event.originalPosition);
}

esConnection.on('error', function (err) {
  console.log('Error occurred on connection:', err);
});

esConnection.on('closed', function (reason) {
  console.log('Connection closed, reason:', reason);
});
