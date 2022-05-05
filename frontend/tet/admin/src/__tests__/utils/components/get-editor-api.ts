import { screen, userEvent, within, waitFor } from 'shared/__tests__/utils/test-utils';
import TetPosting from 'tet-shared/types/tetposting';
import { escapeRegExp } from 'shared/utils/regex.utils';
import getTetAdminTranslationsApi from 'tet/admin/__tests__/utils/i18n/get-tet-admin-translations-api';
import { DEFAULT_LANGUAGE, Language } from 'shared/i18n/i18n';

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
      const select = await screen.findByText(/Tet-jaksolla käytetty kieli/i);
      const parent = select?.parentElement;
      await within(parent).findByText(regexp(translations.editor.posting.contactLanguageFi));
      await within(parent).findByText(regexp(translations.editor.posting.contactLanguageSv));
    },
    keywordsArePresent: async (): Promise<void> => {
      //const field = await screen.findByText(/Avainsanat/i);
      //const field = await screen.findByRole('combobox', {
      //name: /Avainsanat/i,
      //});
      //const parent = field?.parentElement;
      //await within(parent).findByText(new RegExp(expectedPosting.keywords[0].label, 'i'));
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
    dropdownHasError: async (labelText: string): Promise<void> => {
      const field = await screen.findByRole('button', {
        name: regexp(labelText),
      });
      const parent = field?.parentElement?.parentElement;
      await within(parent).findByText(requiredText);
    },
    selectionGroupHasError: async (labelText: string): Promise<void> => {
      await screen.findByText(regexp('Työtapa'));
    },
  };
  const actions = {
    async clickSendButton() {
      userEvent.click(
        screen.getByRole('button', {
          name: /tallenna julkaisematta/i,
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
