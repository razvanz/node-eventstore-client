function GossipSeed(endPoint, hostName) {
  if (typeof endPoint !== 'object' || !endPoint.host || !endPoint.port) throw new TypeError('endPoint must be have host and port properties.');
  this.endPoint = endPoint;
  this.hostName = hostName;
  Object.freeze(this);
}

module.exports = GossipSeed;