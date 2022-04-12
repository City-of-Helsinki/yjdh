import getYouthTranslationsApi from 'kesaseteli/youth/__tests__/utils/i18n/get-youth-translations-api';
import YouthTranslations from 'kesaseteli/youth/__tests__/utils/i18n/youth-translations';
import { screen, userEvent } from 'shared/__tests__/utils/test-utils';
import { DEFAULT_LANGUAGE, Language } from 'shared/i18n/i18n';

type NotificationPage = keyof YouthTranslations['notificationPages'];

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type, @typescript-eslint/explicit-module-boundary-types
const getNotificationPageApi = (
  notificationPage: NotificationPage,
  lang?: Language
) => {
  const {
    translations: { [lang ?? DEFAULT_LANGUAGE]: translations },
    regexp,
    replaced,
  } = getYouthTranslationsApi();
  return {
    expectations: {
      pageIsLoaded() {
        return screen.findByRole('heading', {
          name: translations.notificationPages[notificationPage].title,
        });
      },
      async notificationMessageIsPresent(expirationHours?: number) {
        return screen.findByText(
          replaced(translations.notificationPages[notificationPage].message, {
            expirationHours,
          })
        );
      },
    },
    actions: {
      async clickGoToFrontPageButton() {
        const button = await screen.findByRole('button', {
          name: regexp(
            translations.notificationPages[notificationPage].goToFrontendPage
          ),
        });
        userEvent.click(button);
      },
    },
  };
};

export default getNotificationPageApi;
