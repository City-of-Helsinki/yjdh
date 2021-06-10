import { RequestHook } from 'testcafe';

// Based on this idea
// https://stackoverflow.com/questions/61116376/set-referrer-for-firefox-on-test-cafe
type Event = {
  requestOptions: { headers: Record<string, string> };
};
export class HttpRequestHook extends RequestHook {
  private referer: string;

  constructor(referer: string) {
    super();
    this.referer = referer;
  }

  async onRequest(event: Event): Promise<void> {
    // eslint-disable-next-line no-param-reassign
    event.requestOptions.headers.Referer = this.referer;
  }

  // eslint-disable-next-line class-methods-use-this,@typescript-eslint/no-empty-function
  async onResponse(): Promise<void> {}
}
