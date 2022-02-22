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

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type, @typescript-eslint/explicit-module-boundary-types
const getIndexPageApi = () => {
  const youthFormData: Partial<YouthFormData> = {};
  return {
    expectations: {
      pageIsLoaded: async () => {
        await screen.findByRole('heading', {
          name: /rekisteröidy ja saat henkilökohtaisen kesäsetelin käyttöösi/i,
        });
      },
      inputIsPresent: async (key: keyof YouthFormData): Promise<void> => {
        await screen.findByTestId(key);
      },
      inputIsNotPresent: async (key: keyof YouthFormData): Promise<void> => {
        expect(screen.queryByTestId(key)).not.toBeInTheDocument();
      },
      schoolsDropdownIsDisabled: async (): Promise<void> => {
        const input = await screen.findByRole('combobox', { name: /koulu/i });
        expect(input).toBeDisabled();
      },
      schoolsDropdownIsEnabled: async (): Promise<void> => {
        const input = await screen.findByRole('combobox', { name: /koulu/i });
        expect(input).toBeEnabled();
      },
      textInputHasError: async (
        key: keyof YouthFormData,
        errorText: RegExp
      ): Promise<void> => {
        const input = await screen.findByTestId(key);
        expect(input).toBeInvalid();
        expect(
          input.parentElement?.parentElement?.parentElement
        ).toHaveTextContent(errorText);
      },
      textInputIsValid: async (key: keyof YouthFormData): Promise<void> => {
        const input = await screen.findByTestId(key);
        expect(input).toBeValid();
      },
      schoolsDropdownHasError: async (errorText: RegExp): Promise<void> => {
        const input = await screen.findByRole('combobox', { name: /koulu/i });
        expect(input).toBeInvalid();
        const errorElement = await screen.findByTestId(`selectedSchool-error`);
        expect(errorElement).toHaveTextContent(errorText);
      },
      schoolsDropdownIsValid: async (): Promise<void> => {
        const input = await screen.findByRole('combobox', { name: /koulu/i });
        expect(input).toBeValid();
      },
      checkboxHasError: async (
        name: RegExp,
        errorText: RegExp
      ): Promise<void> => {
        const checkbox = await screen.findByRole('checkbox', { name });
        expect(checkbox.parentElement).toHaveTextContent(errorText);
      },
    },
    actions: {
      typeInput(key: keyof YouthFormData, value: string) {
        const input = screen.getByTestId(key);
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
        const input = await screen.findByRole('combobox', { name: /koulu/i });
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
        key: keyof Pick<
          YouthFormData,
          'termsAndConditions' | 'is_unlisted_school'
        >
      ) {
        const checkbox = screen.getByTestId(key);
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
          name: /lähetä tiedot/i,
        });
        userEvent.click(button);

        if (backendExpectation) {
          await waitFor(() => {
            response.done();
          });
        }
      },
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
    },
  };
};

export default getIndexPageApi;
