import { screen, userEvent } from 'shared/__tests__/utils/test-utils';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type, @typescript-eslint/explicit-module-boundary-types
const getAlreadyActivatedPageApi = () => ({
  expectations: {
    pageIsLoaded() {
      return screen.findByRole('heading', {
        name: /hups! antamallasi tiedoilla on jo myönnetty kesäseteli./i,
      });
    },
  },
  actions: {
    async clickGoToFrontPageButton() {
      const button = await screen.findByRole('button', {
        name: /tarkista tiedot ja lähetä uudelleen/i,
      });
      userEvent.click(button);
    },
  },
});

export default getAlreadyActivatedPageApi;
