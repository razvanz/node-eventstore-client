var client = require('../../src/client');
var uuid = require('uuid');

var settings = {
  log: {
    info: console.log,
    error: console.log,
    debug: console.log
  }
};
var gossipSeeds = [
  new client.GossipSeed({host: 'localhost', port: 1113}),
  new client.GossipSeed({host: 'localhost', port: 2113}),
  new client.GossipSeed({host: 'localhost', port: 3113})
];

var conn = client.createConnection(settings, gossipSeeds);
console.log('Connecting...');
conn.on('connected', function (tcpEndPoint) {
  console.log('Connect to', tcpEndPoint);
  setTimeout(function () {
    conn.appendToStream('test-' + uuid.v4(), client.expectedVersion.noStream, [
      client.createJsonEventData(uuid.v4(), {abc: 123}, {}, 'myEvent')
    ]);
  }, 5000);
});
conn.on('error', function (err) {
  console.log(err.stack);
});
conn.on('closed', function (reason) {
  console.log('Connection closed:', reason);
  process.exit(-1);
});
conn.connect()
  .catch(function (err) {
    console.log(err.stack);
    process.exit(-1);
  });
