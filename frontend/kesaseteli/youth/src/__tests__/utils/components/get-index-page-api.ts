import getYouthTranslationsApi from 'kesaseteli/youth/__tests__/utils/i18n/get-youth-translations-api';
import YouthTranslations from 'kesaseteli/youth/__tests__/utils/i18n/youth-translations';
import YouthApplication from 'kesaseteli-shared/types/youth-application';
import YouthFormData from 'kesaseteli-shared/types/youth-form-data';
import YouthFormFields from 'kesaseteli-shared/types/youth-form-fields';
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
    replaced,
  } = getYouthTranslationsApi();

  const youthFormData: Partial<YouthFormData> = {};
  return {
    expectations: {
      async pageIsLoaded() {
        await screen.findByRole('heading', {
          name: translations.youthApplication.title,
        });
      },
      async inputIsPresent (key: YouthFormFields): Promise<void> {
        await screen.findByRole('textbox', {
          name: regexp(translations.youthApplication.form[key as InputKey]),
        });
      },
      async inputIsNotPresent(key: YouthFormFields): Promise<void> {
        expect(
          screen.queryByRole('textbox', {
            name: regexp(translations.youthApplication.form[key as InputKey]),
          })
        ).not.toBeInTheDocument();
      },
      async selectedSchoolIsDisabled(): Promise<void> {
        const input = await screen.findByRole('combobox', {
          name: regexp(translations.youthApplication.form.selectedSchool),
        });
        expect(input).toBeDisabled();
      },
      async selectedSchoolIsEnabled(): Promise<void> {
        const input = await screen.findByRole('combobox', {
          name: regexp(translations.youthApplication.form.selectedSchool),
        });
        expect(input).toBeEnabled();
      },
      async textInputHasError(
        key: YouthFormFields,
        errorType: ErrorType
      ): Promise<void> {
        if (key === 'selectedSchool') {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call
          await this.selectedSchoolHasError(errorType);
        } else {
          const input = await screen.findByRole('textbox', {
            name: regexp(translations.youthApplication.form[key as InputKey]),
          });
          expect(input).toBeInvalid();
          expect(
            input.parentElement?.parentElement?.parentElement
          ).toHaveTextContent(translations.errors[errorType]);
        }
      },
      async selectedSchoolHasError(errorType: ErrorType): Promise<void> {
        const input = await screen.findByRole('combobox', {
          name: regexp(translations.youthApplication.form.selectedSchool),
        });
        expect(input).toBeInvalid();
        const errorElement = await screen.findByTestId(`selectedSchool-error`);
        expect(errorElement).toHaveTextContent(translations.errors[errorType]);
      },
      async textInputIsValid(key: YouthFormFields): Promise<void> {
        if (key === 'selectedSchool') {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call
          await this.selectedSchoolIsValid();
        } else {
          const input = await screen.findByRole('textbox', {
            name: regexp(translations.youthApplication.form[key as InputKey]),
          });
          expect(input).toBeValid();
        }
      },
      async selectedSchoolIsValid(): Promise<void> {
        const input = await screen.findByRole('combobox', {
          name: regexp(translations.youthApplication.form.selectedSchool),
        });
        expect(input).toBeValid();
      },
      async checkboxHasError(
        key: Extract<
          YouthFormFields,
          'termsAndConditions' | 'is_unlisted_school'
        >,
        errorType: ErrorType
      ): Promise<void> {
        const checkbox = await screen.findByRole('checkbox', {
          name: regexp(translations.youthApplication.form[key as InputKey]),
        });
        expect(checkbox.parentElement).toHaveTextContent(
          translations.errors[errorType]
        );
      },
      async pleaseRecheckNotificationIsPresent(): Promise<void> {
        await screen.findByText(
          translations.youthApplication.checkNotification.recheck
        );
      },
      async validationErrorNotificationIsPresent(
        fields: YouthFormFields[]
      ): Promise<void> {
        const fieldNamesList = fields
          .map((name) => translations.youthApplication.form[name as InputKey])
          .join(', ');
        await screen.findByText(
          replaced(translations.youthApplication.checkNotification.validation, {
            fields: fieldNamesList,
          })
        );
      },
      async forceSubmitLinkIsPresent(): Promise<void> {
        await screen.findByRole('button', {
          name: translations.youthApplication.form.forceSubmitLink,
        });
      },
      forceSubmitLinkIsNotPresent(): void {
        const forceSubmitLink = screen.queryByRole('button', {
          name: translations.youthApplication.form.forceSubmitLink,
        });
        expect(forceSubmitLink).not.toBeInTheDocument();
      },
    },
    actions: {
      typeInput(key: YouthFormFields, value: string): void {
        const input = screen.getByRole('textbox', {
          name: regexp(translations.youthApplication.form[key as InputKey]),
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
      ): Promise<void> {
        const input = await screen.findByRole('combobox', {
          name: regexp(translations.youthApplication.form.selectedSchool),
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
      toggleCheckbox(
        key: Extract<
          YouthFormFields,
          'termsAndConditions' | 'is_unlisted_school'
        >
      ): void {
        const checkbox = screen.getByRole('checkbox', {
          name: regexp(translations.youthApplication.form[key as InputKey]),
        });
        userEvent.click(checkbox);
        youthFormData[key] = Boolean(checkbox.getAttribute('value'));
      },
      async clickSaveButton({
        language,
        backendExpectation,
      }: SaveParams = {}): Promise<void> {
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
      async clickForceSubmitLink({
        language,
        backendExpectation,
      }: SaveParams = {}): Promise<void> {
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
      async fillTheFormWithListedSchoolAndSave(
        saveParams: SaveParams
      ): Promise<void> {
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
      async fillTheFormWithUnlistedSchoolAndSave(
        saveParams: SaveParams
      ): Promise<void> {
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
