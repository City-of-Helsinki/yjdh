import {
  getErrorMessage,
  screenContext,
} from '@frontend/shared/browser-tests/utils/testcafe.utils';
import TestController from 'testcafe';

export const getThankYouPageComponents = async (t: TestController) => {
  const screen = screenContext(t);
  const selectors = {
    header() {
      return screen.findByRole('heading', {
        name: /hienoa! olet lähettänyt tietosi kesäsetelijärjestelmään/i,
      });
    },
    goToFrontPageButton() {
      return screen.findByRole('button', {
        name: /kesäseteli etusivulle/i,
      });
    },
  };
  const expectations = {
    async isLoaded() {
      await t
        .expect(selectors.header().exists)
        .ok(await getErrorMessage(t), { timeout: 20_000 });
    },
  };
  const actions = {
    async clickGoToFrontPageButton() {
      await t.click(selectors.goToFrontPageButton());
    },
  };
  await expectations.isLoaded();
  return {
    selectors,
    expectations,
    actions,
  };
};
