import { expectToLogout } from 'kesaseteli-shared/__tests__/utils/backend/backend-nocks';
import { expectBackendRequestsToComplete } from 'shared/__tests__/utils/component.utils';
import { screen, userEvent, waitFor } from 'shared/__tests__/utils/test-utils';

const ErrorPageApi = {
  expectations: {
    displayErrorPage: async (): Promise<void> => {
      await waitFor(() => {
        expectBackendRequestsToComplete();
        expect(
          screen.getByRole('heading', {
            name: /(palvelussa on valitettavasti tapahtunut virhe)|(errorpage.title)/i,
          })
        ).toBeInTheDocument();
      });
    },
  },
  actions: {
    clickToRefreshPage: async (): Promise<void> =>
      userEvent.click(
        screen.getByRole('button', {
          name: /(lataa sivu uudelleen)|(errorpage.retry)/i,
        })
      ),
    clickLogoutButton: async (): Promise<void> => {
      const logout = expectToLogout();
      await userEvent.click(
        screen.getByRole('button', {
          name: /(kirjaudu ulos)|(errorpage.logout)/i,
        })
      );
      return waitFor(() => logout.done());
    },
  },
};

export default ErrorPageApi;
