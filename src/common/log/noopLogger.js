function NoopLogger() {
}
NoopLogger.prototype.debug = function() {};
NoopLogger.prototype.info = function() {};
NoopLogger.prototype.warn = function() {};
NoopLogger.prototype.error = function() {};

module.exports = NoopLogger;
