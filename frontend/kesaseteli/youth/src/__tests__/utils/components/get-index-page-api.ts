import getYouthTranslationsApi from 'kesaseteli/youth/__tests__/utils/i18n/get-youth-translations-api';
import YouthTranslations from 'kesaseteli/youth/__tests__/utils/i18n/youth-translations';
import YouthApplication from 'kesaseteli-shared/types/youth-application';
import YouthFormData from 'kesaseteli-shared/types/youth-form-data';
import { convertFormDataToApplication } from 'kesaseteli-shared/utils/youth-form-data.utils';
import nock from 'nock';
import { screen, userEvent, waitFor } from 'shared/__tests__/utils/test-utils';
import { DEFAULT_LANGUAGE, Language } from 'shared/i18n/i18n';

type SaveParams = {
  backendExpectation?: (application: YouthApplication) => nock.Scope;
  language?: Language;
};

type InputKey = keyof YouthTranslations['youthApplication']['form'];
type ErrorType = keyof YouthTranslations['errors'];

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type, @typescript-eslint/explicit-module-boundary-types
const getIndexPageApi = (lang?: Language) => {
  const {
    translations: { [lang ?? DEFAULT_LANGUAGE]: translations },
    regexp,
  } = getYouthTranslationsApi();

  const youthFormData: Partial<YouthFormData> = {};
  return {
    expectations: {
      pageIsLoaded: async () => {
        await screen.findByRole('heading', {
          name: translations.youthApplication.title,
        });
      },
      inputIsPresent: async (key: InputKey): Promise<void> => {
        await screen.findByRole('textbox', {
          name: regexp(translations.youthApplication.form[key]),
        });
      },
      inputIsNotPresent: async (key: InputKey): Promise<void> => {
        expect(
          screen.queryByRole('textbox', {
            name: regexp(translations.youthApplication.form[key]),
          })
        ).not.toBeInTheDocument();
      },
      schoolsDropdownIsDisabled: async (): Promise<void> => {
        const input = await screen.findByRole('combobox', {
          name: regexp(translations.youthApplication.form.schoolsDropdown),
        });
        expect(input).toBeDisabled();
      },
      schoolsDropdownIsEnabled: async (): Promise<void> => {
        const input = await screen.findByRole('combobox', {
          name: regexp(translations.youthApplication.form.schoolsDropdown),
        });
        expect(input).toBeEnabled();
      },
      textInputHasError: async (
        key: InputKey,
        errorType: ErrorType
      ): Promise<void> => {
        const input = await screen.findByRole('textbox', {
          name: regexp(translations.youthApplication.form[key]),
        });
        expect(input).toBeInvalid();
        expect(
          input.parentElement?.parentElement?.parentElement
        ).toHaveTextContent(translations.errors[errorType]);
      },
      schoolsDropdownHasError: async (errorType: ErrorType): Promise<void> => {
        const input = await screen.findByRole('combobox', {
          name: regexp(translations.youthApplication.form.schoolsDropdown),
        });
        expect(input).toBeInvalid();
        const errorElement = await screen.findByTestId(`selectedSchool-error`);
        expect(errorElement).toHaveTextContent(translations.errors[errorType]);
      },
      schoolsDropdownIsValid: async (): Promise<void> => {
        const input = await screen.findByRole('combobox', {
          name: regexp(translations.youthApplication.form.schoolsDropdown),
        });
        expect(input).toBeValid();
      },
      checkboxHasError: async (
        key: Extract<InputKey, 'termsAndConditions' | 'is_unlisted_school'>,
        errorType: ErrorType
      ): Promise<void> => {
        const checkbox = await screen.findByRole('checkbox', {
          name: regexp(translations.youthApplication.form[key]),
        });
        expect(checkbox.parentElement).toHaveTextContent(
          translations.errors[errorType]
        );
      },
      checkFormSummaryIsPresent: async (): Promise<void> => {
        await screen.findByRole('heading', {
          name: translations.youthApplication.checkNotification.label,
        });
      },
      forceSubmitLinkIsPresent: async (): Promise<void> => {
        await screen.findByRole('button', {
          name: translations.youthApplication.form.forceSubmitLink,
        });
      },
      forceSubmitLinkIsNotPresent: (): void => {
        const forceSubmitLink = screen.queryByRole('button', {
          name: translations.youthApplication.form.forceSubmitLink,
        });
        expect(forceSubmitLink).not.toBeInTheDocument();
      },
    },
    actions: {
      typeInput(key: InputKey, value: string) {
        const input = screen.getByRole('textbox', {
          name: regexp(translations.youthApplication.form[key]),
        });
        userEvent.clear(input);
        if (value?.length > 0) {
          userEvent.type(input, value);
        }
        if (key === 'social_security_number') {
          youthFormData.social_security_number = value?.toUpperCase();
        } else {
          (youthFormData[key] as string) = value;
        }
        userEvent.click(document.body);
      },
      async typeAndSelectSchoolFromDropdown(
        value: string,
        expectedOption?: string
      ) {
        const input = await screen.findByRole('combobox', {
          name: regexp(translations.youthApplication.form.schoolsDropdown),
        });
        await waitFor(
          () => {
            expect(input).toBeEnabled();
          },
          { timeout: 10_000 }
        );
        userEvent.clear(input);
        userEvent.type(input, value);
        const option = expectedOption ?? value;
        const schoolOption = await screen.findByText(new RegExp(option, 'i'));
        userEvent.click(schoolOption);
        expect(input).toHaveValue(option);
        youthFormData.selectedSchool = { name: option ?? value };
      },
      async toggleCheckbox(
        key: Extract<InputKey, 'termsAndConditions' | 'is_unlisted_school'>
      ) {
        const checkbox = screen.getByRole('checkbox', {
          name: regexp(translations.youthApplication.form[key]),
        });
        userEvent.click(checkbox);
        youthFormData[key] = Boolean(checkbox.getAttribute('value'));
      },
      async clickSaveButton({ language, backendExpectation }: SaveParams = {}) {
        let response: nock.Scope;
        if (backendExpectation) {
          const application = {
            ...convertFormDataToApplication(
              youthFormData as YouthFormData,
              language ?? DEFAULT_LANGUAGE
            ),
          };
          response = backendExpectation(application);
        }
        const button = await screen.findByRole('button', {
          name: regexp(translations.youthApplication.form.sendButton),
        });
        userEvent.click(button);

        if (backendExpectation) {
          await waitFor(() => {
            response.done();
          });
        }
      },
      clickForceSubmitLink: async ({
        language,
        backendExpectation,
      }: SaveParams = {}): Promise<void> => {
        let response: nock.Scope;
        if (backendExpectation) {
          const application: YouthApplication = {
            ...convertFormDataToApplication(
              youthFormData as YouthFormData,
              language ?? DEFAULT_LANGUAGE
            ),
            request_additional_information: true,
          };
          response = backendExpectation(application);
        }
        const link = await screen.findByRole('button', {
          name: translations.youthApplication.form.forceSubmitLink,
        });
        userEvent.click(link);
        if (backendExpectation) {
          await waitFor(() => {
            response.done();
          });
        }
      },
      /* eslint-disable @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access */
      async fillTheFormWithListedSchoolAndSave(saveParams: SaveParams) {
        this.typeInput('first_name', 'Helinä');
        this.typeInput('last_name', "O'Hara");
        this.typeInput('social_security_number', '111111-111c');
        this.typeInput('postcode', '00100');
        await this.typeAndSelectSchoolFromDropdown(
          'Iidenkiven P',
          'Hiidenkiven peruskoulu'
        );
        this.typeInput('phone_number', '+358-505-551-4995');
        this.typeInput('email', 'aaaa@bbb.test.fi');
        await this.toggleCheckbox('termsAndConditions');
        await this.clickSaveButton(saveParams);
      },
      async fillTheFormWithUnlistedSchoolAndSave(saveParams: SaveParams) {
        this.typeInput('first_name', 'Helinä');
        this.typeInput('last_name', "O'Hara");
        this.typeInput('social_security_number', '111111-111c');
        this.typeInput('postcode', '00100');
        await this.toggleCheckbox('is_unlisted_school');
        this.typeInput('unlistedSchool', 'Erikoiskoulu');
        this.typeInput('phone_number', '+358-505-551-4995');
        this.typeInput('email', 'aaaa@bbb.test.fi');
        await this.toggleCheckbox('termsAndConditions');
        await this.clickSaveButton(saveParams);
      },
      /* eslint-enable @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access */
    },
  };
};

export default getIndexPageApi;
