import { RequestHook, RequestLogger } from 'testcafe';
import { getBackendDomain } from 'kesaseteli-shared/backend-api/backend-api';

// Based on this idea
// https://stackoverflow.com/questions/61116376/set-referrer-for-firefox-on-test-cafe
type Event = {
  requestOptions: { headers: Record<string, string> };
};
export class HttpRequestHook extends RequestHook {
  private referer: string;

  constructor(referer: string, url: string) {
    super(
      { url, method: 'post' },
      {
        logResponseHeaders: true,
        logResponseBody: true,
      }
    );
    this.referer = referer;
  }

  async onRequest(event: Event): Promise<void> {
    // eslint-disable-next-line no-param-reassign
    event.requestOptions.headers.Referer = this.referer;
    console.error('onRequest!', event.requestOptions.headers);
    return super.onRequest(event);
  }

  async onResponse(): Promise<void> {
    return super.onResponse();
  }
}
