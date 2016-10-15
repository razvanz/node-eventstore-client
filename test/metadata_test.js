var util = require('util');
var uuid = require('uuid');
var client = require('../src/client');

module.exports = {
  'Test Set Stream Metadata Raw': function(test) {
    this.conn.setStreamMetadataRaw(this.testStreamName, client.expectedVersion.emptyStream, {$maxCount: 100})
      .then(function(result) {
        test.done();
      })
      .catch(function(err) {
        test.done(err);
      });
  },
  'Test Get Stream Metadata Raw': function(test) {
    this.conn.getStreamMetadataRaw(this.testStreamName)
      .then(function(result) {
        test.done();
      })
      .catch(function(err) {
        test.done(err);
      });
  }
};

require('./common/base_test').init(module.exports);
