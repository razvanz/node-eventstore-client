const MemberInfo = require('./memberInfo.js');

const VNodeStates = Object.freeze({
  Initializing: 0,
  Unknown: 1,
  PreReplica: 2,
  CatchingUp: 3,
  Clone: 4,
  Slave: 5,
  PreMaster: 6,
  Master: 7,
  Manager: 8,
  ShuttingDown: 9,
  Shutdown: 10
});

function ClusterInfo(members) {
  this._members = members.map(member => new MemberInfo(member));

  Object.defineProperty(this, 'bestNode', {
    enumerable: true,
    get: function () {
      return this._getBestNode();
    }
  });
}

ClusterInfo.prototype._getBestNode = function () {
  return this._members
  .filter(member => member.isAlive && member.isAllowedToConnect)
  .sort(function (a, b) {
    return VNodeStates[b.state] - VNodeStates[a.state];
  })[0];
}

module.exports = ClusterInfo;