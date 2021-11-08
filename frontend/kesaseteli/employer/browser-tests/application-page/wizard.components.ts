import {
  getErrorMessage,
  screenContext,
} from '@frontend/shared/browser-tests/utils/testcafe.utils';
import TestController from 'testcafe';

export const getWizardComponents = async (t: TestController) => {
  const screen = screenContext(t);
  const selectors = {
    header: () =>
      screen.findByRole('heading', {
        name: /uusi hakemus/i,
      }),
    saveAndContinueButton: () =>
      screen.findByRole('button', {
        name: /^tallenna ja jatka/i,
      }),
    previousStepButton: () =>
      screen.findByRole('button', {
        name: /^palaa edelliseen/i,
      }),
  };
  const expectations = {
    async isPresent() {
      await t
        .expect(selectors.header().exists)
        .ok(await getErrorMessage(t), { timeout: 10000 });
    },
  };

  const actions = {
    clickSaveAndContinueButton() {
      return t.click(selectors.saveAndContinueButton());
    },
    clickGoToPreviousStepButton() {
      return t.click(selectors.previousStepButton());
    },
  };

  await expectations.isPresent();
  return {
    selectors,
    expectations,
    actions,
  };
};
