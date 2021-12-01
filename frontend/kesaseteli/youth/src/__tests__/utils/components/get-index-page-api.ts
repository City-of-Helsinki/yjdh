import YouthFormData from 'kesaseteli/youth/types/youth-form-data';
import nock from 'nock';
import { screen, userEvent } from 'shared/__tests__/utils/test-utils';

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
      schoolDropdownIsDisabled: async (): Promise<void> => {
        const input = await screen.findByRole('combobox', { name: /koulu/i });
        expect(input).toBeDisabled();
      },
      schoolDropdownIsEnabled: async (): Promise<void> => {
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
      schoolDropdownHasError: async (errorText: RegExp): Promise<void> => {
        const input = await screen.findByRole('combobox', { name: /koulu/i });
        expect(input).toBeInvalid();
        const errorElement = await screen.findByTestId(`school-error`);
        expect(errorElement).toHaveTextContent(errorText);
      },
      schoolDropdownIsValid: async (): Promise<void> => {
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
      typeInput: (key: keyof YouthFormData, value: string) => {
        const input = screen.getByTestId(key);
        userEvent.clear(input);
        if (value?.length > 0) {
          userEvent.type(input, value);
        }
        (youthFormData[key] as string) = value;
        userEvent.click(document.body);
      },
      typeAndSelectSchoolFromDropdown: async (
        value: string,
        expectedOption?: string
      ) => {
        const input = await screen.findByRole('combobox', { name: /koulu/i });
        userEvent.clear(input);
        userEvent.type(input, value);
        const option = expectedOption ?? value;
        const schoolOption = await screen.findByText(new RegExp(option, 'i'));
        userEvent.click(schoolOption);
        expect(input).toHaveValue(option);
        youthFormData.school = { name: option ?? value };
      },
      toggleCheckbox: async (name: RegExp) => {
        const checkbox = screen.getByRole('checkbox', { name });
        userEvent.click(checkbox);
      },
      clickSaveButton: async ({
        expectToPassValidation = true,
      }: {
        expectToPassValidation: boolean;
      }) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        let save: nock.Scope;
        if (expectToPassValidation) {
          // TODO: add this when backend call is implemented
          // save = expectToSaveYouthApplication(youthFormData);
        }
        const button = await screen.findByRole('button', {
          name: /lähetä tiedot/i,
        });
        userEvent.click(button);
        /*
          TODO: add when backend call is implemented
          if (expectToPassValidation) {
            await waitFor(() => {
              save.done();
            })
          }
           */
      },
    },
  };
};

export default getIndexPageApi;
