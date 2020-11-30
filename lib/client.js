const uuid = require('uuid')
const esClient = require('../src/client')

const decodeEvent = rawEvent => rawEvent.event
  ? ({
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
    originalEventNumber: rawEvent.originalEventNumber
  })
  : null // Original event was deleted

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
    const credentials = options.credentials || this.options.credentials
    const resolveLinkTos = options.resolveLinkTos !== undefined
      ? options.resolveLinkTos
      : this.options.resolveLinkTos
    const decode = options.decode !== undefined ? options.decode : true
    const res = await (
      count >= 0
        ? this._session.readStreamEventsForward(stream, offset, count, resolveLinkTos, credentials)
        : this._session.readStreamEventsBackward(stream, offset, -count, resolveLinkTos, credentials)
    )

    return decode
      ? { ...res, events: res.events.map(decodeEvent).filter(e => e) }
      : res
  }

  async writeStream (stream, events, options) {
    await this._ensureConnected()

    options = options || {}
    const credentials = options.credentials || this.options.credentials
    const expectedVersion = options.expectedVersion || this.options.expectedVersion

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
    const credentials = options.credentials || this.options.credentials
    const expectedVersion = options.expectedVersion || this.options.expectedVersion
    const hardDelete = options.hardDelete !== undefined ? options.hardDelete : this.options.hardDelete

    return this._session.deleteStream(stream, expectedVersion, hardDelete, credentials)
  }

  // Subscription actions

  async connectPersistentSubscription (stream, group, eventHandler, dropHandler, options) {
    if (typeof dropHandler !== 'function') {
      options = dropHandler
      dropHandler = function noop () {}
    }

    await this._ensureConnected()

    options = options || {}
    const credentials = options.credentials || this.options.credentials
    const bufferSize = options.bufferSize || this.options.subscription.bufferSize
    const autoAck = options.autoAck || this.options.subscription.autoAck

    const onEventAppeared = async function (subscription, rawEvent) {
      // Ignore deleted events
      if (!rawEvent.event) return subscription.acknowledge(rawEvent)

      const event = {
        ...decodeEvent(rawEvent),
        // Functions
        ack: () => subscription.acknowledge(rawEvent),
        nack: (action, reason) => subscription.fail(rawEvent, action, reason)
      }

      try {
        await eventHandler(event, subscription)
      } catch (e) {
        event.nack(esClient.PersistentSubscriptionNakEventAction.Park, e.message)
      }
    }
    const onSubscriptionDropped = function (subscription, reason, error) {
      if (!error) {
        error = new Error('Subscription dropped generic error')
      }

      error.reason = reason

      // Notify drop at the end of the event loop to allow processing to finish
      setImmediate(dropHandler, error)
    }

    return this._session.connectToPersistentSubscription(
      stream, group, onEventAppeared, onSubscriptionDropped, credentials, bufferSize, autoAck
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
      PersistentSubscriptionNakEventAction: esClient.PersistentSubscriptionNakEventAction
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
