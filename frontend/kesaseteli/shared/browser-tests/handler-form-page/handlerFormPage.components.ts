import {
  getErrorMessage,
  screenContext,
  withinContext,
} from '@frontend/shared/browser-tests/utils/testcafe.utils';
import TestController from 'testcafe';

import ActivatedYouthApplication from '../../src/types/activated-youth-application';

export const getHandlerFormPageComponents = async <
  A extends ActivatedYouthApplication
>(
  t: TestController,
  expectedApplication?: A
) => {
  const screen = screenContext(t);
  const within = withinContext(t);

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
    applicationField(id: keyof A | 'name') {
      return screen.findByTestId(`handlerApplication-${id as string}`);
    },
    acceptButton() {
      return screen.findByRole('button', {
        name: /hyväksy/i,
      });
    },
    confirmDialog() {
      return screen.findByRole('dialog');
    },
    confirmAcceptButton() {
      return within(screen.getByRole('dialog')).findByRole('button', {
        name: /hyväksy/i,
      });
    },
    rejectButton() {
      return screen.findByRole('button', {
        name: /hylkää/i,
      });
    },
    confirmRejectButton() {
      return within(screen.getByRole('dialog')).findByRole('button', {
        name: /hylkää/i,
      });
    },
    notYetActivated() {
      return screen.findByRole('heading', {
        name: /nuori ei ole vielä aktivoinut hakemusta/i,
      });
    },
    additionalInformationRequested() {
      return screen.findByRole('heading', {
        name: /nuori ei ole vielä täyttänyt lisätietohakemusta/i,
      });
    },
    applicationIsAccepted() {
      return screen.findByRole('heading', {
        name: /hyväksytty/i,
      });
    },
    applicationIsRejected() {
      return screen.findByRole('heading', {
        name: /hylätty/i,
      });
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
      key: keyof A | 'name',
      expectedValue?: string
    ) {
      if (!expectedValue && !expectedApplication) {
        throw new Error(
          'you need either expected application or value to test'
        );
      }
      const value = expectedValue ?? expectedApplication?.[key as keyof A];

      await t
        .expect(selectors.applicationField(key).textContent)
        .contains(value as string, await getErrorMessage(t));
    },
    async applicationIsNotYetActivated() {
      await t
        .expect(selectors.notYetActivated().exists)
        .ok(await getErrorMessage(t));
    },
    async additionalInformationRequested() {
      await t
        .expect(selectors.additionalInformationRequested().exists)
        .ok(await getErrorMessage(t));
    },
    async confirmationDialogIsPresent() {
      await t
        .expect(selectors.confirmDialog().exists)
        .ok(await getErrorMessage(t));
    },
    async applicationIsAccepted() {
      await t
        .expect(selectors.applicationIsAccepted().exists)
        .ok(await getErrorMessage(t));
    },
    async applicationIsRejected() {
      await t
        .expect(selectors.applicationIsRejected().exists)
        .ok(await getErrorMessage(t));
    },
  };
  const actions = {
    clickAcceptButton() {
      return t.click(selectors.acceptButton());
    },
    clickConfirmAcceptButton() {
      return t.click(selectors.confirmAcceptButton());
    },
    clickRejectButton() {
      return t.click(selectors.rejectButton());
    },
    clickConfirmRejectButton() {
      return t.click(selectors.confirmRejectButton());
    },
  };
  await expectations.isLoaded();
  return {
    selectors,
    expectations,
    actions,
  };
};
