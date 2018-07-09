const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function isValidId(id) {
  if (typeof id !== 'string') return false;
  return uuidRegex.test(id);
}

/**
 * Create an EventData
 * @private
 * @param {string} eventId
 * @param {string} type
 * @param {boolean} [isJson]
 * @param {Buffer} [data]
 * @param {Buffer} [metadata]
 * @constructor
 */
function EventData(eventId, type, isJson, data, metadata) {
  if (!isValidId(eventId)) throw new TypeError("eventId must be a string containing a UUID.");
  if (typeof type !== 'string' || type === '') throw new  TypeError("type must be a non-empty string.");
  if (isJson && typeof isJson !== 'boolean') throw new TypeError("isJson must be a boolean.");
  if (data && !Buffer.isBuffer(data)) throw new TypeError("data must be a Buffer.");
  if (metadata && !Buffer.isBuffer(metadata)) throw new TypeError("metadata must be a Buffer.");

  this.eventId = eventId;
  this.type = type;
  this.isJson = isJson || false;
  this.data = data || new Buffer(0);
  this.metadata = metadata || new Buffer(0);
  Object.freeze(this);
}

module.exports = EventData;
