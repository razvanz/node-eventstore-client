'use strict';

// Maps for number <-> hex string conversion
var _byteToHex = [];
var _hexToByte = {};
for (var i = 0; i < 256; i++) {
  _byteToHex[i] = (i + 0x100).toString(16).substr(1);
  _hexToByte[_byteToHex[i]] = i;
}

// **`parse()` - Parse a UUID into it's component bytes**
function parse(s, buf, offset) {
  const i = (buf && offset) || 0;
  var ii = 0;

  if (buf) buf.fill(0, i, i + 16);
  buf = buf || new Buffer(16);
  s.toLowerCase().replace(/[0-9a-f]{2}/g, function(oct) {
    if (ii < 16) { // Don't overflow!
      buf[i + ii++] = _hexToByte[oct];
    }
  });

  var buf2 = new Buffer(buf.slice(i, i + 16));
  buf[i + 0] = buf2[3];
  buf[i + 1] = buf2[2];
  buf[i + 2] = buf2[1];
  buf[i + 3] = buf2[0];
  buf[i + 4] = buf2[5];
  buf[i + 5] = buf2[4];
  buf[i + 6] = buf2[7];
  buf[i + 7] = buf2[6];

  return buf;
}

// **`unparse()` - Convert UUID byte array (ala parse()) into a string**
function unparse(buf, offset) {
  var i = offset || 0;
  return '03020100-0504-0706-0809-101112131415'.replace(/\d{2}/g, function (num) {
    var j = parseInt(num, 10);
    return _byteToHex[buf[i+j]];
  })
}

exports.parse = parse;
exports.unparse = unparse;