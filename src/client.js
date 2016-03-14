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
 * @param {string} eventId
 * @param {object} data
 * @param {object} [metadata]
 * @param {string} [type]
 * @returns {EventData}
 */
function jsonEventDataFactory(eventId, data, metadata, type) {
  if (!data || typeof data !== 'object') throw new TypeError("data must be an object.");

  var d = new Buffer(JSON.stringify(data));
  var m = metadata ? new Buffer(JSON.stringify(metadata)) : null;
  return new EventData(eventId, type || data.constructor.name, true, d, m);
}

/**
 * @param {string} eventId
 * @param {string} type
 * @param {boolean} isJson
 * @param {Buffer} data
 * @param {Buffer} [metadata]
 * @returns {EventData}
 */
function eventDataFactory(eventId, type, isJson, data, metadata) {
  return new EventData(eventId, type, isJson, data, metadata);
}

// Exporting classes
module.exports.EventStoreConnection = require('./eventStoreConnection');
module.exports.UserCredentials = require('./systemData/userCredentials');
module.exports.EventData = EventData;
module.exports.PersistentSubscriptionSettings = require('./persistentSubscriptionSettings');
module.exports.SystemConsumerStrategies = require('./systemConsumerStrategies');
// Exporting errors
module.exports.WrongExpectedVersionError = require('./errors/wrongExpectedVersionError');
module.exports.StreamDeletedError = require('./errors/streamDeletedError');
module.exports.AccessDeniedError = require('./errors/accessDeniedError');
// Exporting enums/constants
module.exports.expectedVersion = expectedVersion;
module.exports.positions = positions;
module.exports.systemMetadata = require('./common/systemMetadata');
module.exports.eventReadStatus = results.EventReadStatus;
// Helper functions
module.exports.createConnection = module.exports.EventStoreConnection.create;
module.exports.createEventData = eventDataFactory;
module.exports.createJsonEventData = jsonEventDataFactory;