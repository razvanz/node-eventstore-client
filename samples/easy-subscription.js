const Client = require('../lib/')
// const client = require("node-eventstore-client")

const { enums: { PersistentSubscriptionNakEventAction } } = Client

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

function onEvent (event) {
  if (!event.data.username || !event.data.password) {
    console.log(`NACK ${event.eventId} with action: ${PersistentSubscriptionNakEventAction.Park}`)
    event.nack(PersistentSubscriptionNakEventAction.Park)
    return
  }

  console.log(`ACK ${event.eventId}`)
  event.ack()
}

client.connectPersistentSubscription('UserEvents', 'test', onEvent)
