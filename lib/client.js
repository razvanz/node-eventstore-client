const uuid = require('uuid')
const esClient = require('../src/client')

// Libs
const PersistentSubscriptionNakEventAction = require('../src/persistentSubscriptionNakEventAction.js')

module.exports = class Client {
  constructor (options) {
    this.options = options
    this._session = null
  }

  connect () {
    return new Promise((resolve, reject) => {
      const { settings, endpoint, name } = this.options.connection
      const connection = esClient.createConnection(settings, endpoint, name)

      const onClose = reason => {
        this._session = null
      }
      const onceError = err => {
        reject(err)
      }
      const onceConnected = () => {
        this._session = connection
        resolve(connection)
      }

      connection.once('error', onceError)
      connection.once('connected', onceConnected)
      connection.on('closed', onClose)
      connection.connect()
        .catch(err => reject(err))
    })
  }

  disconnect () {
    return new Promise((resolve, reject) => {
      const connection = this._session

      if (!connection) {
        resolve()
        return
      }

      const onceError = err => {
        reject(err)
      }
      const onceDisconnected = () => {
        this._session = null
        resolve()
      }

      connection.once('error', onceError)
      connection.once('disconnected', onceDisconnected)
      connection.close()
    })
  }

  _ensureConnected () {
    if (!this._session) return this.connect()

    return Promise.resolve(this._session)
  }

  /*
   * API
   */

  // Stream actions

  async readStream (stream, offset, count, options) {
    await this._ensureConnected()

    options = options || {}
    const resolveLinkTos = this.options.resolveLinkTos !== undefined || options.resolveLinkTos
    const credentials = this.options.credentials || options.credentials

    return count >= 0
      ? this._session.readAllEventsForward(stream, offset, count, resolveLinkTos, credentials)
      : this._session.readAllEventsBackward(stream, offset, count, resolveLinkTos, credentials)
  }

  async writeStream (stream, events, options) {
    await this._ensureConnected()

    options = options || {}
    const expectedVersion = this.options.expectedVersion || options.expectedVersion
    const credentials = this.options.credentials || options.credentials

    if (!Array.isArray(events)) events = [events]

    events = events.map(e => esClient.createJsonEventData(
      e.eventId || uuid.v4(),
      e.data,
      e.metadata,
      e.eventType
    ))

    return this._session.appendToStream(stream, expectedVersion, events, credentials)
  }

  async deleteStream (stream, options) {
    await this._ensureConnected()

    options = options || {}
    const expectedVersion = this.options.expectedVersion || options.expectedVersion
    const hardDelete = this.options.hardDelete !== undefined || options.hardDelete
    const credentials = this.options.credentials || options.credentials

    return this._session.deleteStream(stream, expectedVersion, hardDelete, credentials)
  }

  // Subscription actions

  async connectPersistentSubscription (stream, group, fn, options) {
    await this._ensureConnected()

    options = options || {}
    const bufferSize = this.options.subscription.bufferSize || options.bufferSize
    const autoAck = this.options.subscription.autoAck || options.autoAck
    const credentials = this.options.credentials || options.credentials

    const eventAppeared = function (subscription, rawEvent) {
      const event = {
        stream: rawEvent.event.eventStreamId,
        eventId: rawEvent.event.eventId,
        eventType: rawEvent.event.eventType,
        metadata: rawEvent.event.isJson
          ? JSON.parse(rawEvent.event.metadata.toString('utf8') || '{}')
          : rawEvent.event.metadata,
        data: rawEvent.event.isJson
          ? JSON.parse(rawEvent.event.data.toString('utf8') || '{}')
          : rawEvent.event.data,

        // Extra data
        originalStream: rawEvent.originalStreamId,
        originalPosition: rawEvent.originalPosition,
        originalEventId: rawEvent.originalEvent.eventId,
        originalEventNumber: rawEvent.originalEventNumber,

        // Functions
        ack: () => subscription.acknowledge(rawEvent),
        nack: (action, reason) => subscription.fail(rawEvent, action, reason)
      }

      fn(event, subscription)
    }

    return this._session.connectToPersistentSubscription(
      stream, group, eventAppeared, null, credentials, bufferSize, autoAck
    )
  }

  /*
   * Accessors
   */

  get connection () {
    return this._session
  }

  get options () {
    return this._options
  }

  set options (options) {
    options = Object.assign({ connection: {}, credentials: {}, subscription: {} }, options)

    this._options = {
      connection: {
        name: options.connection.name,
        endpoint: options.connection.endpoint,
        settings: options.connection.settings
      },
      credentials: new esClient.UserCredentials(
        options.credentials.username, options.credentials.password
      ),
      expectedVersion: options.expectedVersion || esClient.expectedVersion.any,
      resolveLinkTos: options.resolveLinkTos || true,
      hardDelete: options.hardDelete || true,
      subscription: {
        autoAck: options.subscription.autoAck || false,
        bufferSize: options.subscription.bufferSize || 10
      }
    }
  }

  static get types () {
    return {
      Position: esClient.Position,
      UserCredentials: esClient.UserCredentials,
      GossipSeed: esClient.GossipSeed,
      PersistentSubscriptionSettings: esClient.PersistentSubscriptionSettings,
      ProjectionsManager: esClient.ProjectionsManager
    }
  }

  static get enums () {
    return {
      expectedVersion: esClient.expectedVersion,
      positions: esClient.positions,
      systemMetadata: esClient.systemMetadata,
      eventReadStatus: esClient.eventReadStatus,
      sliceReadStatus: esClient.sliceReadStatus,
      SystemConsumerStrategies: esClient.SystemConsumerStrategies,
      PersistentSubscriptionNakEventAction: PersistentSubscriptionNakEventAction
    }
  }

  static get errors () {
    return {
      WrongExpectedVersionError: esClient.WrongExpectedVersionError,
      StreamDeletedError: esClient.StreamDeletedError,
      AccessDeniedError: esClient.AccessDeniedError,
      ProjectionCommandFailedError: esClient.ProjectionCommandFailedError
    }
  }

  static get legacy () {
    return esClient
  }
}
