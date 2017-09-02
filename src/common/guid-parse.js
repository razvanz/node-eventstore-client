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
    if (ii < 4) {
      buf[i + (3 - ii++)] = _hexToByte[oct]
    } else if (ii < 6) {
      buf[i + 4 + (5 - ii++)] = _hexToByte[oct]
    } else if (ii < 8) {
      buf[i + 6 + (7 - ii++)] = _hexToByte[oct]
    } else if (ii < 16) { // Don't overflow!
      buf[i + ii++] = _hexToByte[oct];
    }
  });

  return buf;
}

// **`unparse()` - Convert UUID byte array (ala parse()) into a string**
function unparse(buf, offset) {
  var i = offset || 0;
  const bth = _byteToHex;
  return  bth[buf[i+3]] + bth[buf[i+2]] +
    bth[buf[i+1]] + bth[buf[i+0]] + '-' +
    bth[buf[i+5]] + bth[buf[i+4]] + '-' +
    bth[buf[i+7]] + bth[buf[i+6]] + '-' +
    bth[buf[i+8]] + bth[buf[i+9]] + '-' +
    bth[buf[i+10]] + bth[buf[i+11]] +
    bth[buf[i+12]] + bth[buf[i+13]] +
    bth[buf[i+14]] + bth[buf[i+15]];
}

exports.parse = parse;
exports.unparse = unparse;