//NOTE: this script require node.js v8+ to run (native async/await)
var uuid = require('uuid');
var client = require('../src/client');
var conn = client.createConnection({}, 'tcp://localhost:1113');
conn.on('connected', onConnected);

var batchSize = parseInt(process.argv[2], 10) || 500;
const MB = 1024*1024;
const adminCreds = new client.UserCredentials("admin", "changeit");
const nbEvents = 50000;
const events = [];
const streams = [];
const writeOneStream = 'testWrite-' + uuid.v4();
for(var i = 0; i < nbEvents; i++) {
  streams.push('testWrite-' + uuid.v4());
  events.push(client.createJsonEventData(uuid.v4(), {a:i, b:i+1, c:i+2}, null, 'myEvent'))
}
conn.connect();

function rssMB() {
  return (process.memoryUsage().rss / MB).toFixed(2);
}

function reportResult(action, nbEvents, elapsedMs) {
  console.log(action, nbEvents, 'events took', elapsedMs, 'ms, avg', (nbEvents/(elapsedMs/1000)).toFixed(2), '/s');
  console.log('Memory usage:', rssMB(), 'MB\n');
}

async function testWriteOneStreamAnyVersion(batchSize) {
  console.log(`Test Write One Stream Any Version (batchSize = ${batchSize})...`);
  const start = Date.now();
  const promises = [];
  for(let i = 0; i < nbEvents; i += batchSize) {
    promises.push(conn.appendToStream(writeOneStream, client.expectedVersion.any, events.slice(i, i + batchSize)))
  }
  await Promise.all(promises);
  var diff = Date.now() - start;
  reportResult("Writing", nbEvents, diff)
}

async function testWriteOneStreamWithVersion(batchSize) {
  console.log(`Test Write One Stream With Version (batchSize = ${batchSize})...`);
  const writeStream = 'testWrite-' + uuid.v4();
  const start = Date.now();
  const promises = [];
  for(let i = 0; i < nbEvents; i += batchSize) {
    promises.push(conn.appendToStream(writeStream, i-1, events.slice(i, i + batchSize)))
  }
  await Promise.all(promises);
  var diff = Date.now() - start;
  reportResult("Writing", nbEvents, diff)
}

async function testWriteMultipleStream() {
  console.log('Test Write Multiple Streams...');
  var start = Date.now();
  var promises = [];
  for(var i = 0; i < nbEvents; i++) {
    promises.push(conn.appendToStream(streams[i], client.expectedVersion.emptyStream, events[i]))
  }
  await Promise.all(promises);
  const diff = Date.now() - start;
  reportResult("Writing", nbEvents, diff)
}

async function testRead(batchSize) {
  console.log(`Test Read One Stream (batchSize = ${batchSize})...`);
  const start = Date.now();
  const promises = [];
  for(let i = 0; i < nbEvents; i += batchSize) {
    promises.push(conn.readStreamEventsForward(writeOneStream, i, batchSize, false));
  }
  const results = await Promise.all(promises);
  const diff = Date.now() - start;
  const readEvents = results.reduce((x,y) => x + y.events.length, 0);
  reportResult("Reading", readEvents, diff)
}

async function testReadAll(batchSize) {
  console.log(`Test Read from $all (batchSize = ${batchSize})...`);
  const start = Date.now();
  let pos = client.positions.start;
  let eventsCount = 0;
  for(;;) {
    var result = await conn.readAllEventsForward(pos, batchSize, false, adminCreds);
    pos = result.nextPosition;
    eventsCount += result.events.length;
    if (result.isEndOfStream) break;
  }
  const diff = Date.now() - start;
  reportResult("Reading", eventsCount, diff)
}

async function onConnected() {
  try {
    await testWriteOneStreamAnyVersion(1);
    await testWriteOneStreamAnyVersion(batchSize);
    await testWriteOneStreamWithVersion(1);
    await testWriteOneStreamWithVersion(batchSize);
    await testWriteMultipleStream();
    await testRead(1);
    await testRead(batchSize);
    await testReadAll(batchSize);
    conn.close();
  } catch (e) {
    console.log('ERROR', e);
  }
}
