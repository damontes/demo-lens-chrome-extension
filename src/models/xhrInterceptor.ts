import { normalizeUrl } from '../lib/url';

class XHRInterceptor {
  originalXHR: any;
  originalOpen: any;
  originalSend: any;
  conditionTarget: (url: string) => boolean;
  callback: ((response: any, url: string, payload: any) => any) | null;

  constructor() {
    this.originalXHR = (window as any).XMLHttpRequest;
    this.originalOpen = XMLHttpRequest.prototype.open;
    this.originalSend = XMLHttpRequest.prototype.send;
    this.conditionTarget = () => false;
    this.callback = null;
  }

  startIntercept(callback: (response: any, url: string, payload: any) => any) {
    this.callback = callback;
    const self = this;

    const originalOpen = XMLHttpRequest.prototype.open;
    const originalSend = XMLHttpRequest.prototype.send;

    const requestDataMap = new WeakMap<XMLHttpRequest, any>();

    XMLHttpRequest.prototype.open = function (this: XMLHttpRequest, method: string, url: string, ...rest: any[]) {
      const normalizedUrl = normalizeUrl(url);
      const shouldIntercept = self.conditionTarget(normalizedUrl);

      requestDataMap.set(this, {
        url: normalizedUrl,
        method,
        shouldIntercept,
        payload: null,
        originalOnReadyStateChange: null,
      });

      if (shouldIntercept) {
        // Store the original onreadystatechange if it exists
        const requestData = requestDataMap.get(this);
        if (requestData) {
          requestData.originalOnReadyStateChange = this.onreadystatechange;
        }

        // Set our custom handler
        this.onreadystatechange = async function (this: XMLHttpRequest) {
          const reqData = requestDataMap.get(this);

          if (this.readyState === 4 && reqData?.shouldIntercept && self.callback) {
            try {
              if (this.status >= 200 && this.status < 300) {
                // Handle successful responses
                const raw = this.responseText;
                if (raw) {
                  try {
                    const parsed = JSON.parse(raw);
                    const newResponse = await self.callback(parsed, reqData.url, reqData.payload);

                    if (newResponse) {
                      // Replace the response in a way that doesn't break the XHR
                      const newResponseText = JSON.stringify(newResponse);
                      Object.defineProperty(this, 'responseText', {
                        value: newResponseText,
                        writable: false,
                        configurable: true,
                      });
                      Object.defineProperty(this, 'response', {
                        value: newResponse,
                        writable: false,
                        configurable: true,
                      });
                    }
                  } catch (error) {
                    console.log('Error processing XHR response:', error);
                  }
                }
              } else if (this.status === 0) {
                // Handle CORS blocked requests
                console.log(`XHR failed with status 0 for ${reqData.url} - likely CORS blocked`);
              } else {
                const newResponse = await self.callback(null, reqData.url, reqData.payload);

                if (newResponse) {
                  const newResponseText = JSON.stringify(newResponse);
                  Object.defineProperty(this, 'responseText', {
                    value: newResponseText,
                    writable: false,
                    configurable: true,
                  });
                  Object.defineProperty(this, 'response', {
                    value: newResponse,
                    writable: false,
                    configurable: true,
                  });
                  Object.defineProperty(this, 'status', {
                    value: 200,
                    writable: false,
                    configurable: true,
                  });
                }
              }
            } catch (error) {
              console.log('Error in XHR interceptor:', error);
            }
          }

          // Call the original handler if it exists
          if (reqData?.originalOnReadyStateChange) {
            reqData.originalOnReadyStateChange.call(this);
          }
        };
      }

      return originalOpen.apply(this, [method, url, ...rest] as any);
    };

    // Pevious Option: Global XMLHttpRequest replacement (commented out - more invasive)
    // Uncomment this section to test the global replacement approach

    // (window as any).XMLHttpRequest = function() {
    //   return self.#createCustomXHR();
    // };

    XMLHttpRequest.prototype.send = function (this: XMLHttpRequest, payload?: any) {
      const requestData = requestDataMap.get(this);
      if (requestData && requestData.shouldIntercept) {
        requestData.payload = payload;

        if (payload && typeof payload === 'string') {
          try {
            requestData.payload = JSON.parse(payload);
          } catch (e) {
            requestData.payload = payload;
          }
        }
      }

      return originalSend.apply(this, [payload] as any);
    };
  }

