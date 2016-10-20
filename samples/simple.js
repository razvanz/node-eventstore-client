var client = require('../src/client');
var uuid = require('uuid');

var settings = {
  verboseLogging: true,
  log: new client.FileLogger('./simple-verbose.log')
};
var gossipSeeds = [
    new client.GossipSeed({hostname: 'localhost', port: 1113}),
    new client.GossipSeed({hostname: 'localhost', port: 2113}),
    new client.GossipSeed({hostname: 'localhost', port: 3113})
  ];
var conn = client.createConnection(settings, gossipSeeds);
conn.connect()
  .catch(function (err) {
    console.log(err);
    //process.exit(-1);
  });
conn.on('connected', function (endPoint) {
  console.log('connected to endPoint', endPoint);
  //Start some work
  setInterval(function () {
    conn.appendToStream('test-' + uuid.v4(), client.expectedVersion.noStream, [
      client.createJsonEventData(uuid.v4(), {abc: 123}, null, 'MyEvent')
    ]).then(function (writeResult) {
      console.log(writeResult);
    });
  }, 1000);
});
conn.on('error', function (err) {
  console.log('Error occurred on connection:', err);
});
conn.on('closed', function (reason) {
  console.log('Connection closed, reason:', reason);
  //process.exit(-1);
});
process.stdin.setRawMode(true);
process.stdin.resume();
process.stdin.on('data', process.exit.bind(process, 0));