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
    previousStepButton: () =>
      screen.findByRole('button', {
        name: /^palaa edelliseen/i,
      }),
    saveAndContinueButton: () =>
      screen.findByRole('button', { name: /^tallenna ja jatka/i }),
    sendButton: () =>
      screen.findByRole('button', {
        name: /^lähetä hakemus/i,
      }),
    goToStep1: () =>
      screen.findByRole('button', {
        name: /^siirry hakemuksen vaiheeseen 1\. työnantajan tiedot/i,
      }),
    goToStep2: () =>
      screen.findByRole('button', {
        name: /^siirry hakemuksen vaiheeseen 2\. selvitys työsuhteesta/i,
      }),
    goToStep3: () =>
      screen.findByRole('button', {
        name: /siirry hakemuksen vaiheeseen 3\. tarkistus ja lähettäminen/i,
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
    clickGoToPreviousStepButton() {
      return t.click(selectors.previousStepButton());
    },
    clickSaveAndContinueButton() {
      return t.click(selectors.saveAndContinueButton());
    },
    clickSendButton() {
      return t.click(selectors.sendButton());
    },
  };

  await expectations.isPresent();
  return {
    selectors,
    expectations,
    actions,
  };
};
