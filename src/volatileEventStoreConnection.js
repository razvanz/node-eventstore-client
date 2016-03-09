var util = require('util');

var EventStoreSubsription = require('./eventStoreSubscription');

/**
 * @param {SubscriptionOperation} subscriptionOperation
 * @param {string} streamId
 * @param {Position} lastCommitPosition
 * @param {number} lastEventNumber
 * @constructor
 * @augments {EventStoreSubscription}
 */
function VolatileEventStoreConnection(subscriptionOperation, streamId, lastCommitPosition, lastEventNumber) {
  EventStoreSubsription.call(this, streamId, lastCommitPosition, lastEventNumber);

  this._subscriptionOperation = subscriptionOperation;
}
util.inherits(VolatileEventStoreConnection, EventStoreSubsription);

VolatileEventStoreConnection.prototype.unsubscribe = function() {
  this._subscriptionOperation.unsubscribe();
};

module.exports = VolatileEventStoreConnection;
