function NodeEndPoints(tcpEndPoint, secureTcpEndPoint) {
  if (tcpEndPoint === null && secureTcpEndPoint === null) throw new Error('Both endpoints are null.');
  Object.defineProperties(this, {
    tcpEndPoint: {
      enumerable: true,
      value: tcpEndPoint
    },
    secureTcpEndPoint: {
      enumerable: true,
      value: secureTcpEndPoint
    }
  });
}

NodeEndPoints.createFromGossipMember = function (member) {
  const normTcp = { host: member.externalTcpIp, port: member.externalTcpPort };
  const secTcp = member.externalSecureTcpPort > 0
    ? { host: member.externalTcpIp, port: member.externalSecureTcpPort }
    : null;
  return new NodeEndPoints(normTcp, secTcp);
}

module.exports = NodeEndPoints