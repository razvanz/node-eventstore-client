var util = require('util');
var uuid = require('uuid');
var client = require('../src/client');
const adminCredentials = new client.UserCredentials("admin", "changeit");

function createRandomEvent() {
  return client.createJsonEventData(uuid.v4(), {a: uuid.v4(), b: Math.random()}, {createdAt: Date.now()}, 'testEvent');
}

var testStreamName = 'test-' + uuid.v4();

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
    test.expect(3);
    var _doneCount = 0;
    function done(err) {
      test.ok(!err, err ? err.stack : '');
      _doneCount++;
      if (_doneCount < 2) return;
      test.done();
    }
    function eventAppeared(s, e) {
      s.stop();
    }
    function subscriptionDropped(connection, reason, error) {
      done(error);
    }
    var self = this;
    this.conn.connectToPersistentSubscription(testStreamName, 'consumer-1', eventAppeared, subscriptionDropped)
      .then(function(subscription) {
        test.ok(subscription, "Subscription is null.");
        return self.conn.appendToStream(testStreamName, client.expectedVersion.any, [createRandomEvent()]);
      })
      .then(function () {
        done();
      })
      .catch(done);
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