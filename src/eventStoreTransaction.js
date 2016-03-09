/**
 * @param {number} transactionId
 * @param {UserCredentials} userCredentials
 * @param {EventStoreNodeConnection} connection
 * @constructor
 * @property {number} transactionId
 */
function EventStoreTransaction(transactionId, userCredentials, connection) {
  this._transactionId = transactionId;
  this._userCredentials = userCredentials;
  this._connection = connection;

  this._isCommitted = false;
  this._isRolledBack = false;
}
Object.defineProperty(EventStoreTransaction.prototype, 'transactionId', {
  get: function() {
    return this._transactionId;
  }
});

/**
 * Commit (async)
 * @returns {Promise.<WriteResult>}
 */
EventStoreTransaction.prototype.commit = function() {
  if (this._isRolledBack) throw new Error("Can't commit a rolledback transaction.");
  if (this._isCommitted) throw new Error("Transaction is already committed.");
  this._isCommitted = true;
  return this._connection.commitTransaction(this, this._userCredentials);
};

/**
 * Write events (async)
 * @param {Array.<EventData>} events
 * @returns {Promise}
 */
EventStoreTransaction.prototype.write = function(events) {
  if (this._isRolledBack) throw new Error("can't write to a rolledback transaction");
  if (this._isCommitted) throw new Error("Transaction is already committed");
  if (!Array.isArray(events)) throw new Error("events must be an array.");
  return this._connection.transactionalWrite(this, events);
};

/**
 * Rollback
 */
EventStoreTransaction.prototype.rollback = function() {
  if (this._isCommitted) throw new Error("Transaction is already committed");
  this._isRolledBack = true;
};

module.exports = EventStoreTransaction;