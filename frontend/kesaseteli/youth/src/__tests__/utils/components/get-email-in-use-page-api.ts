import { screen, userEvent } from 'shared/__tests__/utils/test-utils';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type, @typescript-eslint/explicit-module-boundary-types
const getEmailInUseApi = () => ({
  expectations: {
    pageIsLoaded() {
      return screen.findByRole('heading', {
        name: /sähköposti on jo käytössä!/i,
      });
    },
    async notificationMessageIsPresent(hours: number) {
      return screen.findByText(
        new RegExp(
          `Jos kyeessä on virhe, odota ${hours} tuntia ja yritä uudelleen.`,
          'i'
        )
      );
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

export default getEmailInUseApi;
