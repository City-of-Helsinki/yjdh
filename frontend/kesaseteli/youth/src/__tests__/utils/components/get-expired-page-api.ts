import { screen, userEvent } from 'shared/__tests__/utils/test-utils';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type, @typescript-eslint/explicit-module-boundary-types
const getExpiredPageApi = () => ({
  expectations: {
    pageIsLoaded() {
      return screen.findByRole('heading', {
        name: /hups! vahvistuslinkki on vanhentunut./i,
      });
    },
    async notificationMessageIsPresent(hours: number) {
      return screen.findByText(
        new RegExp(
          `ikävä kyllä rekisteröinnin vahvistukseen on kulunut yli ${hours} tuntia. täytäthän rekisteröintikomakkeen uudelleen.`,
          'i'
        )
      );
    },
  },
  actions: {
    async clickGoToFrontPageButton() {
      const button = await screen.findByRole('button', {
        name: /rekisteröidy ja lataa kesäseteli/i,
      });
      userEvent.click(button);
    },
  },
});

export default getExpiredPageApi;
