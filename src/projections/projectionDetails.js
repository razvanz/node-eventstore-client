function ProjectionDetails(
  coreProcessingTime,
  version,
  epoch,
  effectiveName,
  writesInProgress,
  readsInProgress,
  partitionsCached,
  status,
  stateReason,
  name,
  mode,
  position,
  progress,
  lastCheckpoint,
  eventsProcessedAfterRestart,
  statusUrl,
  stateUrl,
  resultUrl,
  queryUrl,
  enableCommandUrl,
  disableCommandUrl,
  checkpointStatus,
  bufferedEvents,
  writePendingEventsBeforeCheckpoint,
  writePendingEventsAfterCheckpoint
) {
  this.coreProcessingTime = coreProcessingTime;
  this.version = version;
  this.epoch = epoch;
  this.effectiveName = effectiveName;
  this.writesInProgress = writesInProgress;
  this.readsInProgress = readsInProgress;
  this.partitionsCached = partitionsCached;
  this.status = status;
  this.stateReason = stateReason;
  this.name = name;
  this.mode = mode;
  this.position = position;
  this.progress = progress;
  this.lastCheckpoint = lastCheckpoint;
  this.eventsProcessedAfterRestart = eventsProcessedAfterRestart;
  this.statusUrl = statusUrl;
  this.stateUrl = stateUrl;
  this.resultUrl = resultUrl;
  this.queryUrl = queryUrl;
  this.enableCommandUrl = enableCommandUrl;
  this.disableCommandUrl = disableCommandUrl;
  this.checkpointStatus = checkpointStatus;
  this.bufferedEvents = bufferedEvents;
  this.writePendingEventsBeforeCheckpoint = writePendingEventsBeforeCheckpoint;
  this.writePendingEventsAfterCheckpoint = writePendingEventsAfterCheckpoint;
  Object.freeze(this);
}

module.exports = ProjectionDetails;