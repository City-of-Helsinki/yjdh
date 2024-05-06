import { getBackendUrl } from 'kesaseteli-shared/backend-api/backend-api';
import { GetStaticProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import React from 'react';
import FormSection from 'shared/components/forms/section/FormSection';
import { $GridCell } from 'shared/components/forms/section/FormSection.sc';
import NotificationPage from 'shared/components/pages/NotificationPage';
import isRealIntegrationsEnabled from 'shared/flags/is-real-integrations-enabled';
import getServerSideTranslations from 'shared/i18n/get-server-side-translations';
import { getFirstValue } from 'shared/utils/array.utils';

const ThankYouPage: NextPage = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const applicationId = getFirstValue(router.query?.id);

  // The processing link is shown only for testing purposes:
  const showProcessingLink = !isRealIntegrationsEnabled() && applicationId;

  /**
   * TODO: YJDH-702, add UI component & browser tests
   *       similarly as for activation link in youth UI's ThankYouPage,
   *       see e.g. activationLinkIsPresent, clickActivationLink
   */
  return (
    <NotificationPage
      type="success"
      title={t(`common:notificationPages.thankyou.title`)}
      message={t(`common:notificationPages.thankyou.message`)}
    >
      {showProcessingLink && (
        <FormSection columns={1} paddingBottom withoutDivider>
          <$GridCell>
            <a
              data-testid="process"
              href={`${getBackendUrl(
                '/v1/youthapplications/'
              )}${applicationId}/process`}
            >
              {t('common:notificationPages.thankyou.processingLinkLabel')}
            </a>
          </$GridCell>
        </FormSection>
      )}
    </NotificationPage>
  );
};

export const getStaticProps: GetStaticProps =
  getServerSideTranslations('common');

export default ThankYouPage;
