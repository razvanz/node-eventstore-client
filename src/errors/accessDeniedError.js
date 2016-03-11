var util = require('util');

function AccessDeniedError(action, stream) {
  Error.captureStackTrace(this, this.constructor);
  this.name = this.constructor.name;
  this.message = util.format("%s access denied for stream '%s'.", action, stream);
  this.action = action;
  this.stream = stream;
}
util.inherits(AccessDeniedError, Error);

module.exports = AccessDeniedError;