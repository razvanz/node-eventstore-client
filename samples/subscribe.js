var esClient = require('../src/client');      // When  running in 'eventstore-node/samples' folder.
// var esClient = require('eventstore-node'); // Otherwise

const credentialsForAllEventsStream = new esClient.UserCredentials("admin", "changeit");
const resolveLinkTos = false;

var esConnection = esClient.createConnection({}, {"hostname": "localhost", "port": 1113});
esConnection.connect();
esConnection.once('connected', function (tcpEndPoint) {
    console.log('Connected to eventstore at ' + tcpEndPoint.hostname + ":" + tcpEndPoint.port);
});

function belongsToAUserAggregate(event) {
    return event.originalEvent.eventStreamId.startsWith("user-")
}

function eventAppeared(subscription, event) {
    // Ignore all events which aren't about users:
    if(belongsToAUserAggregate(event)) {
        var aggregateId = event.originalEvent.eventStreamId;
        var eventId = event.originalEvent.eventId;
        var eventType = event.originalEvent.eventType;
        var eventCreated = event.originalEvent.created;
        console.log(aggregateId, eventType, eventId, eventCreated);
        console.log(event.originalEvent.data.toString() + "\n");
    }
}

function subscriptionDropped(subscription, reason, error) {
    if (error) return test.done(error);
    console.log('Subscription dropped.');
}

esConnection.subscribeToAll(resolveLinkTos, eventAppeared, subscriptionDropped, credentialsForAllEventsStream)
    .then(function(subscription) {
    console.log("subscription.isSubscribedToAll: " + subscription.isSubscribedToAll);
    })
    .catch(console.log("Caught."));

esConnection.on('error', function (err) {
  console.log('Error occurred on connection:', err);
});

esConnection.on('closed', function (reason) {
  console.log('Connection closed, reason:', reason);
  process.exit(-1);
});
