/* @flow */
/* eslint-disable react/no-multi-comp */
import React from 'react';
import { NativeModules, View } from 'react-native';
import type { Ref } from 'react';

import NativeEventEmitter from './NativeEventEmitter';
import SubscriberView from './components/SubscriberView';
import PublisherView from './components/PublisherView';

import type {
  RNOpenTokEventCallback,
  OpenTokEvent,
  SubscriberProps,
  PublisherProps,
} from './types';

const listeners = {};

export class Subscriber extends React.Component<SubscriberProps> {
  static defaultProps = {
    video: true,
  };

  render() {
    return <SubscriberView listeners={listeners} {...this.props} />;
  }
}

export class Publisher extends React.Component<PublisherProps> {
  static defaultProps = {
    video: true,
  };

  ref: Ref<typeof PublisherView>;

  switchCamera = () => {
    if (this.ref && typeof this.ref !== 'string') {
      this.ref.switchCamera();
    }
  };

  render() {
    return (
      <PublisherView
        ref={ref => {
          /* $FlowFixMe */
          this.ref = ref;
        }}
        listeners={listeners}
        {...this.props}
      />
    );
  }
}

export class ScreenCapture extends React.Component<*> {
  render() {
    const { children, nativeID, ...rest } = this.props;
    return (
      <View {...rest} nativeID="RN_OPENTOK_SCREEN_CAPTURE_VIEW">
        {children}
      </View>
    );
  }
}

export default {
  events: {
    ON_SIGNAL_RECEIVED: 'onSignalReceived',
    ON_SESSION_CONNECTION_CREATED: 'onSessionConnectionCreated',
    ON_SESSION_CONNECTION_DESTROYED: 'onSessionConnectionDestroyed',
    ON_SESSION_DID_CONNECT: 'onSessionDidConnect',
    ON_SESSION_DID_DISCONNECT: 'onSessionDidDisconnect',
    ON_SESSION_DID_FAIL_WITH_ERROR: 'onSessionDidFailWithError',
    ON_SESSION_STREAM_CREATED: 'onSessionStreamCreated',
    ON_SESSION_STREAM_DESTROYED: 'onSessionStreamDestroyed',
    ERROR_NO_SCREEN_CAPTURE_VIEW: 'errorNoScreenCaptureView',
    ON_ARCHIVE_STARTED_WITH_ID: 'onArchiveStartedWithId',
    ON_ARCHIVE_STOPPED_WITH_ID: 'onArchiveStoppedWithId',
    ON_SESSION_DID_BEGIN_RECONNECTING: 'onSessionDidBeginReconnecting',
    ON_SESSION_DID_RECONNECT: 'onSessionDidReconnect',
  },

  connect: (sessionId: string, token: string): Promise<boolean | Error> =>
    NativeModules.RNOpenTok.connect(sessionId, token),

  disconnect: (sessionId: string): void => {
    NativeModules.RNOpenTok.disconnect(sessionId);
  },

  disconnectAll: (): void => {
    NativeModules.RNOpenTok.disconnectAll();
  },

  sendSignal: (
    sessionId: string,
    type: string,
    message: string
  ): Promise<boolean | Error> =>
    NativeModules.RNOpenTok.sendSignal(sessionId, type, message),

  getConnection: (sessionId: string): Promise<boolean | Error> =>
    NativeModules.RNOpenTok.getConnection(sessionId),

  on: (name: OpenTokEvent, callback: RNOpenTokEventCallback): void => {
    if (listeners[name]) {
      listeners[name].remove();
    }
    listeners[name] = NativeEventEmitter.addListener(name, callback);
  },

  removeListener: (name: OpenTokEvent): void => {
    if (listeners[name]) {
      listeners[name].remove();
      delete listeners[name];
    }
  },
};
