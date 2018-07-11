const net = require('net');
const util = require('util');
const createBufferSegment = require('../src/common/bufferSegment');
const TcpPackage = require('../src/systemData/tcpPackage');
const TcpCommand = require('../src/systemData/tcpCommand');
const TcpFlags = require('../src/systemData/tcpFlags');
const ClientMessages = require('../src/messages/clientMessage');

const server = net.createServer(function(socket) {
  console.log('Connection from', socket.remoteAddress, socket.remotePort);
  var recvBuf = new Buffer(0);
  socket.on('data', function(buf) {
    recvBuf = Buffer.concat([recvBuf, buf]);
    let pkgData;
    while(pkgData = tryReadPackage(recvBuf)) {
      if (pkgData) {
        handlePackage(pkgData, socket);
        var oldBuf = recvBuf;
        recvBuf = new Buffer(recvBuf.length - pkgData.size - 4);
        oldBuf.copy(recvBuf, 0, 4 + pkgData.size);
      }
    }
  });
  socket.on('end', function() {
    console.log('Connection closed');
  })
});
server.listen(1113);

function tryReadPackage(buf) {
  if (buf.length < 4) return;
  const size = buf.readInt32LE(0);
  if (buf.length < (4 + size)) return;
  const pkg = {
    size: size,
    data: new Buffer(size)
  };
  buf.copy(pkg.data, 0, 4, 4 + size);
  return pkg;
}

function handlePackage(pkg, socket) {
  const bs = createBufferSegment(pkg.data);
  const tcpPkg = TcpPackage.fromBufferSegment(bs);
  console.log('Received TcpPackage (cmd=%s, correlationId=%s, size=%d)', TcpCommand.getName(tcpPkg.command), tcpPkg.correlationId, tcpPkg.data.count);
  switch(tcpPkg.command) {
    case TcpCommand.IdentifyClient: {
      const dto = new ClientMessages.ClientIdentified({});
      const buf = dto.constructor.encode(dto).finish();
      const sendPkg = new TcpPackage(TcpCommand.ClientIdentified, TcpFlags.None, tcpPkg.correlationId, null, null, createBufferSegment(buf));
      const sendBuf = sendPkg.asBuffer();
      const sizeBuf = new Buffer(4);
      sizeBuf.writeInt32LE(sendBuf.length, 0);
      socket.write(sizeBuf);
      socket.write(sendBuf);
      break;
    }
    case TcpCommand.HeartbeatRequestCommand: {
      const sendPkg = new TcpPackage(TcpCommand.HeartbeatResponseCommand, TcpFlags.None, tcpPkg.correlationId, null, null);
      const sendBuf = sendPkg.asBuffer();
      const sizeBuf = new Buffer(4);
      sizeBuf.writeInt32LE(sendBuf.length, 0);
      socket.write(sizeBuf);
      socket.write(sendBuf);
      break;
    }
    default: {
      console.log('Unhandled TcpPackage command \'%s\'', TcpCommand.getName(tcpPkg.command));
    }
  }
}
