import { GetStaticProps } from 'next';
import { useTranslation } from 'next-i18next';
import React from 'react';
import NotificationPage from 'shared/components/pages/NotificationPage';
import getServerSideTranslations from 'shared/i18n/get-server-side-translations';

const AlreadyActivatedPage: React.FC = () => {
  const { t } = useTranslation();
  return (
    <NotificationPage
      type="error"
      title={t(`common:alreadyActivatedPage.title`)}
      message={t(`common:alreadyActivatedPage.notificationMessage`)}
      goToFrontPageText={t('common:alreadyActivatedPage.goToFrontendPage')}
    />
  );
};

export const getStaticProps: GetStaticProps =
  getServerSideTranslations('common');

export default AlreadyActivatedPage;
