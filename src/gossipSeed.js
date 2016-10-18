module.exports = function GossipSeed(endPoint, hostName) {
  //if (typeof endPoint !== 'object' || !endPoint.hostname || !endPoint.port) throw new TypeError('endPoint must be have hostname and port properties.');
  Object.defineProperties(this, {
    endPoint: {
      enumerable: true,
      value: endPoint
    },
    hostName: {
      enumerable: true,
      value: hostName
    }
  });
};
