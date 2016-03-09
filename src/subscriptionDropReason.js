const SubscriptionDropReason = {
  AccessDenied: 'accessDenied',
  CatchUpError: 'catchUpError',
  ConnectionClosed: 'connectionClosed',
  EventHandlerException: 'eventHandlerException',
  ProcessingQueueOverflow: 'processingQueueOverflow',
  ServerError: 'serverError',
  SubscribingError: 'subscribingError',
  UserInitiated: 'userInitiated',
  Unknown: 'unknown'
};

module.exports = SubscriptionDropReason;