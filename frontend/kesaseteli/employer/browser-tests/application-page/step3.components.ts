import {
  getErrorMessage,
  screenContext,
  withinContext,
} from '@frontend/shared/browser-tests/utils/testcafe.utils';
import TestController from 'testcafe';

import { getSummaryComponents } from './summary.components';

export const getStep3Components = (t: TestController) => {
  const screen = screenContext(t);
  const within = withinContext(t);

  const formSelector = () =>
    screen.findByRole('form', {
      name: /tarkistus ja lähettäminen/i,
    });
  const withinForm = (): ReturnType<typeof within> => within(formSelector());
  const form = async () => {
    const selectors = {
      termsAndConditionsCheckbox() {
        return withinForm().findByRole('checkbox', {
          name: /^olen lukenut palvelun käyttöehdot ja hyväksyn ne/i,
        });
      },
    };
    const expectations = {
      async isPresent() {
        await t.expect(formSelector().exists).ok(await getErrorMessage(t));
      },
    };
    const actions = {
      toggleAcceptTermsAndConditions() {
        return t.click(selectors.termsAndConditionsCheckbox());
      },
    };
    await expectations.isPresent();
    return {
      selectors,
      expectations,
      actions,
    };
  };
  const summaryComponent = () => getSummaryComponents(t);

  return {
    form,
    summaryComponent,
  };
};
