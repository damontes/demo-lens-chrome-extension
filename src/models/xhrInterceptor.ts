import { normalizeUrl } from '../lib/url';

class XHRInterceptor {
  originalXHR: any;
  targetURL: string;
  conditionTarget: (url: string) => boolean;
  customResponse: string | null;

  constructor() {
    this.originalXHR = (window as any).XMLHttpRequest;
    this.targetURL = '';
    this.customResponse = null;
    this.conditionTarget = () => false;
  }

  startIntercept(callback: (response: any) => any) {
    const CustomXHR = this.#customXHR;
    const context = this;

    window.XMLHttpRequest = function () {
      return CustomXHR(callback, context);
    } as any;
  }

  setConditionTarget(callback: (url: string) => boolean) {
    this.conditionTarget = callback;
  }

  reset() {
    window.XMLHttpRequest = this.originalXHR;
  }

  #customXHR(callback: (response: any) => any, context: XHRInterceptor) {
    const self = context;
    const xhr = new self.originalXHR();
    const originalSend = xhr.send;
    let isTarget = false;

    const proxy = new Proxy(xhr, {
      get(target, prop) {
        if ((prop === 'responseText' || prop === 'response') && self.customResponse !== null) {
          return self.customResponse;
        }
        return typeof target[prop] === 'function' ? target[prop].bind(target) : target[prop];
      },
      set(target, prop, value) {
        target[prop] = value;
        return true;
      },
    });

    const originalOpen = xhr.open;
    xhr.open = function (method: string, url: string, ...rest: any[]) {
      self.targetURL = normalizeUrl(url);
      isTarget = self.conditionTarget ? self.conditionTarget(self.targetURL) : false;
      return originalOpen.apply(this, [method, self.targetURL, ...rest]);
    };

    xhr.send = function (...args: any[]) {
      if (isTarget) {
        xhr.onreadystatechange = function () {
          if (xhr.readyState === 4) {
            const raw = xhr.responseText;
            const parsed = JSON.parse(raw);

            const newResponse = callback(parsed);
            self.customResponse = newResponse ? JSON.stringify(newResponse) : null;
          }
        };
      }
      return originalSend.apply(this, args);
    };

    return proxy;
  }
}

export default XHRInterceptor;
