var util = require('util');

var ensure = require('../common/utils/ensure');
var OperationBase = require('../clientOperations/operationBase');
var TcpCommand = require('../systemData/tcpCommand');
var ClientMessage = require('../messages/clientMessage');
var SystemConsumerStrategies = require('../systemConsumerStrategies');
var InspectionDecision = require('../systemData/inspectionDecision');
var InspectionResult = require('./../systemData/inspectionResult');
var results = require('../results');


function UpdatePersistentSubscriptionOperation(log, cb, stream, groupName, settings, userCredentials) {
  OperationBase.call(this, log, cb, TcpCommand.UpdatePersistentSubscription, TcpCommand.UpdatePersistentSubscriptionCompleted, userCredentials);

  ensure.notNull(settings, "settings");
  this._resolveLinkTos = settings.resolveLinkTos;
  this._stream = stream;
  this._groupName = groupName;
  this._startFromBeginning = settings.startFrom;
  this._maxRetryCount = settings.maxRetryCount;
  this._liveBufferSize = settings.liveBufferSize;
  this._readBatchSize = settings.readBatchSize;
  this._bufferSize = settings.historyBufferSize;
  this._recordStatistics = settings.extraStatistics;
  this._messageTimeoutMilliseconds = settings.messageTimeout;
  this._checkPointAfter = settings.checkPointAfter;
  this._minCheckPointCount = settings.minCheckPointCount;
  this._maxCheckPointCount = settings.maxCheckPointCount;
  this._maxSubscriberCount = settings.maxSubscriberCount;
  this._namedConsumerStrategy = settings.namedConsumerStrategy;

  this._responseType = ClientMessage.UpdatePersistentSubscriptionCompleted;
}
util.inherits(UpdatePersistentSubscriptionOperation, OperationBase);

UpdatePersistentSubscriptionOperation.prototype._createRequestDto = function() {
  return new ClientMessage.UpdatePersistentSubscription({
      subscriptionGroupName: this._groupName,
      eventStreamId: this._stream,
      resolveLinkTos: this._resolveLinkTos,
      startFrom: this._startFromBeginning,
      messageTimeoutMilliseconds: this._messageTimeoutMilliseconds,
      recordStatistics: this._recordStatistics,
      liveBufferSize: this._liveBufferSize,
      readBatchSize: this._readBatchSize,
      bufferSize: this._bufferSize,
      maxRetryCount: this._maxRetryCount,
      preferRoundRobin: this._namedConsumerStrategy === SystemConsumerStrategies.RoundRobin,
      checkpointAfterTime: this._checkPointAfter,
      checkpointMaxCount: this._maxCheckPointCount,
      checkpointMinCount: this._minCheckPointCount,
      subscriberMaxCount: this._maxSubscriberCount,
      namedConsumerStrategy: this._namedConsumerStrategy
  });
};

UpdatePersistentSubscriptionOperation.prototype._inspectResponse = function(response) {
  switch (response.result)
  {
    case ClientMessage.UpdatePersistentSubscriptionCompleted.UpdatePersistentSubscriptionResult.Success:
      this._succeed();
      return new InspectionResult(InspectionDecision.EndOperation, "Success");
    case ClientMessage.UpdatePersistentSubscriptionCompleted.UpdatePersistentSubscriptionResult.Fail:
      this.fail(new Error(util.format("Subscription group %s on stream %s failed '%s'", this._groupName, this._stream, response.reason)));
      return new InspectionResult(InspectionDecision.EndOperation, "Fail");
    case ClientMessage.UpdatePersistentSubscriptionCompleted.UpdatePersistentSubscriptionResult.AccessDenied:
      this.fail(new Error(util.format("Write access denied for stream '%s'.", this._stream)));
      return new InspectionResult(InspectionDecision.EndOperation, "AccessDenied");
    case ClientMessage.UpdatePersistentSubscriptionCompleted.UpdatePersistentSubscriptionResult.DoesNotExist:
      this.fail(new Error(util.format("Subscription group %s on stream %s does not exist", this._groupName, this._stream)));
      return new InspectionResult(InspectionDecision.EndOperation, "DoesNotExist");
    default:
      throw new Error(util.format("Unexpected OperationResult: %s.", response.result));
  }
};

UpdatePersistentSubscriptionOperation.prototype._transformResponse = function(response) {
  return new results.PersistentSubscriptionUpdateResult(results.PersistentSubscriptionUpdateStatus.Success);
};

UpdatePersistentSubscriptionOperation.prototype.toString = function() {
  return util.format("Stream: %s, Group Name: %s", this._stream, this._groupName);
};

module.exports = UpdatePersistentSubscriptionOperation;