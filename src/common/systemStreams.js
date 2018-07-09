exports.metastreamOf = function(stream) {
  return '$$' + stream;
};
exports.isMetastream = function(stream) {
  return stream.indexOf('$$') === 0;
};