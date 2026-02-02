import {
  getErrorMessage,
  withinContext,
} from '@frontend/shared/browser-tests/utils/testcafe.utils';
import { Selector } from 'testcafe';

import { getSummaryComponents } from './summary.components';

const formSelector = () => Selector('form#employer-application-form');

export const getStep2Components = (t: TestController) => {
  const within = withinContext(t);

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
