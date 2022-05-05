import getNotificationPageApi from 'kesaseteli/youth/__tests__/utils/components/get-notification-page-api';
import getYouthTranslationsApi from 'kesaseteli/youth/__tests__/utils/i18n/get-youth-translations-api';
import { screen } from 'shared/__tests__/utils/test-utils';
import { DEFAULT_LANGUAGE, Language } from 'shared/i18n/i18n';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type, @typescript-eslint/explicit-module-boundary-types
const getThankYouPageApi = (lang?: Language) => {
  const {
    translations: { [lang ?? DEFAULT_LANGUAGE]: translations },
    replaced,
  } = getYouthTranslationsApi();
  const notificationPageApi = getNotificationPageApi('thankyou');
  return {
    expectations: {
      ...notificationPageApi.expectations,
      async activationInfoTextIsPresent(expirationHours: string) {
        return replaced(translations.notificationPages.thankyou.message, {
          expirationHours,
        });
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
    actions: notificationPageApi.actions,
  };
};

export default getThankYouPageApi;
