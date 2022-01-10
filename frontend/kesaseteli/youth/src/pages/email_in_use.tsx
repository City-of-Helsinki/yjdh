import useActivationLinkExpirationHours from 'kesaseteli/youth/hooks/useActivationLinkExpirationHours';
import { GetStaticProps } from 'next';
import { useTranslation } from 'next-i18next';
import React from 'react';
import getServerSideTranslations from 'shared/i18n/get-server-side-translations';
import ActivationErrorPage from 'kesaseteli/youth/components/activation-error-page/ActivationErrorPage';

const EmailInUsePage: React.FC = () => {
  const { t } = useTranslation();
  return (
    <ActivationErrorPage
      title={t(`common:emailInUsePage.title`)}
      message={t(`common:emailInUsePage.notificationMessage`, {
        expirationHours: useActivationLinkExpirationHours(),
      })}
    />
  );
};

export const getStaticProps: GetStaticProps =
  getServerSideTranslations('common');

export default EmailInUsePage;
