import { screen, userEvent, within } from 'shared/__tests__/utils/test-utils';
import TetPosting from 'tet-shared/types/tetposting';
import { escapeRegExp } from 'shared/utils/regex.utils';

const getEditorApi = (expectedPosting?: TetPosting) => {
  const expectations = {
    fieldValueIsPresent: async <K extends keyof TetPosting>(
      key: K,
      transform?: (value: TetPosting[K]) => string,
    ): Promise<void> => {
      const field = await screen.findByTestId(`posting-form-${key}`);
      if (!expectedPosting) {
        throw new Error('you forgot to give expected application values for the test');
      }
      const value = transform ? transform(expectedPosting[key]) : (expectedPosting[key] as string);
      expect(field).toHaveTextContent(escapeRegExp(value));
    },
  };
  const actions = {};
  return {
    expectations,
    actions,
  };
};

export default getEditorApi;
