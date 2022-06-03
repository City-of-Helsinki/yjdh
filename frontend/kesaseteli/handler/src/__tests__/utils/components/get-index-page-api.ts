import {
  expectToGetYouthApplication,
  expectToPatchYouthApplication,
  expectToPatchYouthApplicationError,
} from 'kesaseteli/handler/__tests__/utils/backend/backend-nocks';
import getHandlerTranslationsApi from 'kesaseteli/handler/__tests__/utils/i18n/get-handler-translations-api';
import CompleteOperation from 'kesaseteli/handler/types/complete-operation';
import VtjExceptionType from 'kesaseteli/handler/types/vtj-exception-type';
import ActivatedYouthApplication from 'kesaseteli-shared/types/activated-youth-application';
import { waitForBackendRequestsToComplete } from 'shared/__tests__/utils/component.utils';
import {
  BoundFunctions,
  queries,
  screen,
  userEvent,
  within,
} from 'shared/__tests__/utils/test-utils';

const withinVtjInfo = (): BoundFunctions<typeof queries> =>
  within(screen.getByTestId('vtj-info'));

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type, @typescript-eslint/explicit-module-boundary-types
const getIndexPageApi = async (
  expectedApplication?: ActivatedYouthApplication
) => {
  const {
    translations: { fi: translations },
    regexp,
    replaced,
  } = getHandlerTranslationsApi();

  const expectations = {
    pageIsLoaded: async () => {
      await screen.findByRole('heading', {
        name: translations.handlerApplication.title,
      });
      await waitForBackendRequestsToComplete();
    },
    applicationWasNotFound: async () => {
      await screen.findByRole('heading', {
        name: translations.handlerApplication.notFound,
      });
    },
    fieldValueIsPresent: async <K extends keyof ActivatedYouthApplication>(
      key: K,
      transform?: (value: ActivatedYouthApplication[K]) => string
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
      expect(field).toHaveTextContent(regexp(value));
    },
    nameIsPresent: async ({
      first_name,
      last_name,
    }: ActivatedYouthApplication): Promise<void> => {
      const field = await screen.findByTestId(`handlerApplication-name`);
      expect(field).toHaveTextContent(regexp(`${first_name} ${last_name}`));
    },
    additionalInfoIsPresent: async (): Promise<void> => {
      await screen.findByRole('heading', {
        name: translations.handlerApplication.additionalInfoTitle,
      });
    },
    additionalInfoIsNotPresent: (): void => {
      expect(
        screen.queryByRole('heading', {
          name: translations.handlerApplication.additionalInfoTitle,
        })
      ).not.toBeInTheDocument();
    },
    additionalInfoReasonsAreShown: async (): Promise<void> => {
      await expectations.fieldValueIsPresent(
        'additional_info_user_reasons',
        (additional_info_user_reasons) =>
          additional_info_user_reasons
            ?.map((reason) => translations.reasons[reason])
            .join('. ') ?? ''
      );
    },
    vtjInfoIsPresent: async (): Promise<void> => {
      await screen.findByRole('heading', {
        name: translations.handlerApplication.vtjInfo.title,
      });
    },
    vtjFieldValueIsPresent: async (
      key: keyof typeof translations.handlerApplication.vtjInfo,
      value: string
    ): Promise<void> => {
      const field = await withinVtjInfo().findByTestId(
        `handlerApplication-vtjInfo.${key}`
      );
      expect(field).toHaveTextContent(regexp(value));
    },

    vtjErrorMessageIsPresent: async (
      key: VtjExceptionType,
      params?: Record<string, string | number>
    ): Promise<void> => {
      await screen.findByText(
        replaced(
          translations.handlerApplication.vtjException[key],
          params ?? {}
        )
      );
    },
    vtjErrorMessageIsNotPresent: async (
      key: VtjExceptionType,
      params?: Record<string, string | number>
    ): Promise<void> => {
      expect(
        screen.queryByText(
          replaced(
            translations.handlerApplication.vtjException[key],
            params ?? {}
          )
        )
      ).not.toBeInTheDocument();
    },

    actionButtonsArePresent: async (): Promise<void> => {
      await screen.findByRole('button', {
        name: translations.handlerApplication.accept,
      });
      await screen.findByRole('button', {
        name: translations.handlerApplication.reject,
      });
    },
    actionButtonsAreNotPresent: (): void => {
      expect(
        screen.queryByRole('button', {
          name: translations.handlerApplication.accept,
        })
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('button', {
          name: translations.handlerApplication.reject,
        })
      ).not.toBeInTheDocument();
    },

    statusNotificationIsPresent: async (
      status: keyof typeof translations.handlerApplication.notification
    ): Promise<HTMLElement> =>
      screen.findByRole('heading', {
        name: translations.handlerApplication.notification[status],
      }),
    showsConfirmDialog: async (type: CompleteOperation['type']) => {
      const dialog = await screen.findByRole('dialog');
      return within(dialog).findByText(translations.dialog[type].content);
    },
  };
  const actions = {
    clickCompleteButton: (type: CompleteOperation['type']): void => {
      userEvent.click(screen.getByTestId(`${type}-button`));
    },
    clickConfirmButton: async (
      type: CompleteOperation['type'],
      errorCode?: 400 | 500
    ) => {
      if (!expectedApplication) {
        throw new Error(
          'you forgot to give expected application values for the test'
        );
      }
      if (errorCode) {
        expectToPatchYouthApplicationError(
          type,
          expectedApplication,
          errorCode
        );
      } else {
        expectToPatchYouthApplication(type, expectedApplication);
        expectToGetYouthApplication({
          ...expectedApplication,
          status: type === 'accept' ? 'accepted' : 'rejected',
        });
      }
      const dialog = await screen.findByRole('dialog');
      userEvent.click(
        within(dialog).getByRole('button', {
          name: translations.dialog[type].submit,
        })
      );
      await waitForBackendRequestsToComplete();
    },
    clickCancelButton: async () => {
      const dialog = await screen.findByRole('dialog');
      userEvent.click(
        within(dialog).getByRole('button', { name: translations.dialog.cancel })
      );
    },
  };
  await expectations.pageIsLoaded();
  return {
    expectations,
    actions,
  };
};

export default getIndexPageApi;
