var esClient = require('../src/client');      // When running in 'eventstore-node/samples' folder. 
// var esClient = require('eventstore-node'); // Otherwise
var uuid = require('uuid');

var esConnection = esClient.createConnection({}, {"hostname": "localhost", "port": 1113});
esConnection.connect();
esConnection.once('connected', function (tcpEndPoint) {
    console.log('Connected to eventstore at ' + tcpEndPoint.host + ":" + tcpEndPoint.port);
    var userId = uuid.v4();
    // This event could happen as a result of (e.g.) a 'CreateUser(id, username, password)' command.
    var userCreatedEvent = {
        id: userId,      
        username: "user" + uuid.v4().substring(0,6),  // Hard-to-spell exotic username.
        password: Math.random().toString()                      // Hard-to-guess password. 
    };
    var eventId = uuid.v4();
    var event = esClient.createJsonEventData(eventId, userCreatedEvent, null, "UserCreated");
    // Every user has her/his own stream of events:
    var streamName = "user-" + userId;
    console.log("Storing event. Look for it at http://localhost:2113/web/index.html#/streams/user-" + userId);
    esConnection.appendToStream(streamName, esClient.expectedVersion.any, event)
        .then(function(result) {
            console.log("Event stored.");
            process.exit(0);
        })
        .catch(function(err) {
            console.log(err);
            process.exit(-1);
        });
});

esConnection.on('error', function (err) {
  console.log('Error occurred on connection:', err);
  process.exit(-1);  
});

esConnection.on('closed', function (reason) {
  console.log('Connection closed, reason:', reason);
  process.exit(-1);
});