  setConditionTarget(callback: (url: string) => boolean) {
    this.conditionTarget = callback;
  }

  reset() {
    XMLHttpRequest.prototype.open = this.originalOpen;
    XMLHttpRequest.prototype.send = this.originalSend;

    this.callback = null;
  }

  // #createCustomXHR() {
  //   const xhr = new this.originalXHR();
  //   let interceptedUrl: string = '';
  //   let customResponseData: string | null = null;
  //   let userOnReadyStateChange: Function | null = null;
  //   let isTarget = false;
  //   let requestPayload: any = null;

  //   const self = this;

  //   // Override open immediately
  //   const originalOpen = xhr.open;
  //   xhr.open = function (method: string, url: string, ...rest: any[]) {
  //     interceptedUrl = normalizeUrl(url);
  //     isTarget = self.conditionTarget(interceptedUrl);
  //     return originalOpen.apply(this, [method, url, ...rest]);
  //   };

  //   // Set the onreadystatechange handler immediately after creating the XHR object
  //   xhr.onreadystatechange = async function () {
  //     if (xhr.readyState === 4) {
  //       if (isTarget && self.callback) {
  //         try {
  //           if (xhr.status >= 200 && xhr.status < 300) {
  //             const raw = xhr.responseText;
  //             if (raw) {
  //               try {
  //                 const parsed = JSON.parse(raw);
  //                 const newResponse = await self.callback(parsed, interceptedUrl, requestPayload);
  //                 customResponseData = newResponse ? JSON.stringify(newResponse) : null;
  //               } catch (error) {
  //                 console.log('Error', error);
  //               }
  //             }
  //           } else if (xhr.status === 0) {
  //             console.log(`XHR failed with status 0 for ${interceptedUrl} - likely CORS blocked`);
  //             customResponseData = null;
  //           } else {
  //             console.log(`XHR completed with status ${xhr.status} for ${interceptedUrl}. Not intercepting response.`);
  //             const newResponse = await self.callback(null, interceptedUrl, requestPayload);
  //             customResponseData = newResponse ? JSON.stringify(newResponse) : null;
  //           }
  //         } catch (error) {
  //           console.log('Error processing intercepted response for:', interceptedUrl, error);
  //           customResponseData = null;
  //         }
  //       }
  //     }

  //     if (userOnReadyStateChange && typeof userOnReadyStateChange === 'function') {
  //       try {
  //         userOnReadyStateChange.apply(this, arguments);
  //       } catch (handlerError) {
  //         console.log('Error calling user onreadystatechange handler:', handlerError);
  //       }
  //     }
  //   };

  //   const originalSend = xhr.send;
  //   xhr.send = function (...args: any[]) {
  //     if (isTarget) {
  //       requestPayload = args[0] || null;

  //       // Automatically parse JSON payload if it's a string
  //       if (requestPayload && typeof requestPayload === 'string') {
  //         try {
  //           requestPayload = JSON.parse(requestPayload);
  //         } catch (e) {
  //           // If parsing fails, keep original string payload
  //           // This handles cases where payload might be form data or other formats
  //         }
  //       }
  //     }

  //     return originalSend.apply(this, args);
  //   };

  //   const proxy = new Proxy(xhr, {
  //     get(target, prop) {
  //       if ((prop === 'responseText' || prop === 'response') && customResponseData !== null) {
  //         if (prop === 'responseText') {
  //           return customResponseData;
  //         }

  //         if (prop === 'response') {
  //           try {
  //             return JSON.parse(customResponseData);
  //           } catch (e) {
  //             return customResponseData;
  //           }
  //         }
  //       }

  //       if (prop === 'readyState' || prop === 'status' || prop === 'statusText') {
  //         return target[prop];
  //       }

  //       try {
  //         const value = target[prop];
  //         return typeof value === 'function' ? value.bind(target) : value;
  //       } catch (error) {
  //         console.log('Error getting property:', prop, error);
  //         return;
  //       }
  //     },

  //     set(target, prop, value) {
  //       if (prop === 'onreadystatechange') {
  //         userOnReadyStateChange = value;
  //         return true;
  //       }

  //       try {
  //         target[prop] = value;
  //         return true;
  //       } catch (error) {
  //         console.log('Error setting property:', prop, error);
  //         return false;
  //       }
  //     },
  //   });

  //   return proxy;
  // }
}

export default XHRInterceptor;
