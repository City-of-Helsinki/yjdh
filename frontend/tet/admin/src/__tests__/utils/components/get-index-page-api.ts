import { screen } from 'shared/__tests__/utils/test-utils';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type, @typescript-eslint/explicit-module-boundary-types
const getIndexPageApi = () => ({
  expectations: {
    pageIsLoaded() {
      return screen.findByRole('heading', {
        name: /tet-paikkailmoitukset/i,
      });
    },
  },
});

export default getIndexPageApi;
