const { Client } = require('../')

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
  console.log(await client.readStream('$ce-Test', 0, 1))

  await client.disconnect()
})()
