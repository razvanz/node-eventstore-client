var util = require('util');

function WrongExpectedVersionError(action, stream, expectedVersion) {
  Error.captureStackTrace(this, this.constructor);
  this.name = this.constructor.name;
  this.message = util.format("%s failed due to WrongExpectedVersion. Stream: %s Expected version: %d.", action, stream, expectedVersion);
  this.action = action;
  this.stream = stream;
  this.expectedVersion = expectedVersion;
}
util.inherits(WrongExpectedVersionError, Error);

module.exports = WrongExpectedVersionError;