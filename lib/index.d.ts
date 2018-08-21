/// <reference types="node" />
/// <reference types="Long" />

// Expose classes
export class Position {
    constructor(commitPosition: number|Long, preparePosition: number|Long);
    readonly commitPosition: Long;
    readonly preparePosition: Long;
    static readonly start: number;
    static readonly end: number;
}

export class UserCredentials {
    constructor(username: string, password: string);
    readonly username: string;
    readonly password: string;
}

export class PersistentSubscriptionSettings {
    constructor(resolveLinkTos: boolean, startFrom: Long|number, extraStatistics: boolean, messageTimeout: number,
                maxRetryCount: number, liveBufferSize: number, readBatchSize: number, historyBufferSize: number,
                checkPointAfter: number, minCheckPointCount: number, maxCheckPointCount: number,
                maxSubscriberCount: number, namedConsumerStrategy: string)
    static create(): PersistentSubscriptionSettings;
}

export namespace SystemConsumerStrategies {
    const DispatchToSingle: string;
    const RoundRobin: string;
    const Pinned: string;
}

export class GossipSeed {
    constructor(endPoint: TcpEndPoint, hostHeader: string);
    readonly endPoint: TcpEndPoint;
    readonly hostHeader: string;
}

export interface ProjectionDetails {
    readonly coreProcessingTime: number,
    readonly version: number,
    readonly epoch: number,
    readonly effectiveName: string,
    readonly writesInProgress: number,
    readonly readsInProgress: number,
    readonly partitionsCached: number,
    readonly status: string,
    readonly stateReason: string,
    readonly name: string,
    readonly mode: string,
    readonly position: string,
    readonly progress: number,
    readonly lastCheckpoint: string,
    readonly eventsProcessedAfterRestart: number,
    readonly statusUrl: string,
    readonly stateUrl: string,
    readonly resultUrl: string,
    readonly queryUrl: string,
    readonly enableCommandUrl: string,
    readonly disableCommandUrl: string,
    readonly checkpointStatus: string,
    readonly bufferedEvents: number,
    readonly writePendingEventsBeforeCheckpoint: number,
    readonly writePendingEventsAfterCheckpoint: number
}

export class ProjectionsManager {
    constructor(log: Logger, httpEndPoint: string, operationTimeout: number);
    enable(name: string, userCredentials: UserCredentials): Promise<void>;
    disable(name: string, userCredentials: UserCredentials): Promise<void>;
    abort(name: string, userCredentials: UserCredentials): Promise<void>;
    createOneTime(query: string, userCredentials: UserCredentials): Promise<void>;
    createTransient(name: string, query: string, userCredentials: UserCredentials): Promise<void>;
    createContinuous(name: string, query: string, trackEmittedStreams: boolean, userCredentials: UserCredentials): Promise<void>;
    listAll(userCredentials: UserCredentials): Promise<ProjectionDetails[]>;
    listOneTime(userCredentials: UserCredentials): Promise<ProjectionDetails[]>;
    listContinuous(userCredentials: UserCredentials): Promise<ProjectionDetails[]>;
    getStatus(name: string, userCredentials: UserCredentials): Promise<string>;
    getState(name: string, userCredentials: UserCredentials): Promise<string>;
    getPartitionState(name: string, partitionId: string, userCredentials: UserCredentials): Promise<string>;
    getResult(name: string, userCredentials: UserCredentials): Promise<string>;
    getPartitionResult(name: string, partitionId: string, userCredentials: UserCredentials): Promise<string>;
    getStatistics(name: string, userCredentials: UserCredentials): Promise<string>;
    getQuery(name: string, userCredentials: UserCredentials): Promise<string>;
    getState(name: string, userCredentials: UserCredentials): Promise<string>;
    updateQuery(name: string, query: string, userCredentials: UserCredentials): Promise<void>;
    deleteQuery(name: string, deleteEmittedStreams: boolean, userCredentials: UserCredentials): Promise<void>;
}

// Expose errors
export class WrongExpectedVersionError {
    readonly name: string;
    readonly action: string;
    readonly message: string;
    readonly stream?: string;
    readonly expectedVersion?: Long;
    readonly transactionId?: Long;
}

export class StreamDeletedError {
    readonly message: string;
    readonly stream?: string;
    readonly transactionId?: Long;
}

export class AccessDeniedError {
    readonly name: string;
    readonly action: string;
    readonly message: string;
    readonly stream?: string;
    readonly transactionId?: Long;
}

export class ProjectionCommandFailedError {
    readonly httpStatusCode: number;
    readonly message: string;
}

// Expose enums/constants
export namespace expectedVersion {
    const any: number;
    const noStream: number;
    const emptyStream: number;
}

export namespace positions {
    const start: Position;
    const end: Position;
}

export namespace streamPosition {
    const start: number;
    const end: number;
}

//TODO
// systemMetadata
// eventReadStatus
// sliceReadStatus

// Expose loggers
export interface Logger {
    debug(fmt: string, ...args: any[]): void;
    info(fmt: string, ...args: any[]): void;
    error(fmt: string, ...args: any[]): void;
}

