import ActivationErrorPage from 'kesaseteli/youth/components/activation-error-page/ActivationErrorPage';
import useActivationLinkExpirationHours from 'kesaseteli/youth/hooks/useActivationLinkExpirationHours';
import { GetStaticProps } from 'next';
import { useTranslation } from 'next-i18next';
import React from 'react';
import getServerSideTranslations from 'shared/i18n/get-server-side-translations';

const EmailInUsePage: React.FC = () => {
  const { t } = useTranslation();
  return (
    <ActivationErrorPage
      title={t(`common:emailInUsePage.title`)}
      message={t(`common:emailInUsePage.notificationMessage`, {
        expirationHours: useActivationLinkExpirationHours(),
      })}
      goToFrontPageText={t(`common:activationErrorPage.goToFrontendPage`)}
    />
  );
};

export const getStaticProps: GetStaticProps =
  getServerSideTranslations('common');

export default EmailInUsePage;
