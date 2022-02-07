import {
  getErrorMessage,
  screenContext,
  setDataToPrintOnFailure,
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
        name: /siirry kesäsetelin etusivulle/i,
      });
    },
    activationLink() {
      return screen.findByRole('link', {
        name: /aktivoi/i,
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
    async clickActivationLink() {
      const href = await selectors.activationLink().getAttribute('href');
      setDataToPrintOnFailure(t, 'activationLink', href);
      console.log('Clicking activation link', href);
      await t.click(selectors.activationLink());
    },
  };
  await expectations.isLoaded();
  return {
    selectors,
    expectations,
    actions,
  };
};
