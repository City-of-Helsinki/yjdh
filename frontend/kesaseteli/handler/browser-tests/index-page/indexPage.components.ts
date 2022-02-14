import {
  getErrorMessage,
  screenContext,
} from '@frontend/shared/browser-tests/utils/testcafe.utils';
import TestController from 'testcafe';

export const getIndexPageComponents = async (t: TestController) => {
  const screen = screenContext(t);

  const selectors = {
    title() {
      return screen.findByRole('heading', {
        name: /käsittelijän käyttöliittymä/i,
      });
    },
  };
  const expectations = {
    async isLoaded() {
      await t.expect(selectors.title().exists).ok(await getErrorMessage(t));
    },
  };
  const actions = {};
  await expectations.isLoaded();
  return {
    selectors,
    expectations,
    actions,
  };
};
