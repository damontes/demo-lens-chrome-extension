import { normalizeUrl } from '../lib/url';

class FetchInterceptor {
  #originalFetch: any;

  constructor() {
    this.#originalFetch = window.fetch;
  }

  startIntercept(callbkack: (url: string, response: Response, body: any) => Promise<Response>) {
    const originalFetch = this.#originalFetch;
    const getRequestBody = this.#getRequestBody;

    window.fetch = async function (...args) {
      const requestUrl = args[0] as string;
      const options = args[1] || {};
      const url = normalizeUrl(requestUrl);

      const request = new Request(requestUrl, options);

      const requestBody = await getRequestBody(request);

      const response = await originalFetch.apply(this, args);
      return callbkack(url, response, requestBody);
    };
  }

  reset() {
    window.fetch = this.#originalFetch;
  }

  #getRequestBody(request: Request) {
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      try {
        const clonedRequest = request.clone(); // Clone so the body isn't consumed
        const contentType = clonedRequest.headers.get('Content-Type') || '';

        if (contentType.includes('application/json')) {
          return clonedRequest.json();
        } else if (contentType.includes('application/x-www-form-urlencoded')) {
          return clonedRequest.text();
        } else if (contentType.includes('multipart/form-data')) {
          return clonedRequest.formData();
        } else {
          return clonedRequest.text(); // fallback
        }
      } catch (e) {
        console.warn('Failed to parse request body:', e);
        return null;
      }
    }

    return null;
  }
}

export default FetchInterceptor;
