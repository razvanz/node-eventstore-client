var EventStoreNodeConnection = require('./eventStoreNodeConnection');
var StaticEndpointDiscoverer = require('./core/staticEndpointDiscoverer');
var NoopLogger = require('./common/log/noopLogger');

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
 * @param {object} settings
 * @param {object} tcpEndPoint
 * @param {string} [connectionName]
 * @returns {EventStoreNodeConnection}
 */
module.exports.create = function(settings, tcpEndPoint, connectionName) {
  //TODO: cluster connection
  var mergedSettings = merge(defaultConnectionSettings, settings || {});
  var endpointDiscoverer = new StaticEndpointDiscoverer(tcpEndPoint, settings.useSslConnection);
  return new EventStoreNodeConnection(mergedSettings, endpointDiscoverer, connectionName || null);
};