import ActivationErrorPage from 'kesaseteli/youth/components/activation-error-page/ActivationErrorPage';
import { GetStaticProps } from 'next';
import { useTranslation } from 'next-i18next';
import React from 'react';
import getServerSideTranslations from 'shared/i18n/get-server-side-translations';

const AlreadyActivatedPage: React.FC = () => {
  const { t } = useTranslation();
  return (
    <ActivationErrorPage
      title={t(`common:alreadyActivatedPage.title`)}
      message={t(`common:alreadyActivatedPage.notificationMessage`)}
      goToFrontPageText={t('common:alreadyActivatedPage.goToFrontendPage')}
    />
  );
};

export const getStaticProps: GetStaticProps =
  getServerSideTranslations('common');

export default AlreadyActivatedPage;
