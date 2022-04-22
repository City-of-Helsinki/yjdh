import YouthFormData from '@frontend/kesaseteli-shared/src/types/youth-form-data';
import { fillInput } from '@frontend/shared/browser-tests/utils/input.utils';
import {
  getErrorMessage,
  screenContext,
  withinContext,
} from '@frontend/shared/browser-tests/utils/testcafe.utils';
import { DEFAULT_LANGUAGE, Language } from '@frontend/shared/src/i18n/i18n';
import TestController from 'testcafe';

import getYouthTranslations from '../../src/__tests__/utils/i18n/get-youth-translations-api';

type TextInputName = keyof Omit<
  YouthFormData,
  'selectedSchool' | 'is_unlisted_school' | 'termsAndConditions'
>;

type CheckboxName = keyof Pick<
  YouthFormData,
  'is_unlisted_school' | 'termsAndConditions'
>;

export const getIndexPageComponents = async (
  t: TestController,
  lang?: Language
) => {
  const {
    regexp,
    translations: { [lang ?? DEFAULT_LANGUAGE]: translations },
  } = getYouthTranslations();
  const screen = screenContext(t);
  const within = withinContext(t);
  const withinForm = (): ReturnType<typeof within> =>
    within(screen.getByTestId('youth-form'));
  const selectors = {
    title() {
      return screen.findByRole('heading', {
        name: translations.youthApplication.title,
      });
    },
    textInput(name: TextInputName) {
      return withinForm().findByTestId(name as string);
    },
    schoolsLoading() {
      return withinForm().queryByPlaceholderText(
        translations.youthApplication.form.schoolsLoading
      );
    },
    schoolsDropdown() {
      return withinForm().queryByRole('combobox', {
        name: regexp(translations.youthApplication.form.schoolsDropdown),
      });
    },
    checkbox(name: CheckboxName) {
      return withinForm().findByRole('checkbox', {
        name: regexp(translations.youthApplication.form[name]),
      });
    },
    sendButton() {
      return withinForm().findByRole('button', {
        name: translations.youthApplication.form.sendButton,
      });
    },
    result() {
      return withinForm().findByTestId('result');
    },
  };
  const expectations = {
    async isLoaded() {
      await t.expect(selectors.title().exists).ok(await getErrorMessage(t));
      await t
        .expect(selectors.schoolsLoading().exists)
        .notOk(await getErrorMessage(t));
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
    async toggleCheckbox(name: CheckboxName) {
      await t.click(selectors.checkbox(name));
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
