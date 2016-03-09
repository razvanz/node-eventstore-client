var path = require('path');
var ProtoBuf = require('protobufjs');
var builder = ProtoBuf.loadProtoFile(path.join(__dirname, 'messages.proto'));
var root = builder.build();
var ClientMessage = root.EventStore.Client.Messages;

module.exports = ClientMessage;