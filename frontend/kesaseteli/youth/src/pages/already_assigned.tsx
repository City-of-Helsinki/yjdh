import { GetStaticProps } from 'next';
import { useTranslation } from 'next-i18next';
import React from 'react';
import NotificationPage from 'shared/components/pages/NotificationPage';
import getServerSideTranslations from 'shared/i18n/get-server-side-translations';

const AlreadyAssignedPage: React.FC = () => {
  const { t } = useTranslation();
  return (
    <NotificationPage
      type="error"
      title={t(`common:notificationPages.alreadyAssigned.title`)}
      goToFrontPageText={t(
        `common:notificationPages.alreadyAssigned.goToFrontendPage`
      )}
    />
  );
};

export const getStaticProps: GetStaticProps =
  getServerSideTranslations('common');

export default AlreadyAssignedPage;
