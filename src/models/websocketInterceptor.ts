import { normalizeUrl } from '../lib/url';

class WebSocketInterceptor {
  originalWebSocket: any;
  conditionTarget: (url: string) => boolean;
  messageCallback: ((data: any, url: string) => any) | null;

  constructor() {
    this.originalWebSocket = (window as any).WebSocket;
    this.conditionTarget = () => false;
    this.messageCallback = null;
  }

  startIntercept(messageCallback: (data: any, url: string) => any) {
    this.messageCallback = messageCallback;
    const self = this;

    window.WebSocket = function (url: string, protocols?: string | string[]) {
      return self.#createCustomWebSocket(url, protocols);
    } as any;
  }

  setConditionTarget(callback: (url: string) => boolean) {
    this.conditionTarget = callback;
  }

  reset() {
    window.WebSocket = this.originalWebSocket;
    this.messageCallback = null;
  }

  #createCustomWebSocket(url: string, protocols?: string | string[]) {
    const normalizedUrl = normalizeUrl(url);
    const isTarget = this.conditionTarget(normalizedUrl);

    if (!isTarget) {
      return new this.originalWebSocket(url, protocols);
    }

    // Create the actual WebSocket connection
    const ws = new this.originalWebSocket(url, protocols);
    const self = this;

    // Store the original onmessage handler
    const originalDescriptor =
      Object.getOwnPropertyDescriptor(ws, 'onmessage') ||
      Object.getOwnPropertyDescriptor(Object.getPrototypeOf(ws), 'onmessage');

    let userHandler: ((event: MessageEvent) => void) | null = null;

    // Override onmessage property
    Object.defineProperty(ws, 'onmessage', {
      get() {
        return userHandler;
      },
      set(handler: (event: MessageEvent) => void) {
        userHandler = handler;
      },
      configurable: true,
    });

    // Intercept messages at the WebSocket level
    ws.addEventListener('message', async (event: MessageEvent) => {
      let finalEvent = event;

      if (self.messageCallback && event.data) {
        try {
          let parsedData;
          try {
            parsedData = JSON.parse(event.data);
          } catch {
            parsedData = event.data;
          }

          const modifiedData = await self.messageCallback(parsedData, normalizedUrl);

          if (modifiedData !== undefined && modifiedData !== parsedData) {
            const modifiedDataString = typeof modifiedData === 'string' ? modifiedData : JSON.stringify(modifiedData);

            // Create new event with modified data
            finalEvent = new MessageEvent('message', {
              data: modifiedDataString,
              origin: event.origin,
              lastEventId: event.lastEventId,
              source: event.source,
              ports: [...event.ports],
            });
          }
        } catch (error) {
          console.error('WebSocket interceptor error:', error);
        }
      }

      // Call the user's onmessage handler if it exists
      if (userHandler) {
        userHandler.call(ws, finalEvent);
      }
    });

    return ws;
  }
}

export default WebSocketInterceptor;
