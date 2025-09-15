import { normalizeUrl } from '../lib/url';

class XHRInterceptor {
  originalXHR: any;
  conditionTarget: (url: string) => boolean;
  callback: ((response: any, url: string, payload: any) => any) | null;

  constructor() {
    this.originalXHR = (window as any).XMLHttpRequest;
    this.conditionTarget = () => false;
    this.callback = null;
  }

  startIntercept(callback: (response: any, url: string, payload: any) => any) {
    this.callback = callback;
    const self = this;

    window.XMLHttpRequest = function () {
      return self.#createCustomXHR();
    } as any;
  }

  setConditionTarget(callback: (url: string) => boolean) {
    this.conditionTarget = callback;
  }

  reset() {
    window.XMLHttpRequest = this.originalXHR;
    this.callback = null;
  }

  #createCustomXHR() {
    const xhr = new this.originalXHR();
    let interceptedUrl: string = '';
    let customResponseData: string | null = null;
    let userOnReadyStateChange: Function | null = null;
    let isTarget = false;
    let requestPayload: any = null;

    const self = this;

    // Override open immediately
    const originalOpen = xhr.open;
    xhr.open = function (method: string, url: string, ...rest: any[]) {
      interceptedUrl = normalizeUrl(url);
      isTarget = self.conditionTarget(interceptedUrl);
      return originalOpen.apply(this, [method, url, ...rest]);
    };

    // Set the onreadystatechange handler immediately after creating the XHR object
    xhr.onreadystatechange = async function () {
      if (xhr.readyState === 4) {
        if (isTarget && self.callback) {
          try {
            if (xhr.status >= 200 && xhr.status < 300) {
              const raw = xhr.responseText;
              if (raw) {
                try {
                  const parsed = JSON.parse(raw);
                  const newResponse = await self.callback(parsed, interceptedUrl, requestPayload);
                  customResponseData = newResponse ? JSON.stringify(newResponse) : null;
                } catch (error) {
                  console.log('Error', error);
                }
              }
            } else if (xhr.status === 0) {
              console.log(`XHR failed with status 0 for ${interceptedUrl} - likely CORS blocked`);
              customResponseData = null;
            } else {
              console.log(`XHR completed with status ${xhr.status} for ${interceptedUrl}. Not intercepting response.`);
              const newResponse = await self.callback(null, interceptedUrl, requestPayload);
              customResponseData = newResponse ? JSON.stringify(newResponse) : null;
            }
          } catch (error) {
            console.log('Error processing intercepted response for:', interceptedUrl, error);
            customResponseData = null;
          }
        }
      }

      if (userOnReadyStateChange && typeof userOnReadyStateChange === 'function') {
        try {
          userOnReadyStateChange.apply(this, arguments);
        } catch (handlerError) {
          console.log('Error calling user onreadystatechange handler:', handlerError);
        }
      }
    };

    const originalSend = xhr.send;
    xhr.send = function (...args: any[]) {
      if (isTarget) {
        requestPayload = args[0] || null;

        // Automatically parse JSON payload if it's a string
        if (requestPayload && typeof requestPayload === 'string') {
          try {
            requestPayload = JSON.parse(requestPayload);
          } catch (e) {
            // If parsing fails, keep original string payload
            // This handles cases where payload might be form data or other formats
          }
        }
      }

      return originalSend.apply(this, args);
    };

    const proxy = new Proxy(xhr, {
      get(target, prop) {
        if ((prop === 'responseText' || prop === 'response') && customResponseData !== null) {
          if (prop === 'responseText') {
            return customResponseData;
          }

          if (prop === 'response') {
            try {
              return JSON.parse(customResponseData);
            } catch (e) {
              return customResponseData;
            }
          }
        }

        if (prop === 'readyState' || prop === 'status' || prop === 'statusText') {
          return target[prop];
        }

        try {
          const value = target[prop];
          return typeof value === 'function' ? value.bind(target) : value;
        } catch (error) {
          console.log('Error getting property:', prop, error);
          return;
        }
      },

      set(target, prop, value) {
        if (prop === 'onreadystatechange') {
          userOnReadyStateChange = value;
          return true;
        }

        try {
          target[prop] = value;
          return true;
        } catch (error) {
          console.log('Error setting property:', prop, error);
          return false;
        }
      },
    });

    return proxy;
  }
}

export default XHRInterceptor;
