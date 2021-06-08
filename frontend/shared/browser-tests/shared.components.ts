import TestController from 'testcafe';

import { getErrorMessage, screenContext } from './utils/testcafe.utils';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type,@typescript-eslint/explicit-module-boundary-types
export const getSharedComponents = (t: TestController) => {
  const screen = screenContext(t);
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const loadingSpinner = () => {
    const selectors = {
      spinner() {
        return screen.queryAllByTestId('loading-spinner');
      },
    };
    const expectations = {
      async isNotPresent({ timeout } = { timeout: 10000 }) {
        await t
          .expect(selectors.spinner().exists)
          .notOk(await getErrorMessage(t), { timeout });
      },
    };
    return {
      expectations,
    };
  };
  return {
    loadingSpinner,
  };
};
