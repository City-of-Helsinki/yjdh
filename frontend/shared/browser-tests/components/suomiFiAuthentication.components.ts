import TestController from 'testcafe';

import {
  getErrorMessage,
  screenContext,
  withinContext,
} from '../utils/testcafe.utils';

export const getSuomiFiAuthenticationComponents = (t: TestController) => {
  const within = withinContext(t);
  const screen = screenContext(t);

  const withinPage = (): ReturnType<typeof within> =>
    within(screen.getByRole('main'));

  const authenticationSelector = async () => {
    const selectors = {
      authenticationSelector() {
        return withinPage().getByRole('list');
      },
      testitunnistajaAuthentication() {
        return withinPage().getByRole('link', {
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
