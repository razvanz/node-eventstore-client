var util = require('util');
var uuid = require('uuid');
var client = require('../src/client');
var NoopLogger = require('../src/common/log/noopLogger');

var consoleLogger = {
  debug: function() {
    var msg = util.format.apply(util, Array.prototype.slice.call(arguments));
    util.log(msg);
  },
  info: function() {},
  error: function() {}
};

function createRandomEvent() {
  return client.createJsonEventData(uuid.v4(), {a: uuid.v4(), b: Math.random()}, {createdAt: Date.now()}, 'testEvent');
}

var testStreamName = 'test-' + uuid.v4();
var userCredentialsForAll = new client.UserCredentials("admin", "changeit");

function testEvent(test, event, expectedVersion) {
  if (!event) return;
  test.ok(event.event, "Event has no 'event'.");
  if (!event.event) return;
  test.ok(event.event.eventNumber === expectedVersion, util.format("Wrong expected version. Expected: %d Got: %d", event.event.eventNumber, expectedVersion));
}

module.exports = {
  setUp: function(cb) {
    var tcpEndPoint = {host: 'localhost', port: 1113};
    var settings = {verboseLogging: false, log: new NoopLogger()};
    //var settings = {verboseLogging: true, log: consoleLogger};
    this.conn = client.EventStoreConnection.create(settings, tcpEndPoint);
    this.connError = null;
    var self = this;
    this.conn.connect()
        .catch(function(e) {
          self.connError = e;
          cb(e);
        });
    this.conn.on('connected', function() {
      cb();
    });
  },
  tearDown: function(cb) {
    this.conn.close();
    this.conn.on('closed', function() {
      cb();
    });
    this.conn = null;
  },
  'Test Connection': function(test) {
    test.ok(this.connError === null, "Connection error: " + this.connError);
    test.done();
  },
  'Test Append To Stream': function(test) {
    var events = [
      createRandomEvent()
    ];
    this.conn.appendToStream(testStreamName, client.expectedVersion.any, events)
        .then(function(result) {
          test.ok(result, "No result.");
          test.done();
        })
        .catch(function (err) {
          test.done(err);
        });
  },
  'Test Commit Two Events Using Transaction': function(test) {
    this.conn.startTransaction(testStreamName, client.expectedVersion.any)
        .then(function(trx) {
          test.ok(trx, "No transaction.");
          return Promise.all([trx, trx.write([createRandomEvent()])]);
        })
        .then(function(args) {
          var trx = args[0];
          return Promise.all([trx, trx.write([createRandomEvent()])]);
        })
        .then(function(args) {
          var trx = args[0];
          return trx.commit();
        })
        .then(function(result) {
          test.ok(result, "No result.");
          test.done();
        })
        .catch(function(err) {
          test.done(err);
        });
  },
  'Test Read One Event': function(test) {
    this.conn.readEvent(testStreamName, 0)
        .then(function(result) {
          test.ok(result, "No result.");
          if (result)
            test.ok(result.event, "No event. " + result.status);
          test.done();
        })
        .catch(function(err) {
          test.done(err);
        });
  },
  'Test Read Stream Forward': function(test) {
    this.conn.readStreamEventsForward(testStreamName, 0, 100)
        .then(function(result) {
          test.ok(result, "No result.");
          if (result)
            test.ok(result.events.length === 3, "Expecting 3 events, got " + result.events.length);
          for(var i = 0; i < 3; i++)
            testEvent(test, result.events[i], i);
          test.done();
        })
        .catch(function(err) {
          test.done(err);
        });
  },
  'Test Read Stream Backward': function(test) {
    this.conn.readStreamEventsBackward(testStreamName, 2, 100)
        .then(function(result) {
          test.ok(result, "No result.");
          if (result)
            test.ok(result.events.length === 3, "Expecting 3 events, got " + result.events.length);
          for(var i = 0; i < 3; i++)
            testEvent(test, result.events[i], 2-i);
          test.done();
        })
        .catch(function(err) {
          test.done(err);
        });
  },
  'Test Read All Forward': function(test) {
    this.conn.readAllEventsForward(client.positions.start, 100, false, userCredentialsForAll)
        .then(function(result) {
          test.ok(result, "No result.");
          if (result)
            test.ok(result.events.length >= 3, "Expecting at least 3 events, got " + result.events.length);
          for(var i = 1; i < result.events.length; i++)
            test.ok(result.events[i].originalPosition.compareTo(result.events[i-1].originalPosition) > 0,
                    util.format("event[%d] position is not > event[%d] position.",
                                result.events[i].originalPosition,
                                result.events[i-1].originalPosition));
          test.done();
        })
        .catch(function(err) {
          test.done(err);
        });
  },
  'Test Read All Backward': function(test) {
    this.conn.readAllEventsBackward(client.positions.end, 100, false, userCredentialsForAll)
        .then(function(result) {
          test.ok(result, "No result.");
          if (result)
            test.ok(result.events.length >= 3, "Expecting at least 3 events, got " + result.events.length);
          for(var i = 1; i < result.events.length; i++)
            test.ok(result.events[i].originalPosition.compareTo(result.events[i-1].originalPosition) < 0,
                util.format("event[%d] position is not < event[%d] position.",
                    result.events[i].originalPosition,
                    result.events[i-1].originalPosition));
          test.done();
        })
        .catch(function(err) {
          test.done(err);
        });
  },
  'Test Subscribe to Stream': function(test) {
    var done = false;
    function eventAppeared() {
      if (!done) {
        done = true;
        test.done();
      }
    }
    function subscriptionDropped() {
      if (!done) {
        done = true;
        test.done();
      }
    }
    var conn = this.conn;
    this.conn.subscribeToStream(testStreamName, false, eventAppeared, subscriptionDropped)
        .then(function(subscription) {
          var events = [createRandomEvent()];
          return conn.appendToStream(testStreamName, client.expectedVersion.any, events);
        })
        .catch(function(err) {
          done = true;
          test.done(err);
        })
  },
  'Test Subscribe to All': function(test) {
    var done = false;
    function eventAppeared() {
      if (!done) {
        done = true;
        test.done();
      }
    }
    function subscriptionDropped() {
      if (!done) {
        done = true;
        test.done();
      }
    }
    var conn = this.conn;
    this.conn.subscribeToAll(false, eventAppeared, subscriptionDropped, userCredentialsForAll)
        .then(function(subscription) {
          var events = [createRandomEvent()];
          return conn.appendToStream(testStreamName, client.expectedVersion.any, events);
        })
        .catch(function(err) {
          done = true;
          test.done(err);
        });
  },
  'Test Subscribe to Stream From': function(test) {
    var self = this;
    var liveProcessing = false;
    var catchUpEvents = [];
    var liveEvents = [];
    function eventAppeared(s, e) {
      if (liveProcessing) {
        liveEvents.push(e);
        s.stop();
      } else {
        catchUpEvents.push(e);
      }
    }
    function liveProcessingStarted() {
      liveProcessing = true;
      var events = [createRandomEvent()];
      self.conn.appendToStream('test', client.expectedVersion.any, events);
    }
    function subscriptionDropped(connection, reason, error) {
      test.ok(liveEvents.length === 1, "Expecting 1 live event, got " + liveEvents.length);
      test.ok(catchUpEvents.length > 1, "Expecting at least 1 catchUp event, got " + catchUpEvents.length);
      test.done(error);
    }
    var subscription = this.conn.subscribeToStreamFrom('test', null, false, eventAppeared, liveProcessingStarted, subscriptionDropped);
  },
  'Test Subscribe to All From': function(test) {
    var self = this;
    var liveProcessing = false;
    var catchUpEvents = [];
    var liveEvents = [];
    function eventAppeared(s, e) {
      if (liveProcessing) {
        liveEvents.push(e);
        s.stop();
      } else {
        catchUpEvents.push(e);
      }
    }
    function liveProcessingStarted() {
      liveProcessing = true;
      var events = [createRandomEvent()];
      self.conn.appendToStream(testStreamName, client.expectedVersion.any, events);
    }
    function subscriptionDropped(connection, reason, error) {
      test.ok(liveEvents.length === 1, "Expecting 1 live event, got " + liveEvents.length);
      test.ok(catchUpEvents.length > 1, "Expecting at least 1 catchUp event, got " + catchUpEvents.length);
      test.done(error);
    }
    var subscription = this.conn.subscribeToAllFrom(null, false, eventAppeared, liveProcessingStarted, subscriptionDropped, userCredentialsForAll);
  },
  'Test Set Stream Metadata Raw': function(test) {
    this.conn.setStreamMetadataRaw(testStreamName, client.expectedVersion.emptyStream, {$maxCount: 100})
        .then(function(result) {
          test.done();
        })
        .catch(function(err) {
          test.done(err);
        });
  },
  'Test Get Stream Metadata Raw': function(test) {
    this.conn.getStreamMetadataRaw(testStreamName)
        .then(function(result) {
          test.done();
        })
        .catch(function(err) {
          test.done(err);
        });
  },
  //TODO: Persistent Subscription
  'Test Delete Stream': function(test) {
    this.conn.deleteStream(testStreamName, client.expectedVersion.any)
        .then(function(result) {
          test.ok(result, "No result.");
          test.done();
        })
        .catch(function(err) {
          test.done(err);
        });
  }
};