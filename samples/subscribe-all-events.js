// Subscribe to all new events on the $all stream. Filter out any which aren"t about "user" aggregates.

const client = require('../src/client')
// const client = require("node-eventstore-client")

const resolveLinkTos = false

const belongsToAUserAggregate = event =>
  event.originalEvent.eventStreamId.startsWith("user-")

const eventAppeared = (subscription, event) => {
  if (belongsToAUserAggregate(event)) {
    const aggregateId = event.originalEvent.eventStreamId
    const eventId = event.originalEvent.eventId
    const eventType = event.originalEvent.eventType
    console.log(aggregateId, eventType, eventId)
    console.log(event.originalEvent.data.toString())
  }
}

const subscriptionDropped = (subscription, reason, error) =>
  console.log(error ? error : "Subscription dropped.")

const credentials = new client.UserCredentials("admin", "changeit")

const settings = {}
const endpoint = "tcp://localhost:1113"
const connection = client.createConnection(settings, endpoint)

connection.connect().catch(err => console.log(err))

connection.on('heartbeatInfo', heartbeatInfo => {
  console.log('Connected to endpoint', heartbeatInfo.remoteEndPoint)
  console.log('Heartbeat latency', heartbeatInfo.responseReceivedAt - heartbeatInfo.requestSentAt)
})

connection.once("connected", tcpEndPoint => {
  console.log(`Connected to eventstore at ${tcpEndPoint.host}:${tcpEndPoint.port}`)
  connection.subscribeToAll(
    resolveLinkTos,
    eventAppeared,
    subscriptionDropped,
    credentials
  ).then(subscription => {
    console.log(`subscription.isSubscribedToAll: ${subscription.isSubscribedToAll}`),
    console.log("(To generate a test event, try running 'node store-event.js' in a separate console.)")
  })
})

connection.on("error", error =>
  console.log(`Error occurred on connection: ${error}`)
)

connection.on("closed", reason =>
  console.log(`Connection closed, reason: ${reason}`)
)
