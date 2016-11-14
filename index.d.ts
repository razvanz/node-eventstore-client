/// <reference types="node" />
/// <reference types="es6-promise" />

export namespace expectedVersion {
    const any: number;
    const noStream: number;
    const emptyStream: number;
}

export namespace positions {
    const start: Position;
    const end: Position;
}

export interface EventData {
}

export function createJsonEventData(eventId: string, event: any, metadata?: any, type?: string): EventData;

export function createEventData(eventId: string, type: string, isJson: boolean, data: Buffer, metadata?: Buffer): EventData;

export interface TcpEndPoint {
    port: number;
    hostname: string;
}

export interface GossipSeed {
    new (endPoint: TcpEndPoint, hostHeader: string);
    readonly endPoint: TcpEndPoint;
    readonly hostHeader: string;
}

export interface Logger {
    debug(fmt: string, ...args: any[]): void;
    info(fmt: string, ...args: any[]): void;
    error(fmt: string, ...args: any[]): void;
}

export interface UserCredentials {
    new (username: string, password: string);
}

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

export interface WriteResult {
    readonly nextExpectedVersion: number;
    readonly logPosition: Position;
}

export interface RecordedEvent {
    readonly eventStreamId: string;
    readonly eventId: string;
    readonly eventNumber: number;
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
    readonly originalEventNumber: number;
}

export interface StreamEventsSlice {
    readonly status: string;        // TODO: enum
    readonly stream: string;
    readonly fromEventNumber: number;
    readonly readDirection: string; // TODO: enum
    readonly events: ResolvedEvent[];
    readonly nextEventNumber: number;
    readonly lastEventNumber: number;
    readonly isEndOfStream: boolean;
}

export interface EventStoreSubscription {
    readonly isSubscribedToAll: boolean;
    readonly streamId: string;
    readonly lastCommitPosition: Position;
    readonly lastEventNumber: number;

    close(): void;
    unsubscribe(): void;
}

export interface EventAppearedCallback {
    (subscription: EventStoreSubscription, event: EventData);
}

export interface SubscriptionDroppedCallback {
    (subscription: EventStoreSubscription, reason: string, error?: Error);
}

export interface EventStoreNodeConnection {
    connect(): Promise<void>;
    close(): void;
    appendToStream(stream: string, expectedVersion: number, events: EventData[], userCredentials?: UserCredentials): Promise<WriteResult>;
    readStreamEventsForward(stream: string, start: number, count: number, resolveLinkTos: boolean, userCredentials?: UserCredentials): Promise<StreamEventsSlice>;
    subscribeToStream(stream: string, resolveLinkTos: boolean, eventAppeared: EventAppearedCallback, subscriptionDropped?: SubscriptionDroppedCallback, userCredentials?: UserCredentials): Promise<EventStoreSubscription>;

    on(event: "connected" | "disconnected" | "reconnecting" | "closed" | "error", listener: Function): this;
    once(event: "connected" | "disconnected" | "reconnecting" | "closed" | "error", listener: Function): this;
}

export function createConnection(settings: ConnectionSettings, endPointOrGossipSeed: string | TcpEndPoint | GossipSeed[], connectionName?: string): EventStoreNodeConnection;
