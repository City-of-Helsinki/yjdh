import ActivationErrorPage from 'kesaseteli/youth/components/activation-error-page/ActivationErrorPage';
import useActivationLinkExpirationHours from 'kesaseteli/youth/hooks/useActivationLinkExpirationHours';
import { GetStaticProps } from 'next';
import { useTranslation } from 'next-i18next';
import React from 'react';
import getServerSideTranslations from 'shared/i18n/get-server-side-translations';

const ExpiredPage: React.FC = () => {
  const { t } = useTranslation();
  return (
    <ActivationErrorPage
      title={t(`common:expiredPage.title`)}
      message={t(`common:expiredPage.notificationMessage`, {
        expirationHours: useActivationLinkExpirationHours(),
      })}
      goToFrontPageText={t('common:expiredPage.goToFrontendPage')}
    />
  );
};

export const getStaticProps: GetStaticProps =
  getServerSideTranslations('common');

export default ExpiredPage;
