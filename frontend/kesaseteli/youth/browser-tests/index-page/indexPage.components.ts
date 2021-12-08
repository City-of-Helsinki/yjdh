import { fillInput } from '@frontend/shared/browser-tests/utils/input.utils';
import {
  getErrorMessage,
  screenContext,
  withinContext,
} from '@frontend/shared/browser-tests/utils/testcafe.utils';
import { DEFAULT_LANGUAGE } from '@frontend/shared/src/i18n/i18n';
import TestController from 'testcafe';

import YouthApplication from '../../src/types/youth-application';
import YouthFormData from '../../src/types/youth-form-data';

type TextInputName = keyof Omit<
  YouthFormData,
  'selected_school' | 'is_unlisted_school' | 'termsAndConditions'
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
    result() {
      return withinForm().findByTestId('result');
    },
  };
  const expectations = {
    async isPresent() {
      await t.expect(selectors.title().exists).ok(await getErrorMessage(t));
    },
    async isApplicationFulfilledWith(
      application: YouthApplication & { unlisted_school?: string }
    ) {
      if (!application.is_unlisted_school) {
        // eslint-disable-next-line no-param-reassign
        delete application.unlisted_school;
      }
      const sentApplicationJson = await selectors.result().textContent;
      const sentApplication = JSON.parse(sentApplicationJson) as YouthFormData;
      await t
        .expect({
          ...sentApplication,
          is_unlisted_school: Boolean(sentApplication.is_unlisted_school),
          language: DEFAULT_LANGUAGE,
        } as unknown)
        .eql({
          ...application,
          termsAndConditions: true,
          school: application.is_unlisted_school
            ? null
            : { name: application.school },
        });
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
      const dropdown = selectors.schoolDropdown();
      await fillInput<YouthFormData>(
        t,
        'selected_school',
        dropdown,
        schoolName
      );
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
  await expectations.isPresent();
  return {
    selectors,
    expectations,
    actions,
  };
};
