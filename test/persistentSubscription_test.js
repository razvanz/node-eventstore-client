var util = require('util');
var uuid = require('uuid');
var client = require('../src/client');
const adminCredentials = new client.UserCredentials("admin", "changeit");

function createRandomEvent() {
  return client.createJsonEventData(uuid.v4(), {a: uuid.v4(), b: Math.random()}, {createdAt: Date.now()}, 'testEvent');
}

var testStreamName = 'test' + uuid.v4();

module.exports = {
  'Test Create Persistent Subscription': function(test) {
    var settings = client.PersistentSubscriptionSettings.create();
    this.conn.createPersistentSubscription(testStreamName, 'consumer-1', settings, adminCredentials)
      .then(function(result) {
        test.done();
      })
      .catch(function(err) {
        test.done(err);
      });
  },
  //TODO: Update Persistent Subscription
  'Test ConnectTo Persistent Subscription': function(test) {
    function eventAppeared(s, e) {
      s.stop();
    }
    function subscriptionDropped(connection, reason, error) {
      test.done(error);
    }
    var subscription = this.conn.connectToPersistentSubscription(testStreamName, 'consumer-1', eventAppeared, subscriptionDropped);
    this.log.info('ABC', subscription);
    this.conn.appendToStream(testStreamName, client.expectedVersion.any, [createRandomEvent()]);
  },
  'Test Delete Persistent Subscription': function(test) {
    this.conn.deletePersistentSubscription(testStreamName, 'consumer-1', adminCredentials)
      .then(function(result) {
        test.done();
      })
      .catch(function(err) {
        test.done(err);
      });
  }
};

require('./common/base_test').init(module.exports);