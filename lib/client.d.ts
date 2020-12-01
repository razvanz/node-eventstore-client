/// <reference types="node" />
/// <reference types="Long" />

import { EventEmitter } from 'events';
import * as core from './dist';

export type ClientOptions = {
  connection: {
    name?: string;
    endPoint: string | core.TcpEndPoint | core.GossipSeed[];
    settings: core.ConnectionSettings;
  },
  credentials: core.UserCredentials
}

export type EventPayload = {
  eventId: string,
  eventType: string,
  metadata: any,
  data: any,
}

export type DecodedEvent = {
  stream: string,
  eventId: string,
  eventType: string,
  metadata: any,
  data: any,
  originalStream: string,
  originalPosition: core.Position,
  originalEventId: string,
  originalEventNumber: Long | number
}

export interface ActableEvent {
  ack(events: core.ResolvedEvent|core.ResolvedEvent[]): void;
  nack(events: core.ResolvedEvent|core.ResolvedEvent[], action: core.PersistentSubscriptionNakEventAction, reason: string): void;
}

export interface EventHandler<T> {
  (event: DecodedEvent & ActableEvent, subscription: T): Promise<void>;
}

export type ReadStreamOptions = {
  credentials?: core.UserCredentials;
  resolveLinkTos?: boolean;
  decode?: boolean;
}

export type WriteStreamOptions = {
  credentials?: core.UserCredentials;
  expectedVersion?: Long|number;
}

export type DeleteStreamOptions = {
  credentials?: core.UserCredentials;
  expectedVersion?: Long|number;
  hardDelete?: boolean;
}

export type ConnectPersistentSubscriptionOptions = {
  credentials?: core.UserCredentials;
  bufferSize?: Long | number;
  autoAck?: boolean
}

export class Client {
  constructor (options: ClientOptions);

  options: ClientOptions;
  connection: core.EventStoreNodeConnection;

  connect(): Promise<core.EventStoreNodeConnection>;
  disconnect(): Promise<void>;

  readStream (stream: string, offset: Long | number, count: Long | number, options?: ReadStreamOptions): Promise<core.StreamEventsSlice|DecodedEvent[]>
  writeStream (stream: string, events: EventPayload[], options?: WriteStreamOptions): Promise<core.WriteResult>
  deleteStream (stream: string, options?: DeleteStreamOptions): Promise<core.DeleteResult>

  connectPersistentSubscription(
    stream: string,
    group: string,
    eventHandler: EventHandler<core.EventStorePersistentSubscription>,
    dropHandler: core.SubscriptionDroppedCallback<core.EventStorePersistentSubscription>,
    options?: ConnectPersistentSubscriptionOptions
  ): Promise<core.EventStorePersistentSubscription>
}
