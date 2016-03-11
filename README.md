# eventstore-node
A port of the EventStore .Net ClientAPI to Node.js

## Dependencies

- Node.js >= 0.12
- protobufjs module
- uuid module

## Status

Unstable

Incomplete/missing features:

- Ssl connection: not implemented yet
- Typed errors: currently most errors are direct instance of Error, which is not practical for error handling
- Performance: there's still some while loop in the code that could be problematic with node.js
- Tests: tests are only covering happy path scenarios for now
- Cluster connection: not implemented yet
- Set system settings: not implemented yet
- NPM package: no package released yet, I will release one when code is stable

## Porting .Net Task to Node.js

I used Promise to replace .Net Task, so when executing an async command, i.e. appendToStream you'll have to wait for result/error like this:

    connection
      .appendToStream('myStream', client.expectedVersion.any, events, userCredentials)
      .then(function(result) {
        //Do something with the WriteResult here
      })
      .catch(function(err) {
        //Handle error here
      });

## Running the tests
You will need:

- dependencies (`npm install`)
- nodeunit (`npm install -g nodeunit`)
- an instance of EventStore running on localhost:1113 (https://geteventstore.com/downloads/)

To execute the tests suites simply run test with npm

    npm test

## License

This is a port, original code is released under the EventStore license and can be found at https://github.com/eventstore/eventstore.
Ported code is released under the MIT license, see https://github.com/nicdex/eventstore-node/blob/master/LICENSE
