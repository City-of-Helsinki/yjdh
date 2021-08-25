import nock from 'nock';
import { waitForLoadingSpinnerToComplete } from 'shared/__tests__/utils/component.utils';
import { screen, userEvent, waitFor } from 'shared/__tests__/utils/test-utils';

export type GetErrorPageApi = {
  expectations: {
    displayErrorPage: () => Promise<void>;
    allApiRequestsDone: () => Promise<void>;
  };
  actions: {
    clickToRefreshPage: () => void;
    clickLogoutButton: (request: nock.Scope) => void;
  };
};

const getErrorPageApi = (
  ...failingRequests: Array<nock.Scope>
): GetErrorPageApi => {
  if (failingRequests.length === 0) {
    throw new Error(
      'At least one failing requested is needed to show error page'
    );
  }
  const requests = [...failingRequests];
  const expectAllApiRequestsDone = async (): Promise<void> => {
    await waitFor(() => {
      requests.forEach((req) => expect(req.isDone()).toBeTruthy());
    });
    // clear requests
    requests.length = 0;
  };
  return {
    expectations: {
      allApiRequestsDone: expectAllApiRequestsDone,
      displayErrorPage: async (): Promise<void> => {
        await waitForLoadingSpinnerToComplete();
        await expectAllApiRequestsDone();
        expect(
          screen.queryByRole('heading', {
            name: /(palvelussa on valitettavasti tapahtunut virhe)|(errorpage.title)/i,
          })
        ).toBeInTheDocument();
      },
    },
    actions: {
      clickToRefreshPage: (): void => {
        userEvent.click(
          screen.getByRole('button', {
            name: /(lataa sivu uudelleen)|(errorpage.retry)/i,
          })
        );
      },
      clickLogoutButton: (expectLogoutRequest: nock.Scope): void => {
        requests.push(expectLogoutRequest);
        userEvent.click(
          screen.getByRole('button', {
            name: /(kirjaudu ulos)|(errorpage.logout)/i,
          })
        );
      },
    },
  };
};

export default getErrorPageApi;
