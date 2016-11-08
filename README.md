# eventstore-node
A port of the EventStore .Net ClientAPI to Node.js

## Dependencies

- Node.js >= 0.12
- Modules: [long](https://www.npmjs.org/package/long), [protobufjs](https://www.npmjs.org/package/protobufjs), [uuid](https://www.npmjs.org/package/uuid) (installed via `npm install`)

## Status

Unstable

### Missing features:

- Ssl connection
- Cluster connection
- Set system settings

### Incomplete

- Typed errors: currently most errors are direct instance of Error, which is not practical for error handling
- Performance: there's still some while loop in the code that could be problematic with node.js
- Tests: tests are only covering happy path scenarios for now

### Documentation

#### Offline

The offline documentation can be found in the module folder `./node_modules/eventstore-node/docs`.

#### Online

The online documentation can be found at [https://dev.nicdex.com/eventstore-node/docs/](https://dev.nicdex.com/eventstore-node/docs/)

## Getting started

### Install & run Eventstore on localhost

See http://docs.geteventstore.com/introduction/3.9.0/ . 
   
### Example: Storing an event

Save to ```app.js:```

```javascript
var esClient = require('eventstore-node');
var uuid = require('uuid');

var streamName = "testStream";
var esConnection = esClient.createConnection({}, {"hostname": "localhost", "port": 1113});
esConnection.connect();
esConnection.once('connected', function (tcpEndPoint) {
    console.log('Connected to eventstore at ' + tcpEndPoint.hostname + ":" + tcpEndPoint.port);
});

var eventId = uuid.v4();
var eventData = {
    a : Math.random(), 
    b: uuid.v4()
};
var event = esClient.createJsonEventData(eventId, eventData, null, 'testEvent');
console.log("Appending...");
esConnection.appendToStream(streamName, esClient.expectedVersion.any, event)
    .then(function(result) {
        console.log("Stored event:", eventId);
        console.log("Look for it at: http://localhost:2113/web/index.html#/streams/testStream");
        esConnection.close();
    })
    .catch(function(err) {
        console.log(err);
    });
```

Run:

```json
npm install uuid
npm install eventstore-node
node app.js
```

### Example: Subscribing to events

```cd samples```

To subscribe to all events from now on (includes example of a filter which ignores events which we aren't interested in):

```node subscribe-all-events.js```

To catch up on all events ever and subscribe to all new ones from now on:

```node subscribe-catchup-all-events.js```

To generate a test event, open a separate console and run:

```node store-event.js```

## Running the tests

To run the tests it is recommended that you use an in-memory instance of the eventstore so you don't pollute your dev instance.

    EventStore.ClusterNode.exe --memdb

To execute the tests suites simply run

    npm test

## Porting .Net Task to Node.js

.Net Task have been replace with Promise. When executing an async command, i.e. appendToStream you can use then/catch to wait for result/error.

## License

Ported code is released under the MIT license, see [LICENSE](https://github.com/nicdex/eventstore-node/blob/master/LICENSE). 
 
Original code is released under the EventStore license and can be found at https://github.com/eventstore/eventstore.
