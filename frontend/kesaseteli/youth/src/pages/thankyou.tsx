import useActivationLinkExpirationHours from 'kesaseteli/youth/hooks/useActivationLinkExpirationHours';
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
  const showActivationLink = !isRealIntegrationsEnabled() && applicationId;

  return (
    <NotificationPage
      type="success"
      title={t(`common:thankyouPage.notificationTitle`)}
      message={t(`common:thankyouPage.notificationMessage`, {
        expirationHours: useActivationLinkExpirationHours(),
      })}
      goToFrontPageText={t('common:thankyouPage.goToFrontendPage')}
    >
      {showActivationLink && (
        <FormSection columns={1} paddingBottom withoutDivider>
          <$GridCell>
            <a
              data-testid="activate"
              href={`${getBackendUrl(
                '/v1/youthapplications/'
              )}${applicationId}/activate`}
            >
              AKTIVOI
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
