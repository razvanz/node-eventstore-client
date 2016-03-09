var uuid = require('uuid');
var EventStoreNodeConnection = require('./eventStoreNodeConnection');
var StaticEndpointDiscoverer = require('./core/staticEndpointDiscoverer');
var NoopLogger = require('./common/log/noopLogger');
var EventData = require('./eventData');
var results = require('./results');
var UserCredentials = require('./systemData/userCredentials');

var defaultConnectionSettings = {
  log: new NoopLogger(),
  verboseLogging: false,

  maxQueueSize: 5000,
  maxConcurrentItems: 5000,
  maxRetries: 10,
  maxReconnections: 10,

  requireMaster: true,

  reconnectionDelay: 100,
  operationTimeout: 7*1000,
  operationTimeoutCheckPeriod: 1000,

  defaultUserCredentials: null,
  useSslConnection: false,
  targetHost: null,
  validateServer: false,

  failOnNoServerResponse: false,
  heartbeatInterval: 750,
  heartbeatTimeout: 1500,
  clientConnectionTimeout: 1000
};

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

function merge(a,b) {
  var c = {};
  Object.getOwnPropertyNames(a).forEach(function(k) {
    c[k] = a[k];
  });
  Object.getOwnPropertyNames(b).forEach(function(k) {
    c[k] = b[k];
  });
  return c;
}

/**
 * Create an EventStore connection
 * @param {object} tcpEndpoint
 * @param {object} settings
 * @returns {EventStoreNodeConnection}
 */
function connectionFactory(tcpEndpoint, settings) {
  var mergedSettings = merge(defaultConnectionSettings, settings);
  var endpointDiscoverer = new StaticEndpointDiscoverer(tcpEndpoint, settings.useSslConnection);
  var connectionName = null;
  return new EventStoreNodeConnection(mergedSettings, endpointDiscoverer, connectionName);
}

module.exports = connectionFactory;
module.exports.expectedVersion = expectedVersion;
module.exports.createEventData = eventDataFactory;
module.exports.createJsonEventData = jsonEventDataFactory;
module.exports.positions = positions;

/**
 * @param {string} username
 * @param {string} password
 * @returns {UserCredentials}
 */
module.exports.createUserCredentials = function(username, password) {
  return new UserCredentials(username, password);
};