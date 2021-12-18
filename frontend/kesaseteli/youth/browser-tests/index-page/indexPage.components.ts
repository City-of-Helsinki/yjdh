import { fillInput } from '@frontend/shared/browser-tests/utils/input.utils';
import {
  getErrorMessage,
  screenContext,
  withinContext,
} from '@frontend/shared/browser-tests/utils/testcafe.utils';
import TestController from 'testcafe';

import YouthApplication from '../../src/types/youth-application';
import YouthFormData from '../../src/types/youth-form-data';
import { convertFormDataToApplication } from '../../src/utils/youth-form-data.utils';

type TextInputName = keyof Omit<
  YouthFormData,
  'selectedSchool' | 'is_unlisted_school' | 'termsAndConditions'
>;

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
    textInput(name: TextInputName) {
      return withinForm().findByTestId(name as string);
    },
    schoolsDropdown() {
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
    result() {
      return withinForm().findByTestId('result');
    },
  };
  const expectations = {
    async isLoaded() {
      await t.expect(selectors.title().exists).ok(await getErrorMessage(t));
    },
  };
  const actions = {
    async typeInput(name: TextInputName, value?: string) {
      await fillInput<YouthFormData>(
        t,
        name as keyof YouthFormData,
        selectors.textInput(name),
        value
      );
    },
    async typeAndSelectSchoolFromDropdown(schoolName: string) {
      const dropdown = selectors.schoolsDropdown();
      await fillInput<YouthFormData>(t, 'selectedSchool', dropdown, schoolName);
      await t.click(screen.findByRole('option', { name: schoolName }));
    },
    async toggleUnlistedSchoolCheckbox() {
      await t.click(selectors.unlistedSchoolCheckbox());
    },
    async toggleAcceptTermsAndConditions() {
      await t.click(selectors.termsAndConditionsCheckbox());
    },
    async clickSendButton() {
      await t.click(selectors.sendButton());
    },
  };
  await expectations.isLoaded();
  return {
    selectors,
    expectations,
    actions,
  };
};
