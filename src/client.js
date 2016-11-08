var EventData = require('./eventData');
var results = require('./results');

const expectedVersion = {
  any: -2,
  noStream: -1,
  emptyStream: -1
};
const positions = {
  start: new results.Position(0, 0),
  end: new results.Position(-1, -1)
};

/**
 * Create an EventData object from JavaScript event/metadata that will be serialized as json
 * @public
 * @param {string} eventId    Event UUID
 * @param {object} event      Event object
 * @param {object} [metadata] Event metadata
 * @param {string} [type]     Event type
 * @returns {EventData}
 */
module.exports.createJsonEventData = function (eventId, event, metadata, type) {
  if (!event || typeof event !== 'object') throw new TypeError("data must be an object.");

  var eventBuf = new Buffer(JSON.stringify(event));
  var metaBuf = metadata ? new Buffer(JSON.stringify(metadata)) : null;
  return new EventData(eventId, type || event.constructor.name, true, eventBuf, metaBuf);
};

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
module.exports.createEventData = function (eventId, type, isJson, data, metadata) {
  return new EventData(eventId, type, isJson, data, metadata);
};

// Expose classes
module.exports.EventStoreConnection = require('./eventStoreConnection');
module.exports.UserCredentials = require('./systemData/userCredentials');
module.exports.EventData = EventData;
module.exports.PersistentSubscriptionSettings = require('./persistentSubscriptionSettings');
module.exports.SystemConsumerStrategies = require('./systemConsumerStrategies');
module.exports.GossipSeed = require('./gossipSeed');
// Expose errors
module.exports.WrongExpectedVersionError = require('./errors/wrongExpectedVersionError');
module.exports.StreamDeletedError = require('./errors/streamDeletedError');
module.exports.AccessDeniedError = require('./errors/accessDeniedError');
// Expose enums/constants
module.exports.expectedVersion = expectedVersion;
module.exports.positions = positions;
module.exports.systemMetadata = require('./common/systemMetadata');
module.exports.eventReadStatus = results.EventReadStatus;
module.exports.sliceReadStatus = require('./sliceReadStatus');
// Expose loggers
module.exports.NoopLogger = require('./common/log/noopLogger');
module.exports.FileLogger = require('./common/log/fileLogger');
// Expose Helper functions
module.exports.createConnection = module.exports.EventStoreConnection.create;