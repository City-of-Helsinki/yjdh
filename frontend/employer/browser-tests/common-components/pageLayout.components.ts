// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/explicit-function-return-type, testing-library/await-async-query */
import TestController from 'testcafe';

import {
  getErrorMessage,
  screenContext,
  withinContext,
} from '../../../shared/browser-tests/utils/testcafe.utils';

export const getPageLayoutComponents = (t: TestController) => {
  const within = withinContext(t);
  const screen = screenContext(t);

  const withinLayout = () => within(screen.getByRole('main'));

  const header = async () => {
    const selectors = {
      header() {
        return screen.findByRole('heading', { name: /työnantajan liittymä/i });
      },
      loginButton() {
        return withinLayout().findByRole('button', {
          name: /kirjaudu sisään/i,
        });
      },
    };
    const expectations = {
      async isPresent() {
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        await t.expect(selectors.header().exists).ok(await getErrorMessage(t));
      },
    };
    const actions = {
      async clickLoginbutton() {
        await t.click(selectors.loginButton());
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
    header,
  };
};
