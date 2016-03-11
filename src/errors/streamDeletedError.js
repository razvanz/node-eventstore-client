var util = require('util');

function StreamDeletedError(stream) {
  Error.captureStackTrace(this, this.constructor);
  this.name = this.constructor.name;
  this.message = util.format("Event stream '%s' is deleted.", stream);
  this.stream = stream;
}
util.inherits(StreamDeletedError, Error);

module.exports = StreamDeletedError;