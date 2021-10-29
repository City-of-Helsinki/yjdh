import TestController from 'testcafe';

import { getErrorMessage, screenContext } from '../utils/testcafe.utils';

export const getSuomiFiAuthenticationComponents = (t: TestController) => {
  const screen = screenContext(t);

  const authenticationSelector = async () => {
    const selectors = {
      authenticationSelector() {
        return screen.getByRole('heading', {
          name: /valitse tunnistustapa/i,
        });
      },
      testitunnistajaAuthentication() {
        return screen.getByRole('link', {
          name: /testitunnistaja/i,
        });
      },
    };
    const expectations = {
      async isPresent() {
        await t
          .expect(selectors.authenticationSelector().exists)
          .ok(await getErrorMessage(t), { timeout: 10000 });
      },
    };
    const actions = {
      async selectTestitunnistajaAuthentication() {
        await t.click(selectors.testitunnistajaAuthentication());
      },
    };
    await expectations.isPresent();
    return {
      selectors,
      expectations,
      actions,
    };
  };
  return {
    authenticationSelector,
  };
};
