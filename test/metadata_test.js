var client = require('../src/client');
const Long = require('long');

const EMPTY_VERSION = Long.fromNumber(client.expectedVersion.emptyStream);

module.exports = {
  'Test Set Stream Metadata Raw': function(test) {
    this.conn.setStreamMetadataRaw(this.testStreamName, EMPTY_VERSION, {$maxCount: 100})
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
