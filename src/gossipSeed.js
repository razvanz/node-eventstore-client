function GossipSeed(endPoint, hostName, hostHeader) {
  if (typeof endPoint !== 'object' || !endPoint.host || !endPoint.port) throw new TypeError('endPoint must be have host and port properties.');
  this.endPoint = endPoint;
  this.hostName = hostName;
  this.hostHeader = hostHeader;
  Object.freeze(this);
}

module.exports = GossipSeed;