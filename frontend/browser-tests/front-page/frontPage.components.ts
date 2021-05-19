/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import TestController from 'testcafe';

import {
  getErrorMessage,
  screenContext,
  withinContext,
} from '../../shared/browser-tests/utils/testcafe.utils';

export const getFrontPageComponents = (t: TestController) => {
  const within = withinContext(t);
  const screen = screenContext(t);

  const withinFrontPage = () =>
    within(screen.getByRole('main'));

  const header = async () => {

    const selectors = {
      header() {
        return screen.findByRole('heading', {
        name: /employer/i
      })
      }
    };
    const expectations = {
      async isPresent() {
        await t.expect(selectors.header().exists)
          .ok(await getErrorMessage(t));
      }
    };
    const actions = {};
    await expectations.isPresent();
    return {
      selectors,
      expectations,
      actions,
    };
  };
  return {
    header,
  };
};
