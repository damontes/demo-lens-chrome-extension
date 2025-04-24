import { normalizeUrl } from '../lib/url';

class FetchInterceptor {
  #originalFetch: any;

  constructor() {
    this.#originalFetch = window.fetch;
  }

  startIntercept(callbkack: (url: string, response: Response) => Promise<Response>) {
    const originalFetch = this.#originalFetch;

    window.fetch = async function (...args) {
      const requestUrl = args[0] as string;
      const url = normalizeUrl(requestUrl);

      const response = await originalFetch.apply(this, args);

      return callbkack(url, response);
    };
  }

  reset() {
    window.fetch = this.#originalFetch;
  }
}

export default FetchInterceptor;