export class NoopLogger implements Logger {
    constructor()
    debug(fmt: string, ...args: any[]): void;
    info(fmt: string, ...args: any[]): void;
    error(fmt: string, ...args: any[]): void;
}

export class FileLogger implements Logger {
    constructor(filePath: string, append: boolean);
    debug(fmt: string, ...args: any[]): void;
    info(fmt: string, ...args: any[]): void;
    error(fmt: string, ...args: any[]): void;
}

// Expose results
export interface WriteResult {
    readonly nextExpectedVersion: Long;
    readonly logPosition: Position;
}

export interface RecordedEvent {
    readonly eventStreamId: string;
    readonly eventId: string;
    readonly eventNumber: Long;
    readonly eventType: string;
    readonly createdEpoch: number;
    readonly data?: Buffer;
    readonly metadata?: Buffer;
    readonly isJson: boolean;
}

export interface ResolvedEvent {
    readonly event?: RecordedEvent;
    readonly link?: RecordedEvent;
    readonly originalEvent?: RecordedEvent;
    readonly isResolved: boolean;
    readonly originalPosition?: Position;
    readonly originalStreamId: string;
    readonly originalEventNumber: Long;
}

export interface StreamEventsSlice {
    readonly status: string;        // TODO: enum
    readonly stream: string;
    readonly fromEventNumber: Long;
    readonly readDirection: string; // TODO: enum
    readonly events: ResolvedEvent[];
    readonly nextEventNumber: Long;
    readonly lastEventNumber: Long;
    readonly isEndOfStream: boolean;
}

export interface AllEventsSlice {
    readonly readDirection: string; // TODO enum
    readonly fromPosition: Position;
    readonly nextPosition: Position;
    readonly events: ResolvedEvent[];
    readonly isEndOfStream: boolean;
}

export interface DeleteResult {
    readonly logPosition: Position;
}

export interface EventStoreTransaction {
    readonly transactionId: number;
    commit(): Promise<WriteResult>;
    write(eventOrEvents: EventData | EventData[]): Promise<void>;
    rollback(): void;
}

export interface EventReadResult {
    readonly status: string;
    readonly stream: string;
    readonly eventNumber: Long;
    readonly event: ResolvedEvent | null;
}

export interface EventStoreSubscription {
    readonly isSubscribedToAll: boolean;
    readonly streamId: string;
    readonly lastCommitPosition: Position;
    readonly lastEventNumber: Long;

    close(): void;
    unsubscribe(): void;
}

export interface EventStoreCatchUpSubscription {
    stop(): void;
}

export enum PersistentSubscriptionNakEventAction {
    Unknown = 0,
    Park = 1,
    Retry = 2,
    Skip = 3,
    Stop = 4
}

export interface EventStorePersistentSubscription {
    acknowledge(events: ResolvedEvent | ResolvedEvent[]): void;
    fail(events: ResolvedEvent | ResolvedEvent[], action: PersistentSubscriptionNakEventAction, reason: string): void;
    stop(): void;
}

export interface RawStreamMetadataResult {
    readonly stream: string;
    readonly isStreamDeleted: boolean;
    readonly metastreamVersion: Long;
    readonly streamMetadata: any;
}

export interface PersistentSubscriptionCreateResult {
    readonly status: string;
}

export interface PersistentSubscriptionUpdateResult {
    readonly status: string;
}

export interface PersistentSubscriptionDeleteResult {
    readonly status: string;
}

// Callbacks
export interface EventAppearedCallback<TSubscription> {
    (subscription: TSubscription, event: ResolvedEvent): void | Promise<void>;
}

export interface LiveProcessingStartedCallback {
    (subscription: EventStoreCatchUpSubscription): void;
}

export interface SubscriptionDroppedCallback<TSubscription> {
    (subscription: TSubscription, reason: string, error?: Error): void;
}

export interface TcpEndPoint {
    port: number;
    host: string;
}

export interface HeartbeatInfo {
    readonly connectionId: string;
    readonly remoteEndPoint: TcpEndPoint;
    readonly requestSentAt: number;
    readonly requestPkgNumber: number;
    readonly responseReceivedAt: number;
    readonly responsePkgNumber: number;
}

export interface EventData {
    readonly eventId: string;
    readonly type: string;
    readonly isJson: boolean;
    readonly data: Buffer;
    readonly metadata: Buffer;
}

