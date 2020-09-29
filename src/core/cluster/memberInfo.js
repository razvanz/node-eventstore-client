const NOT_ALLOWED_STATES = [
  'Manager',
  'ShuttingDown',
  'Shutdown'
];

function MemberInfo(informations) {
  this._instanceId = informations.instanceId;
  this._timeStamp = informations.timeStamp;
  this._state = informations.state;
  this._isAlive = informations.isAlive;
  this._internalTcpIp = informations.internalTcpIp;
  this._internalTcpPort = informations.internalTcpPort;
  this._internalSecureTcpPort = informations.internalSecureTcpPort;
  this._externalTcpIp = informations.externalTcpIp;
  this._externalTcpPort = informations.externalTcpPort;
  this._externalSecureTcpPort = informations.externalSecureTcpPort;
  this._internalHttpIp = informations.internalHttpIp;
  this._internalHttpPort = informations.internalHttpPort;
  this._externalHttpIp = informations.externalHttpIp;
  this._externalHttpPort = informations.externalHttpPort;
  this._lastCommitPosition = informations.lastCommitPosition;
  this._writerCheckpoint = informations.writerCheckpoint;
  this._chaserCheckpoint = informations.chaserCheckpoint;
  this._epochPosition = informations.epochPosition;
  this._epochNumber = informations.epochNumber;
  this._epochId = informations.epochId;
  this._nodePriority = informations.nodePriority;

  Object.defineProperty(this, 'state', {
    enumerable: true,
    get: function () {
      return this._state;
    }
  });

  Object.defineProperty(this, 'isAllowedToConnect', {
    enumerable: true,
    get: function () {
      return !NOT_ALLOWED_STATES.includes(this._state);
    }
  });

  Object.defineProperty(this, 'isAlive', {
    enumerable: true,
    get: function () {
      return this._isAlive;
    }
  });

  Object.defineProperty(this, 'externalTcpIp', {
    enumerable: true,
    get: function () {
      return this._externalTcpIp;
    }
  });

  Object.defineProperty(this, 'externalTcpPort', {
    enumerable: true,
    get: function () {
      return this._externalTcpPort;
    }
  });

  Object.defineProperty(this, 'externalSecureTcpPort', {
    enumerable: true,
    get: function () {
      return this._externalSecureTcpPort;
    }
  });
}

module.exports = MemberInfo;