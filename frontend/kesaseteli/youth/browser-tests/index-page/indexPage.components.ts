import {
  getErrorMessage,
  screenContext,
  withinContext,
} from '@frontend/shared/browser-tests/utils/testcafe.utils';
import TestController from 'testcafe';

import YouthFormData from '../../src/types/youth-form-data';

export const getIndexPageComponents = async (t: TestController) => {
  const screen = screenContext(t);
  const within = withinContext(t);
  const withinForm = (): ReturnType<typeof within> =>
    within(screen.findByTestId('youth-form'));
  const selectors = {
    title() {
      return screen.findByRole('heading', {
        name: /rekisteröidy ja saat henkilökohtaisen kesäsetelin käyttöösi/i,
      });
    },
    input(name: keyof YouthFormData | 'school.name') {
      return withinForm().findByTestId(name);
    },
    schoolDropdown() {
      return withinForm().findByRole('combobox', { name: /koulu/i });
    },
    unlistedSchoolCheckbox() {
      return withinForm().findByRole('checkbox', {
        name: /koulua ei löydy listalta/i,
      });
    },
    termsAndConditionsCheckbox() {
      return withinForm().findByRole('checkbox', {
        name: /olen lukenut palvelun käyttöehdot ja hyväksyn ne/i,
      });
    },
    sendButton() {
      return withinForm().findByRole('button', { name: /lähetä tiedot/i });
    },
  };
  const expectations = {
    async isPresent() {
      await t.expect(selectors.title().exists).ok(await getErrorMessage(t));
    },
  };
  const actions = {};
  await expectations.isPresent();
  return {
    selectors,
    expectations,
    actions,
  };
};
