import { screen } from 'shared/__tests__/utils/test-utils';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type, @typescript-eslint/explicit-module-boundary-types
const getIndexPageApi = () => ({
  expectations: {
    pageIsLoaded: async () => {
      await screen.findByRole('heading', {
        name: /rekisteröidy ja saat henkilökohtaisen kesäsetelin käyttöösi/i,
      });
    },
  },
  actions: {},
});

export default getIndexPageApi;
