// const client = require('../src/client')
const client = require("eventstore-node")
const uuid = require("uuid")

const settings = {
  verboseLogging: true,
  log: new client.FileLogger("./simple-verbose.log")
}
const gossipSeeds = [
  new client.GossipSeed({host: "192.168.33.10", port: 2113}),
  new client.GossipSeed({host: "192.168.33.11", port: 2113}),
  new client.GossipSeed({host: "192.168.33.12", port: 2113})
]
const connection = client.createConnection(settings, gossipSeeds)

connection.connect().catch(err => console.log(err))

connection.on("connected", endPoint => {
  console.log(`connected to endPoint ${endPoint}`)

  setInterval(() => {
    connection.appendToStream(
      `test-${uuid.v4()}`,
      client.expectedVersion.noStream,
      [
        client.createJsonEventData(
          uuid.v4(),
          { abc: 123 },
          null,
          "MyEvent"
        )
      ]
    ).then(writeResult => console.log(writeResult))
  }, 1000)
})

connection.on("error", error =>
  console.log(`Error occurred on connection: ${error}`)
)

connection.on("closed", reason =>
  console.log(`Connection closed, reason: ${reason}`)
)

process.stdin.setRawMode(true)
process.stdin.resume()
process.stdin.on("data", process.exit.bind(process, 0))
