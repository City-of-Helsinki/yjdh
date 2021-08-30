import TestController, { ClientFunction } from 'testcafe';

import { SuomiFiAuthorizationUrls } from './settings';

const getCurrentUrl = ClientFunction(() => document.location.href);

/* eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types,@typescript-eslint/explicit-function-return-type */
export const getUrlUtils = (t: TestController) => {
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
