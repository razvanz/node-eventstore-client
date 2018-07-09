const util = require('util');

function ProjectionCommandFailedError(httpStatusCode, message) {
  Error.captureStackTrace(this, this.constructor);
  this.httpStatusCode = httpStatusCode;
  this.message = message;
}
util.inherits(ProjectionCommandFailedError, Error);

module.exports = ProjectionCommandFailedError;