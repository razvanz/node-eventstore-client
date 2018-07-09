var EventData = require('./eventData');
var results = require('./results');

const expectedVersion = {
  any: -2,
  noStream: -1,
  emptyStream: -1,
  streamExists: -4
};
Object.freeze(expectedVersion);

const positions = {
  start: new results.Position(0, 0),
  end: new results.Position(-1, -1)
};
Object.freeze(positions);

const streamPosition = {
  start: 0,
  end: -1
};
Object.freeze(streamPosition);

/**
 * Create an EventData object from JavaScript event/metadata that will be serialized as json
 * @public
 * @param {string} eventId    Event UUID
 * @param {object} event      Event object
 * @param {object} [metadata] Event metadata
 * @param {string} [type]     Event type
 * @returns {EventData}
 */
function createJsonEventData(eventId, event, metadata, type) {
  if (!event || typeof event !== 'object') throw new TypeError("data must be an object.");

  var eventBuf = new Buffer(JSON.stringify(event));
  var metaBuf = metadata ? new Buffer(JSON.stringify(metadata)) : null;
  return new EventData(eventId, type || event.constructor.name, true, eventBuf, metaBuf);
}

/**
 * Create an EventData object from event/metadata buffer(s)
 * @public
 * @param {string} eventId    Event UUID
 * @param {string} type       Event type
 * @param {boolean} isJson    is buffer(s) content json
 * @param {Buffer} data       Data buffer
 * @param {Buffer} [metadata] Metadata buffer
 * @returns {EventData}
 */
function createEventData(eventId, type, isJson, data, metadata) {
  return new EventData(eventId, type, isJson, data, metadata);
}

// Expose classes
exports.Position = results.Position;
exports.UserCredentials = require('./systemData/userCredentials');
exports.PersistentSubscriptionSettings = require('./persistentSubscriptionSettings');
exports.SystemConsumerStrategies = require('./systemConsumerStrategies');
exports.GossipSeed = require('./gossipSeed');
exports.EventStoreConnection = require('./eventStoreConnection');
exports.ProjectionsManager = require('./projections/projectionsManager');
// Expose errors
exports.WrongExpectedVersionError = require('./errors/wrongExpectedVersionError');
exports.StreamDeletedError = require('./errors/streamDeletedError');
exports.AccessDeniedError = require('./errors/accessDeniedError');
exports.ProjectionCommandFailedError = require('./errors/projectionCommandFailedError');
// Expose enums/constants
exports.expectedVersion = expectedVersion;
exports.positions = positions;
exports.streamPosition = streamPosition;
exports.systemMetadata = require('./common/systemMetadata');
exports.eventReadStatus = results.EventReadStatus;
exports.sliceReadStatus = require('./sliceReadStatus');
// Expose loggers
exports.NoopLogger = require('./common/log/noopLogger');
exports.FileLogger = require('./common/log/fileLogger');
// Expose Helper functions
exports.createConnection = require('./eventStoreConnection').create;
exports.createJsonEventData = createJsonEventData;
exports.createEventData = createEventData;
