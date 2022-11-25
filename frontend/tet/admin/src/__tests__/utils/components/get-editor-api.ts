import { screen, userEvent, within } from 'shared/__tests__/utils/test-utils';
import { DEFAULT_LANGUAGE, Language } from 'shared/i18n/i18n';
import getTetAdminTranslationsApi from 'tet/admin/__tests__/utils/i18n/get-tet-admin-translations-api';
import TetPosting from 'tet-shared/types/tetposting';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const getEditorApi = (expectedPosting?: TetPosting, lang?: Language) => {
  const {
    translations: { [lang ?? DEFAULT_LANGUAGE]: translations },
    regexp,
  } = getTetAdminTranslationsApi();

  const requiredText = regexp(translations.editor.posting.validation.required);

  const expectations = {
    inputValueIsPresent: async <K extends keyof TetPosting>(key: K): Promise<void> => {
      const field = await screen.findByTestId(`posting-form-${key}`);
      if (!expectedPosting) {
        throw new Error('you forgot to give expected application values for the test');
      }
      const value = expectedPosting[key] as string;
      expect(field).toHaveValue(value);
    },
    languageValuesArePresent: async (): Promise<void> => {
      const select = await screen.findByText(regexp(translations.editor.posting.contactLanguage));
      const parent = select?.parentElement;
      await within(parent).findByText(regexp(translations.editor.posting.contactLanguageFi));
      await within(parent).findByText(regexp(translations.editor.posting.contactLanguageSv));
    },
    textInputHasError: async <K extends keyof TetPosting>(key: K): Promise<void> => {
      const field = await screen.findByTestId(`posting-form-${key}`);
      const parent = field?.parentElement?.parentElement;
      await within(parent).findByText(requiredText);
    },
    comboboxHasError: async (labelText: string): Promise<void> => {
      const field = await screen.findByRole('combobox', {
        name: regexp(labelText),
      });
      const parent = field?.parentElement?.parentElement;
      await within(parent).findByText(requiredText);
    },
    languageSelectorHasError: async (): Promise<void> => {
      const field = await screen.findByRole('button', {
        name: regexp(translations.editor.posting.contactLanguage),
      });
      const parent = field?.parentElement?.parentElement;
      await within(parent).findByText(requiredText);
    },
    selectionGroupHasError: async (): Promise<void> => {
      await screen.findByText(regexp(translations.editor.classification.workMethod));
    },
    errorNotificationIsShown: async (): Promise<void> => {
      await screen.findByRole('heading', {
        name: regexp(translations.editor.notificationTitle),
      });
    },
  };
  const actions = {
    async clickSendButton() {
      await userEvent.click(
        screen.getByRole('button', {
          name: regexp(translations.editor.saveDraft),
        }),
      );
    },
  };
  return {
    expectations,
    actions,
  };
};

export default getEditorApi;
