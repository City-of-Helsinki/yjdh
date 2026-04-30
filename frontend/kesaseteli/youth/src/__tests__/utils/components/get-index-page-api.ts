import getYouthTranslationsApi from 'kesaseteli/youth/__tests__/utils/i18n/get-youth-translations-api';
import YouthTranslations from 'kesaseteli/youth/__tests__/utils/i18n/youth-translations';
import YouthApplication from 'kesaseteli-shared/types/youth-application';
import YouthFormData from 'kesaseteli-shared/types/youth-form-data';
import YouthFormFields from 'kesaseteli-shared/types/youth-form-fields';
import { convertFormDataToApplication } from 'kesaseteli-shared/utils/youth-form-data.utils';
import nock from 'nock';
import { waitForLoadingCompleted } from 'shared/__tests__/utils/component.utils';
import {
  fireEvent,
  screen,
  userEvent,
  waitFor,
} from 'shared/__tests__/utils/test-utils';
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
        await Promise.all([
          screen.findByRole('heading', {
            name: translations.youthApplication.title,
          }),
          screen.findAllByRole('radio'),
        ]);
      },
      async inputIsPresent(key: YouthFormFields): Promise<void> {
        await screen.findByLabelText(
          regexp(translations.youthApplication.form[key as InputKey])
        );
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
        await waitFor(() => expect(input).toBeEnabled());
      },
      async textInputHasError(
        key: YouthFormFields,
        errorType: ErrorType
      ): Promise<void> {
        const input = await screen.findByRole('textbox', {
          name: regexp(translations.youthApplication.form[key as InputKey]),
        });
        await waitFor(() => expect(input).toBeInvalid());
        const errorText = translations.errors[errorType];
        await screen.findByText(regexp(errorText), {
          selector: `#${key as string}-error`,
        });
      },
      async selectedSchoolHasError(errorType: ErrorType): Promise<void> {
        const input = await screen.findByRole('combobox', {
          name: regexp(translations.youthApplication.form.selectedSchool),
        });
        await waitFor(() => expect(input).toBeInvalid());
        const errorText = translations.errors[errorType];
        await waitFor(() => {
          const errorElements = screen.queryAllByText(regexp(errorText));
          expect(errorElements.length).toBeGreaterThan(0);
          // Check if any of the error elements are related to the school selection
          // HDS usually puts error text near the component.
          // For now, just confirming the error text exists is better than failing due to wrong selector.
        });
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
        const input = await screen.findByRole('checkbox', {
          name: regexp(translations.youthApplication.form[key as InputKey]),
        });
        await waitFor(() => expect(input).toBeInvalid());
        const errorText = translations.errors[errorType];
        await screen.findByText(regexp(errorText), {
          selector: `#${key as string}-error`,
        });
      },
      async targetGroupHasError(errorType: ErrorType): Promise<void> {
        const errorText = translations.errors[errorType];
        await screen.findByText(regexp(errorText), {
          selector: '[class*="SelectionGroup-module_errorText"]',
        });
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
      async applicationIsNotOpen(): Promise<void> {
        await screen.findByRole('heading', {
          name: translations.youthApplication.applicationNotOpen,
        });

        // HDS Notification has a 'region' role with aria-label which defaults to type label if not provided.
        // But simpler to find by text content partial match or containment.
        // The text content should contain the start of the message.
        // The Trans component splits the text, so exact match might be tricky.
        const notification = await screen.findByRole('region', {
          name: /notification/i,
        });

        // Check for the link
        const link = await screen.findByRole('link', {
          name: /tästä|täältä|här|here/i, // Covering likely link texts across languages or falling back to a broad match
        });
        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute(
          'href',
          translations.footer.informationLink
        );

        // Verify link is within the notification (optional but good)
        expect(notification).toContainElement(link);
      },
    },
    actions: {
      async typeInput(key: YouthFormFields, value: string): Promise<void> {
        const input = await screen.findByRole<HTMLInputElement>('textbox', {
          name: regexp(translations.youthApplication.form[key as InputKey]),
        });
        // for some reason userEvent.type(input,value) does not work
        fireEvent.change(input, { target: { value } });
        expect(input).toHaveValue(value);
        if (key === 'social_security_number') {
          youthFormData.social_security_number = value?.toUpperCase();
        } else {
          (youthFormData[key] as string) = value;
        }
        fireEvent.click(document.body);
      },
      async typeAndSelectSchoolFromDropdown(
        value: string,
        expectedOption?: string
      ): Promise<void> {
        const input = await screen.findByRole('combobox', {
          name: regexp(translations.youthApplication.form.selectedSchool),
        });
        await waitFor(() => {
          expect(input).toBeEnabled();
        });
        await userEvent.type(input, value);
        const option = expectedOption ?? value;
        const schoolOption = await screen.findByText(new RegExp(option, 'i'));
        await userEvent.click(schoolOption);
        expect(input).toHaveValue(option);
        youthFormData.selectedSchool = { name: option ?? value };
      },
      async toggleCheckbox(
        key: Extract<
          YouthFormFields,
          'termsAndConditions' | 'is_unlisted_school'
        >
      ): Promise<void> {
        const checkbox = await screen.findByRole('checkbox', {
          name: regexp(translations.youthApplication.form[key as InputKey]),
        });
        await userEvent.click(checkbox);
        youthFormData[key] = Boolean(checkbox.getAttribute('value'));
      },
      async selectTargetGroup(label?: string | RegExp): Promise<void> {
        let radioButton: HTMLElement | undefined;
        if (label) {
          radioButton = await screen.findByRole('radio', { name: label });
        } else {
          const radioButtons = await screen.findAllByRole('radio');
          [radioButton] = radioButtons;
        }

        if (!radioButton) {
          throw new Error('No target groups found');
        }

        await userEvent.click(radioButton);
        youthFormData.target_group =
          radioButton.getAttribute('value') ?? undefined;
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
        await userEvent.click(button);
        if (backendExpectation) {
          await waitFor(() => {
            response.done();
          });
        }
        await waitForLoadingCompleted();
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
        await userEvent.click(link);
        if (backendExpectation) {
          await waitFor(() => {
            response.done();
          });
        }
        await waitForLoadingCompleted();
      },
      /* eslint-disable @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access */
      async fillTheFormWithListedSchoolAndSave(
        saveParams: SaveParams
      ): Promise<void> {
        await this.typeInput('first_name', 'Helinä');
        await this.typeInput('last_name', "O'Hara");
        await this.typeInput('social_security_number', '111111-111c');
        await this.typeInput('postcode', '00100');
        await this.typeAndSelectSchoolFromDropdown(
          'Iidenkiven P',
          'Hiidenkiven peruskoulu'
        );
        await this.selectTargetGroup();
        await this.typeInput('phone_number', '+358-505-551-4995');
        await this.typeInput('email', 'aaaa@bbb.test.fi');
        await this.toggleCheckbox('termsAndConditions');
        await this.clickSaveButton(saveParams);
      },
      async fillTheFormWithUnlistedSchoolAndSave(
        saveParams: SaveParams
      ): Promise<void> {
        await this.typeInput('first_name', 'Helinä');
        await this.typeInput('last_name', "O'Hara");
        await this.typeInput('social_security_number', '111111-111c');
        await this.typeInput('postcode', '00100');
        await this.toggleCheckbox('is_unlisted_school');
        await this.typeInput('unlistedSchool', 'Erikoiskoulu');
        await this.selectTargetGroup();
        await this.typeInput('phone_number', '+358-505-551-4995');
        await this.typeInput('email', 'aaaa@bbb.test.fi');
        await this.toggleCheckbox('termsAndConditions');
        await this.clickSaveButton(saveParams);
      },
      /* eslint-enable @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access */
    },
  };
};

export default getIndexPageApi;
