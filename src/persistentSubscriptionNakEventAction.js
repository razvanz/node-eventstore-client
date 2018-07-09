const PersistentSubscriptionNakEventAction = Object.freeze({
  Unknown: 0,
  Park: 1,
  Retry: 2,
  Skip: 3,
  Stop: 4,
  isValid: function(value) {
    for(var k in PersistentSubscriptionNakEventAction) {
      if (PersistentSubscriptionNakEventAction[k] === value) return true;
    }
    return false;
  }
});

module.exports = PersistentSubscriptionNakEventAction;