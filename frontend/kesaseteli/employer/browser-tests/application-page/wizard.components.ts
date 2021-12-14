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
    step1Button: () =>
      screen.findByRole('button', {
        name: /^siirry hakemuksen vaiheeseen 1\. työnantajan tiedot/i,
      }),
    step2Button: () =>
      screen.findByRole('button', {
        name: /^siirry hakemuksen vaiheeseen 2\. selvitys työsuhteesta/i,
      }),
    step3Button: () =>
      screen.findByRole('button', {
        name: /siirry hakemuksen vaiheeseen 3\. tarkistus ja lähettäminen/i,
      }),
  };
  const expectations = {
    async isPresent() {
      await t
        .expect(selectors.header().exists)
        .ok(await getErrorMessage(t), { timeout: 10_000 });
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
    clickGoToStep1Button() {
      return t.click(selectors.step1Button());
    },
    clickGoToStep2Button() {
      return t.click(selectors.step2Button());
    },
    clickGoToStep3Button() {
      return t.click(selectors.step3Button());
    },
  };

  await expectations.isPresent();
  return {
    selectors,
    expectations,
    actions,
  };
};
