import { screen, userEvent, within, waitFor } from 'shared/__tests__/utils/test-utils';
import TetPosting from 'tet-shared/types/tetposting';
import { escapeRegExp } from 'shared/utils/regex.utils';

const getEditorApi = (expectedPosting?: TetPosting) => {
  const expectations = {
    fieldValueIsPresent: async <K extends keyof TetPosting>(key: K): Promise<void> => {
      const field = await screen.findByTestId(`posting-form-${key}`);
      if (!expectedPosting) {
        throw new Error('you forgot to give expected application values for the test');
      }
      const value = expectedPosting[key] as string;
      expect(field).toHaveValue(value);
    },
    textInputHasError: async <K extends keyof TetPosting>(key: K): Promise<void> => {
      const field = await screen.findByTestId(`posting-form-${key}`);
      const parent = field?.parentElement?.parentElement;
      await within(parent).findByText(/tieto vaaditaan/i);
    },
    comboboxHasError: async (labelText: string): Promise<void> => {
      const field = await screen.findByRole('combobox', {
        name: new RegExp(labelText, 'i'),
      });
      const parent = field?.parentElement?.parentElement;
      await within(parent).findByText(/tieto vaaditaan/i);
    },
    dropdownHasError: async (labelText: string): Promise<void> => {
      const field = await screen.findByRole('button', {
        name: new RegExp(labelText, 'i'),
      });
      const parent = field?.parentElement?.parentElement;
      await within(parent).findByText(/tieto vaaditaan/i);
    },
    selectionGroupHasError: async (labelText: string): Promise<void> => {
      await waitFor(async () => {
        const group = await screen.findByRole('group', {
          name: new RegExp(labelText, 'i'),
        });
        await within(group.parentElement).findByText(/valitse vähintään yksi/i);
      });
      //await expect(screen.getByText(/valitse vähintään yksi/i)).toBeInTheDocument();
      //await waitFor(() => expect(screen.getByText(/valitse vähintään yksi/i)).toBeInTheDocument(), {
      //timeout: 5000,
      //});
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
