import {
  getErrorMessage,
  screenContext,
} from '@frontend/shared/browser-tests/utils/testcafe.utils';
import TestController from 'testcafe';

import YouthApplication from '../../src/types/youth-application';

export const getHandlerFormPageComponents = async (
  t: TestController,
  expectedApplication?: YouthApplication
) => {
  const screen = screenContext(t);

  const selectors = {
    title() {
      return screen.findByRole('heading', {
        name: /hakemuksen tiedot/i,
      });
    },
    applicationNotFound() {
      return screen.findByRole('heading', {
        name: /hakemusta ei löytynyt/i,
      });
    },
    applicationField(id: keyof YouthApplication | 'name') {
      return screen.findByTestId(`handlerApplication-${id}`);
    },
  };
  const expectations = {
    async isLoaded() {
      await t.expect(selectors.title().exists).ok(await getErrorMessage(t));
    },
    async applicationNotFound() {
      await t
        .expect(selectors.applicationNotFound().exists)
        .ok(await getErrorMessage(t));
    },
    async applicationFieldHasValue(
      key: keyof YouthApplication | 'name',
      expectedValue?: string
    ) {
      if (!expectedValue && !expectedApplication) {
        throw new Error(
          'you need either expected application or value to test'
        );
      }
      const value =
        expectedValue ??
        (expectedApplication?.[key as keyof YouthApplication] as string);

      await t
        .expect(selectors.applicationField(key).textContent)
        .contains(value, await getErrorMessage(t));
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
