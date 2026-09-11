import { SuomiFiAuthorizationUrls } from '@frontend/shared/browser-tests/utils/url.utils';
import TestController, { ClientFunction } from 'testcafe';

const getCurrentUrl = ClientFunction(() => document.location.href);

/* eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types,@typescript-eslint/explicit-function-return-type */
export const getUrlApi = (t: TestController) => {
  const actions = {};
  const expectations = {
    async urlChangedToAuthorizationEndpoint() {
      const currentUrl = await getCurrentUrl();
      await t
        .expect(
          SuomiFiAuthorizationUrls.some((url) => currentUrl.includes(url))
        )
        .eql(true);
    },
  };
  return {
    actions,
    expectations,
  };
};
