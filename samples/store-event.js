// const client = require('../src/client')
const client = require("eventstore-node")
const uuid = require("uuid")

const settings = {}
const endpoint = { host: "localhost", port: 1113 }
const connection = client.createConnection(settings, endpoint)

connection.connect().catch(err => console.log(err))

connection.once("connected", tcpEndPoint => {
  const userId = uuid.v4()

  const userCreatedEvent = {
    id: userId,
    username: `user${uuid.v4().substring(0,6)}`,
    password: Math.random().toString()
  }

  const event = client.createJsonEventData(
    uuid.v4(),
    userCreatedEvent,
    null,
    "UserCreated"
  )

  // Every user has their own stream of events:
  const streamName = `user-${userId}`

  console.log(`Connected to eventstore at ${tcpEndPoint.host}:${tcpEndPoint.port}`)
  console.log(`Storing event. Look for it at http://localhost:2113/web/index.html#/streams/user-${userId}`)

  connection.appendToStream(streamName, client.expectedVersion.any, event)
    .then(result => {
      console.log("Event stored.")
      process.exit(0)
    })
    .catch(error => {
      console.log(error)
      process.exit(-1)
    })
})

connection.on("error", error => {
  console.log(`Error occurred on connection: ${error}`)
  process.exit(-1)
})

connection.on("closed", reason => {
  console.log(`Connection closed, reason: ${reason}`)
  process.exit(-1)
})
