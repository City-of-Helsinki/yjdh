import TestController, { ClientFunction } from 'testcafe';

import { SuomiFiAuthorizationUrl } from './settings';

const getCurrentUrl = ClientFunction(() => document.location.href);

/* eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types,@typescript-eslint/explicit-function-return-type */
export const getUrlUtils = (t: TestController) => {
  const actions = {};
  const expectations = {
    async urlChangedToAuthorizationEndpoint() {
      await t.expect(getCurrentUrl()).contains(SuomiFiAuthorizationUrl);
    },
  };
  return {
    actions,
    expectations,
  };
};
