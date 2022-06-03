import TestController from 'testcafe';

import { getErrorMessage, screenContext } from './utils/testcafe.utils';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type,@typescript-eslint/explicit-module-boundary-types
export const getSharedComponents = (t: TestController) => {
  const screen = screenContext(t);
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const loadingSpinner = () => {
    const selectors = {
      spinner() {
        return screen.queryAllByTestId('hidden-loading-indicator');
      },
    };
    const expectations = {
      async isNotPresent() {
        await t
          .expect(selectors.spinner().exists)
          .notOk(await getErrorMessage(t));
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
