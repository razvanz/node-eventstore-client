const uuid = require('uuid')
const Client = require('../lib/')

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

;(async () => {
  console.log(
    await client.writeStream(
      `test-${uuid.v4()}`,
      {
        eventType: 'TestEvent',
        metadata: { timestamp: new Date().toISOString() },
        data: { id: uuid.v4(), message: 'default data' }
      }
    )
  )

  await client.disconnect()
})()
