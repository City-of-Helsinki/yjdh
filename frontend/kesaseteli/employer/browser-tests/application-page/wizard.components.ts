import {
  getErrorMessage,
  screenContext,
  withinContext,
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
    cancelButton: () =>
      screen.findByRole('button', {
        name: /keskeytä|cancel|avbryt/i,
      }),
    deleteButton: () =>
      screen.findByRole('button', {
        name: /poista|delete|ta bort/i,
      }),
    confirmationDialog: () =>
      screen.findByRole('dialog', {
        name: /haluatko poistua sivulta\?|do you want to leave the page\?|vill du lämna sidan\?/i,
      }),
    deleteConfirmationDialog: () =>
      screen.findByRole('dialog', {
        name: /haluatko poistaa hakemuksen\?|do you want to delete the application\?|vill du ta bort ansökan\?/i,
      }),
    confirmCancelButton: () => {
      const dialog = selectors.confirmationDialog();
      return withinContext(t)(dialog).findByTestId('modalSubmit');
    },
    confirmDeleteButton: () => {
      const dialog = selectors.deleteConfirmationDialog();
      return withinContext(t)(dialog).findByTestId('modalSubmit');
    },
    step1Button: () =>
      screen.findByRole('button', {
        name: /^siirry hakemuksen vaiheeseen 1\. työnantajan tiedot/i,
      }),
    step2Button: () =>
      screen.findByRole('button', {
        name: /^siirry hakemuksen vaiheeseen 2\. tarkistus ja lähettäminen/i,
      }),
  };
  const expectations = {
    async isPresent() {
      await t
        .expect(selectors.header().exists)
        .ok(await getErrorMessage(t), { timeout: 40_000 });
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
    clickCancelButton() {
      return t.click(selectors.cancelButton());
    },
    clickConfirmCancelButton() {
      return t.click(selectors.confirmCancelButton());
    },
    clickDeleteButton() {
      return t.click(selectors.deleteButton());
    },
    clickConfirmDeleteButton() {
      return t.click(selectors.confirmDeleteButton());
    },
  };

  await expectations.isPresent();
  return {
    selectors,
    expectations,
    actions,
  };
};
