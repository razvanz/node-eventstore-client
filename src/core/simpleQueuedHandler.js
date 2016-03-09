function typeName(t) {
  if (typeof t === 'function')
    return t.name;
  if (typeof t === 'object')
    return t.constructor.name;
  throw new TypeError('type must be a function or object, not ' + typeof t);
}

function SimpleQueuedHandler() {
  this._handlers = {};
  this._messages = [];
  this._isProcessing = false;
}

SimpleQueuedHandler.prototype.registerHandler = function(type, handler) {
  type = typeName(type);
  this._handlers[type] = handler;
};

SimpleQueuedHandler.prototype.enqueueMessage = function(msg) {
  this._messages.push(msg);
  if (!this._isProcessing) {
    this._isProcessing = true;
    setImmediate(this._processQueue.bind(this));
  }
};

SimpleQueuedHandler.prototype._processQueue = function() {
  var message = this._messages.shift();
  while(message) {
    var type = typeName(message);
    var handler = this._handlers[type];
    if (!handler)
        throw new Error("No handler registered for message " + type);
    setImmediate(handler, message);
    message = this._messages.shift();
  }
  this._isProcessing = false;
};

module.exports = SimpleQueuedHandler;