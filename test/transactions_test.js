var uuid = require('uuid');
var Long = require('long');
var client = require('../src/client');

module.exports = {
  setUp: function(cb) {
    cb();
  },
  'Start A Transaction Happy Path': function(test) {
    test.expect(1);
    this.conn.startTransaction(this.testStreamName, client.expectedVersion.noStream)
        .then(function(trx) {
          test.ok(Long.isLong(trx.transactionId), "trx.transactionId should be a Long.");
          test.done();
        })
        .catch(test.done);
  },
  /*
  'Start A Transaction With Wrong Expected Version': function(test) {
    this.conn.startTransaction(this.testStreamName, 10)
        .then(function(trx) {
          test.fail("Start Transaction with wrong expected version succeeded.");
          test.done();
        })
        .catch(function(err) {
          var isWrongExpectedVersion = err instanceof client.WrongExpectedVersionError;
          if (isWrongExpectedVersion) return test.done();
          test.done(err);
        });
  },
  'Start A Transaction With Deleted Stream': function(test) {
    var self = this;
    this.conn.deleteStream(this.testStreamName, client.expectedVersion.emptyStream)
        .then(function() {
          return self.conn.startTransaction(self.testStreamName, client.expectedVersion.any);
        })
        .then(function(trx) {
          test.fail("Start Transaction with deleted stream succeeded.");
          test.done();
        })
        .catch(function(err) {
          var isStreamDeleted = err instanceof client.StreamDeletedError;
          test.ok(isStreamDeleted, "Expected StreamDeletedError got " + err.constructor.name);
          if (isStreamDeleted) return test.done();
          test.done(err);
        });
  },
  */
  'Start A Transaction With No Access': function(test) {
    test.expect(1);
    var self = this;
    var metadata = {$acl: {$w: "$admins"}};
    this.conn.setStreamMetadataRaw(this.testStreamName, -1, metadata)
        .then(function() {
          return self.conn.startTransaction(self.testStreamName, client.expectedVersion.any);
        })
        .then(function(trx) {
          test.fail("Start Transaction with no access succeeded.");
          test.done();
        })
        .catch(function(err) {
          var isAccessDenied = err instanceof client.AccessDeniedError;
          test.ok(isAccessDenied, "Expected AccessDeniedError got " + err.constructor.name);
          if (isAccessDenied) return test.done();
          test.done(err);
        });
  },
  'Continue A Transaction Happy Path': function(test) {
    var self = this;
    this.conn.startTransaction(this.testStreamName, client.expectedVersion.emptyStream)
        .then(function(trx) {
          return trx.write(client.createJsonEventData(uuid.v4(), {a: Math.random()}, null, 'anEvent'))
              .then(function () {
                return self.conn.continueTransaction(trx.transactionId);
              });
        })
        .then(function(trx) {
          return trx.write(client.createJsonEventData(uuid.v4(), {a: Math.random()}, null, 'anEvent'))
              .then(function() {
                return trx.commit();
              })
              .then(function() {
                test.done();
              });
        })
        .catch(test.done);
  },
  'Write/Commit Transaction Happy Path': function(test) {
    test.expect(2);
    var self = this;
    this.conn.startTransaction(this.testStreamName, client.expectedVersion.emptyStream)
        .then(function(trx) {
          self.events = [];
          for(var i = 0; i < 15; i++) {
            var event = {a: uuid.v4(), b: Math.random()};
            self.events.push(client.createJsonEventData(uuid.v4(), event, null, 'anEvent'));
          }
          return trx.write(self.events)
              .then(function() {
                var events = [];
                for(var j = 0; j < 9; j++) {
                  var event = {a: Math.random(), b: uuid.v4()};
                  events.push(client.createJsonEventData(uuid.v4(), event, null, 'anotherEvent'));
                }
                Array.prototype.push.apply(self.events, events);
                trx.write(events);
              })
              .then(function() {
                return trx.commit();
              });
        })
        .then(function(result) {
          test.ok(result.logPosition, "Missing result.logPosition");
          test.areEqual("result.nextExpectedVersion", result.nextExpectedVersion, Long.fromNumber(self.events.length-1));
          test.done();
        })
        .catch(test.done);
  },
  'Write/Commit Transaction With Wrong Expected Version': function(test) {
    test.expect(1);
    this.conn.startTransaction(this.testStreamName, 10)
        .then(function(trx) {
          return trx.write(client.createJsonEventData(uuid.v4(), {a: Math.random(), b: uuid.v4()}, null, 'anEvent'))
              .then(function() {
                return trx.commit();
              });
        })
        .then(function() {
          test.fail("Commit on transaction with wrong expected version succeeded.");
          test.done();
        })
        .catch(function(err) {
          var isWrongExpectedVersion = err instanceof client.WrongExpectedVersionError;
          test.ok(isWrongExpectedVersion, "Expected WrongExpectedVersionError, but got " + err.constructor.name);
          if (isWrongExpectedVersion) return test.done();
          test.done(err);
        });
  },
  'Write/Commit Transaction With Deleted Stream': function(test) {
    test.expect(1);
    var self = this;
    this.conn.deleteStream(this.testStreamName, client.expectedVersion.emptyStream, true)
        .then(function() {
          return self.conn.startTransaction(self.testStreamName, client.expectedVersion.any);
        })
        .then(function(trx) {
          return trx.write(client.createJsonEventData(uuid.v4(), {a: Math.random(), b: uuid.v4()}, null, 'anEvent'))
              .then(function() {
                return trx.commit();
              });
        })
        .then(function() {
          test.fail("Commit on transaction on deleted stream succeeded.");
          test.done();
        })
        .catch(function(err) {
          var isStreamDeleted = err instanceof client.StreamDeletedError;
          test.ok(isStreamDeleted, "Expected StreamDeletedError, but got " + err.constructor.name);
          if (isStreamDeleted) return test.done();
          test.done(err);
        });
  },
  'Write/Commit Transaction With No Write Access': function(test) {
    test.expect(1);
    var self = this;
    this.conn.startTransaction(this.testStreamName, client.expectedVersion.any)
        .then(function(trx) {
          var metadata = {$acl: {$w: "$admins"}};
          return self.conn.setStreamMetadataRaw(self.testStreamName, -1, metadata)
              .then(function () {
                return trx.write(client.createJsonEventData(uuid.v4(), {a: Math.random(), b: uuid.v4()}, null, 'anEvent'))
                    .then(function () {
                      return trx.commit();
                    });
              })
        })
        .then(function() {
          test.fail("Commit on transaction on deleted stream succeeded.");
          test.done();
        })
        .catch(function(err) {
          var isAccessDenied = err instanceof client.AccessDeniedError;
          test.ok(isAccessDenied, "Expected AccessDeniedError, but got " + err.constructor.name);
          if (isAccessDenied) return test.done();
          test.done(err);
        });
  }
};

require('./common/base_test').init(module.exports);

