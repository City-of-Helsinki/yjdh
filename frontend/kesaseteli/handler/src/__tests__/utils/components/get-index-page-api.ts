import {
  expectToGetYouthApplication,
  expectToPostYouthApplication,
  expectToPostYouthApplicationError,
} from 'kesaseteli/handler/__tests__/utils/backend/backend-nocks';
import { YOUTH_APPLICATION_STATUS_HANDLER_CANNOT_PROCEED } from 'kesaseteli-shared/constants/status-constants';
import CreatedYouthApplication from 'kesaseteli-shared/types/created-youth-application';
import { screen, userEvent } from 'shared/__tests__/utils/test-utils';
import { escapeRegExp } from 'shared/utils/regex.utils';
import { assertUnreachable } from 'shared/utils/typescript.utils';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type, @typescript-eslint/explicit-module-boundary-types
const getIndexPageApi = (expectedApplication?: CreatedYouthApplication) => ({
  expectations: {
    pageIsLoaded: async () => {
      await screen.findByRole('heading', {
        name: /hakemuksen tiedot/i,
      });
    },
    applicationWasNotFound: async () => {
      await screen.findByRole('heading', {
        name: /hakemusta ei löytynyt/i,
      });
    },
    fieldValueIsPresent: async <K extends keyof CreatedYouthApplication>(
      key: K,
      transform?: (value: CreatedYouthApplication[K]) => string
    ): Promise<void> => {
      const field = await screen.findByTestId(`handlerApplication-${key}`);
      if (!expectedApplication) {
        throw new Error(
          'you forgot to give expected application values for the test'
        );
      }
      const value = transform
        ? transform(expectedApplication[key])
        : (expectedApplication[key] as string);
      expect(field).toHaveTextContent(escapeRegExp(value));
    },
    nameIsPresent: async ({
      first_name,
      last_name,
    }: CreatedYouthApplication): Promise<void> => {
      const field = await screen.findByTestId(`handlerApplication-name`);
      expect(field).toHaveTextContent(
        escapeRegExp(`${first_name} ${last_name}`)
      );
    },
    actionButtonsArePresent: async (): Promise<void> => {
      await screen.findByRole('button', {
        name: /hyväksy/i,
      });
      await screen.findByRole('button', {
        name: /hylkää/i,
      });
    },
    actionButtonsAreNotPresent: (): void => {
      expect(
        screen.queryByRole('button', {
          name: /hyväksy/i,
        })
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('button', {
          name: /hylkää/i,
        })
      ).not.toBeInTheDocument();
    },

    statusNotificationIsPresent: async (
      status: typeof YOUTH_APPLICATION_STATUS_HANDLER_CANNOT_PROCEED[number]
      // eslint-disable-next-line consistent-return
    ): Promise<HTMLElement | undefined> => {
      switch (status) {
        case 'submitted':
          return screen.findByRole('heading', {
            name: /nuori ei ole vielä aktivoinut hakemusta/i,
          });

        case 'additional_information_requested':
          return screen.findByRole('heading', {
            name: /nuori ei ole vielä täyttänyt lisätietohakemusta/i,
          });

        case 'accepted':
          return screen.findByRole('heading', {
            name: /hyväksytty/i,
          });

        case 'rejected':
          return screen.findByRole('heading', {
            name: /hylätty/i,
          });

        default:
          assertUnreachable(status, 'Unknown status');
      }
    },
  },
  actions: {
    clickButton: (type: 'accept' | 'reject', errorCode?: 400 | 500): void => {
      if (!expectedApplication) {
        throw new Error(
          'you forgot to give expected application values for the test'
        );
      }
      if (errorCode) {
        expectToPostYouthApplicationError(
          type,
          expectedApplication.id,
          errorCode
        );
      } else {
        expectToPostYouthApplication(type, expectedApplication);
        expectToGetYouthApplication({
          ...expectedApplication,
          status: type === 'accept' ? 'accepted' : 'rejected',
        });
      }
      userEvent.click(screen.getByTestId(`${type}-button`));
    },
  },
});

export default getIndexPageApi;
