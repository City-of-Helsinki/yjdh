import { screen, userEvent } from 'shared/__tests__/utils/test-utils';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type, @typescript-eslint/explicit-module-boundary-types
const getThankYouPageApi = () => ({
  expectations: {
    pageIsLoaded() {
      return screen.findByRole('heading', {
        name: /hienoa! olet lähettänyt tietosi kesäsetelijärjestelmään/i,
      });
    },
    async activationInfoTextIsPresent(hours: number) {
      return screen.findByText(
        new RegExp(
          `Hienoa! Sait sähköpostiin Kesäsetelin aktivointi-linkin, joka täytyy aktivoida ${hours} tunnin kuluessa.`,
          'i'
        )
      );
    },
    async activationLinkIsPresent(url: string) {
      const link = await screen.findByRole('link', { name: 'AKTIVOI' });
      expect(link).toHaveAttribute('href', url);
    },
    async activationLinkIsNotPresent() {
      return expect(
        screen.queryByRole('link', { name: 'AKTIVOI' })
      ).not.toBeInTheDocument();
    },
  },
  actions: {
    async clickGoToFrontPageButton() {
      const button = await screen.findByRole('button', {
        name: /siirry kesäsetelin etusivulle/i,
      });
      userEvent.click(button);
    },
  },
});

export default getThankYouPageApi;
