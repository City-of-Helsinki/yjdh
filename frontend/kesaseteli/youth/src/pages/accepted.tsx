import { GetStaticProps, NextPage } from 'next';
import { useTranslation } from 'next-i18next';
import React from 'react';
import NotificationPage from 'shared/components/pages/NotificationPage';
import getServerSideTranslations from 'shared/i18n/get-server-side-translations';

const AcceptedPage: NextPage = () => {
  const { t } = useTranslation();
  return (
    <NotificationPage
      type="success"
      title={t(`common:notificationPages.accepted.title`)}
      message={t(`common:notificationPages.accepted.message`)}
    />
  );
};

export const getStaticProps: GetStaticProps =
  getServerSideTranslations('common');

export default AcceptedPage;
