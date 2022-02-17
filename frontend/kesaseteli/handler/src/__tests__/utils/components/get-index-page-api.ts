import CreatedYouthApplication from 'kesaseteli-shared/types/created-youth-application';
import { screen } from 'shared/__tests__/utils/test-utils';
import { escapeRegExp } from 'shared/utils/regex.utils';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type, @typescript-eslint/explicit-module-boundary-types
const getIndexPageApi = (expectedApplication?: CreatedYouthApplication) => ({
  expectations: {
    pageIsLoaded: async () => {
      await screen.findByRole('heading', {
        name: /hakemuksen tiedot/i,
      });
    },
    applicationWasNotFound: async () => {
      await screen.findByRole('heading', {
        name: /hakemusta ei löytynyt/i,
      });
    },
    fieldValueIsPresent: async <K extends keyof CreatedYouthApplication>(
      key: K,
      transform?: (value: CreatedYouthApplication[K]) => string
    ): Promise<void> => {
      const field = await screen.findByTestId(`handlerApplication-${key}`);
      if (!expectedApplication) {
        throw new Error(
          'you forgot to give expected application values for the test'
        );
      }
      const value = transform
        ? transform(expectedApplication[key])
        : (expectedApplication[key] as string);
      expect(field).toHaveTextContent(escapeRegExp(value));
    },
    nameIsPresent: async ({
      first_name,
      last_name,
    }: CreatedYouthApplication): Promise<void> => {
      const field = await screen.findByTestId(`handlerApplication-name`);
      expect(field).toHaveTextContent(
        escapeRegExp(`${first_name} ${last_name}`)
      );
    },
  },
  actions: {},
});

export default getIndexPageApi;
