const uuid = require('uuid')
const Client = require('../lib/')
// const client = require("node-eventstore-client")

const client = new Client({
  connection: {
    name: 'local-instance',
    endpoint: 'tcp://localhost:1113',
    settings: {}
  },
  credentials: {
    username: 'admin',
    password: 'changeit'
  }
})

function writeTestEvent () {
  return client.writeStream(
    `test-${uuid.v4()}`,
    {
      eventType: 'TestEvent',
      metadata: { timestamp: new Date().toISOString() },
      data: { abc: 123 }
    }
  )
}

writeTestEvent()
  .then(writeResult => {
    console.log(writeResult)

    client.disconnect()
  })
  .catch((err) => {
    console.error('something went wrong', err)

    client.disconnect()
  })
