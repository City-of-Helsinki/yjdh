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
          `huom! saat sähköpostiisi aktivointilinkin, joka täytyy aktivoida ${hours} tunnin kuluessa`,
          'i'
        )
      );
    },
  },
  actions: {
    async clickGoToFrontPageButton() {
      const button = await screen.findByRole('button', {
        name: /kesäseteli etusivulle/i,
      });
      userEvent.click(button);
    },
  },
});

export default getThankYouPageApi;