export interface EventStoreNodeConnection {
    connect(): Promise<void>;
    close(): void;
    // write actions
    deleteStream(stream: string, expectedVersion: Long|number, hardDelete?: boolean, userCredentials?: UserCredentials): Promise<DeleteResult>;
    appendToStream(stream: string, expectedVersion: Long|number, eventOrEvents: EventData | EventData[], userCredentials?: UserCredentials): Promise<WriteResult>;
    startTransaction(stream: string, expectedVersion: Long|number, userCredentials?: UserCredentials): Promise<EventStoreTransaction>;
    continueTransaction(transactionId: number, userCredentials?: UserCredentials): EventStoreTransaction;
    // read actions
    readEvent(stream: string, eventNumber: Long|number, resolveLinkTos?: boolean, userCredentials?: UserCredentials): Promise<EventReadResult>;
    readStreamEventsForward(stream: string, start: Long|number, count: number, resolveLinkTos?: boolean, userCredentials?: UserCredentials): Promise<StreamEventsSlice>;
    readStreamEventsBackward(stream: string, start: Long|number, count: number, resolveLinkTos?: boolean, userCredentials?: UserCredentials): Promise<StreamEventsSlice>;
    readAllEventsForward(position: Position, maxCount: number, resolveLinkTos?: boolean, userCredentials?: UserCredentials): Promise<AllEventsSlice>;
    readAllEventsBackward(position: Position, maxCount: number, resolveLinkTos?: boolean, userCredentials?: UserCredentials): Promise<AllEventsSlice>;
    // subscription actions
    subscribeToStream(stream: string, resolveLinkTos: boolean, eventAppeared: EventAppearedCallback<EventStoreSubscription>, subscriptionDropped?: SubscriptionDroppedCallback<EventStoreSubscription>, userCredentials?: UserCredentials): Promise<EventStoreSubscription>;
    subscribeToStreamFrom(stream: string, lastCheckpoint: Long|number|null, resolveLinkTos: boolean, eventAppeared: EventAppearedCallback<EventStoreCatchUpSubscription>, liveProcessingStarted?: LiveProcessingStartedCallback, subscriptionDropped?: SubscriptionDroppedCallback<EventStoreCatchUpSubscription>, userCredentials?: UserCredentials, readBatchSize?: number): EventStoreCatchUpSubscription;
    subscribeToAll(resolveLinkTos: boolean, eventAppeared: EventAppearedCallback<EventStoreSubscription>, subscriptionDropped?: SubscriptionDroppedCallback<EventStoreSubscription>, userCredentials?: UserCredentials): Promise<EventStoreSubscription>;
    subscribeToAllFrom(lastCheckpoint: Position|null, resolveLinkTos: boolean, eventAppeared: EventAppearedCallback<EventStoreCatchUpSubscription>, liveProcessingStarted?: LiveProcessingStartedCallback, subscriptionDropped?: SubscriptionDroppedCallback<EventStoreCatchUpSubscription>, userCredentials?: UserCredentials, readBatchSize?: number): EventStoreCatchUpSubscription;
    // persistent subscriptions
    createPersistentSubscription(stream: string, groupName: string, settings: PersistentSubscriptionSettings, userCredentials?: UserCredentials): Promise<PersistentSubscriptionCreateResult>;
    updatePersistentSubscription(stream: string, groupName: string, settings: PersistentSubscriptionSettings, userCredentials?: UserCredentials): Promise<PersistentSubscriptionUpdateResult>;
    deletePersistentSubscription(stream: string, groupName: string, userCredentials?: UserCredentials): Promise<PersistentSubscriptionDeleteResult>
    connectToPersistentSubscription(stream: string, groupName: string, eventAppeared: EventAppearedCallback<EventStorePersistentSubscription>, subscriptionDropped?: SubscriptionDroppedCallback<EventStorePersistentSubscription>, userCredentials?: UserCredentials, bufferSize?: number, autoAck?: boolean): Promise<EventStorePersistentSubscription>;
    // metadata actions
    setStreamMetadataRaw(stream: string, expectedMetastreamVersion: Long|number, metadata: any, userCredentials?: UserCredentials): Promise<WriteResult>;
    getStreamMetadataRaw(stream: string, userCredentials?: UserCredentials): Promise<RawStreamMetadataResult>;

    on(event: "connected" | "disconnected" | "reconnecting" | "closed" | "error" | "heartbeatInfo", listener: (arg: Error | string | TcpEndPoint | HeartbeatInfo) => void): this;
    once(event: "connected" | "disconnected" | "reconnecting" | "closed" | "error" | "heartbeatInfo", listener: (arg: Error | string | TcpEndPoint | HeartbeatInfo) => void): this;
}

// Expose helper functions
export interface ConnectionSettings {
    log?: Logger,
    verboseLogging?: boolean,

    maxQueueSize?: number,
    maxConcurrentItems?: number,
    maxRetries?: number,
    maxReconnections?: number,

    requireMaster?: boolean,

    reconnectionDelay?: number,
    operationTimeout?: number,
    operationTimeoutCheckPeriod?: number,

    defaultUserCredentials?: UserCredentials,
    useSslConnection?: boolean,
    targetHost?: TcpEndPoint,
    validateServer?: boolean,

    failOnNoServerResponse?: boolean,
    heartbeatInterval?: number,
    heartbeatTimeout?: number,
    clientConnectionTimeout?: number,

    // Cluster Settings
    clusterDns?: string,
    maxDiscoverAttempts?: number,
    externalGossipPort?: number,
    gossipTimeout?: number
}

// Expose Helper functions
export function createConnection(settings: ConnectionSettings, endPointOrGossipSeed: string | TcpEndPoint | GossipSeed[], connectionName?: string): EventStoreNodeConnection;
export function createJsonEventData(eventId: string, event: any, metadata?: any, type?: string): EventData;
export function createEventData(eventId: string, type: string, isJson: boolean, data: Buffer, metadata?: Buffer): EventData;
