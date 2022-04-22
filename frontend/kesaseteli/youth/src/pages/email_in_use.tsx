import useActivationLinkExpirationHours from 'kesaseteli/youth/hooks/useActivationLinkExpirationHours';
import { GetStaticProps } from 'next';
import { useTranslation } from 'next-i18next';
import React from 'react';
import NotificationPage from 'shared/components/pages/NotificationPage';
import getServerSideTranslations from 'shared/i18n/get-server-side-translations';

const EmailInUsePage: React.FC = () => {
  const { t } = useTranslation();
  return (
    <NotificationPage
      type="error"
      title={t(`common:notificationPages.emailInUse.title`)}
      message={t(`common:notificationPages.emailInUse.message`, {
        expirationHours: useActivationLinkExpirationHours(),
      })}
      goToFrontPageText={t(
        `common:notificationPages.emailInUse.goToFrontendPage`
      )}
    />
  );
};

export const getStaticProps: GetStaticProps =
  getServerSideTranslations('common');

export default EmailInUsePage;
