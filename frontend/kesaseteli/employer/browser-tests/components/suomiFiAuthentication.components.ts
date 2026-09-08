import {
  getErrorMessage,
  screenContext,
} from '@frontend/shared/browser-tests/utils/testcafe.utils';
import TestController from 'testcafe';

export const getSuomiFiAuthenticationComponents = (t: TestController) => {
  const screen = screenContext(t);

  const authenticationSelector = async () => {
    const selectors = {
      authenticationSelector() {
        return screen.findByRole('heading', {
          name: /valitse tunnistustapa/i,
        });
      },
      testitunnistajaAuthentication() {
        return screen.findByRole('link', {
          name: /testitunnistaja/i,
        });
      },
    };
    const expectations = {
      async isPresent() {
        await t
          .expect(selectors.authenticationSelector().exists)
          .ok(await getErrorMessage(t));
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
