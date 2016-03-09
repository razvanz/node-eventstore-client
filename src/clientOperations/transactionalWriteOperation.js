var util = require('util');
var uuid = require('uuid');

var TcpCommand = require('../systemData/tcpCommand');
var InspectionDecision = require('../systemData/inspectionDecision');
var InspectionResult = require('./../systemData/inspectionResult');
var ClientMessage = require('../messages/clientMessage');

var OperationBase = require('../clientOperations/operationBase');


function TransactionalWriteOperation(log, cb, requireMaster, transactionId, events, userCredentials) {
  OperationBase.call(this, log, cb, TcpCommand.TransactionWrite, TcpCommand.TransactionWriteCompleted, userCredentials);
  this._responseType = ClientMessage.TransactionWriteCompleted;

  this._requireMaster = requireMaster;
  this._transactionId = transactionId;
  this._events = events;
}
util.inherits(TransactionalWriteOperation, OperationBase);

TransactionalWriteOperation.prototype._createRequestDto = function() {
  var dtos = this._events.map(function(ev) {
    var eventId = new Buffer(uuid.parse(ev.eventId));
    return new ClientMessage.NewEvent({
      event_id: eventId, event_type: ev.type,
      data_content_type: ev.isJson ? 1 : 0, metadata_content_type: 0,
      data: ev.data, metadata: ev.metadata});
  });
  return new ClientMessage.TransactionWrite(this._transactionId, dtos, this._requireMaster);
};

TransactionalWriteOperation.prototype._inspectResponse = function(response) {
  switch (response.result)
  {
    case ClientMessage.OperationResult.Success:
      this._succeed();
      return new InspectionResult(InspectionDecision.EndOperation, "Success");
    case ClientMessage.OperationResult.PrepareTimeout:
      return new InspectionResult(InspectionDecision.Retry, "PrepareTimeout");
    case ClientMessage.OperationResult.CommitTimeout:
      return new InspectionResult(InspectionDecision.Retry, "CommitTimeout");
    case ClientMessage.OperationResult.ForwardTimeout:
      return new InspectionResult(InspectionDecision.Retry, "ForwardTimeout");
    case ClientMessage.OperationResult.AccessDenied:
      this.fail(new Error("Write access denied."));
      return new InspectionResult(InspectionDecision.EndOperation, "AccessDenied");
    default:
      throw new Error(util.format("Unexpected OperationResult: %s.", response.result));
  }
};

TransactionalWriteOperation.prototype._transformResponse = function(response) {
  return null;
};

TransactionalWriteOperation.prototype.toString = function() {
  return util.format("TransactionId: %s", this._transactionId);
};

module.exports = TransactionalWriteOperation;
