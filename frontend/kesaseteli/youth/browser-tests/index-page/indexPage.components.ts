import {
  getErrorMessage,
  screenContext,
} from '@frontend/shared/browser-tests/utils/testcafe.utils';
import TestController from 'testcafe';

export const getIndexPageComponents = (t: TestController) => {
  const screen = screenContext(t);
  const form = async () => {
    const selectors = {
      form() {
        return screen.findByText(/hello, nuorten kesäseteli!/i);
      },
    };
    const expectations = {
      async isPresent() {
        await t.expect(selectors.form().exists).ok(await getErrorMessage(t));
      },
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
    form,
  };
};
