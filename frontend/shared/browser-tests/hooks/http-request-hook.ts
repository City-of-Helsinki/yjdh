import { RequestHook } from 'testcafe';

// Based on this idea
// https://stackoverflow.com/questions/61116376/set-referrer-for-firefox-on-test-cafe
type Event = {
  requestOptions: { headers: Record<string, string> };
};

export class HttpRequestHook extends RequestHook {
  private referer: string;

  private host: string;

  constructor(referer: string, host: string) {
    super();
    this.referer = referer;
    this.host = host;
  }

  async onRequest(event: Event): Promise<void> {
    if (this.host.includes(event.requestOptions.headers.host)) {
      // eslint-disable-next-line no-console
      console.log('onRequest()');
      // eslint-disable-next-line no-param-reassign
      event.requestOptions.headers.Referer = this.referer;
      // eslint-disable-next-line no-console
      console.log(event.requestOptions.headers);
    }
  }

  // eslint-disable-next-line class-methods-use-this,@typescript-eslint/no-empty-function
  async onResponse(): Promise<void> {}
}
