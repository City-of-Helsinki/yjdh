import { screen, userEvent } from 'shared/__tests__/utils/test-utils';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type, @typescript-eslint/explicit-module-boundary-types
const getAlreadyActivatedPageApi = () => ({
  expectations: {
    pageIsLoaded() {
      return screen.findByRole('heading', {
        name: /hups! vahvistuslinkki on jo aktivoitu/i,
      });
    },
  },
  actions: {
    async clickGoToFrontPageButton() {
      const button = await screen.findByRole('button', {
        name: /rekisteröidy ja lähetä kesäseteli uudelleen/i,
      });
      userEvent.click(button);
    },
  },
});

export default getAlreadyActivatedPageApi;
