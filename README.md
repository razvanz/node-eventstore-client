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

## Getting started

Install the client using npm

    npm install eventstore-node
    
Examples

    TODO


## Porting .Net Task to Node.js

.Net Task have been replace with Promise. When executing an async command, i.e. appendToStream you can use then/catch to wait for result/error.

*Example*

    connection
      .appendToStream('myStream', client.expectedVersion.any, events, userCredentials)
      .then(function(result) {
        //Do something with the WriteResult here
      })
      .catch(function(err) {
        //Handle error here
      });

## Running the tests

To run the tests you will need

- To install the dependencies (`npm install`)
- Run an instance of EventStore >= 3.3.0 (competing consumers are required for test) on localhost:1113 (Download [here](https://geteventstore.com/downloads/))

To execute the tests suites simply run test with npm

    npm test

## License

Ported code is released under the MIT license, see [LICENSE](https://github.com/nicdex/eventstore-node/blob/master/LICENSE). 
 
Original code is released under the EventStore license and can be found at https://github.com/eventstore/eventstore.
