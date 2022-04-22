import { GetStaticProps } from 'next';
import { useTranslation } from 'next-i18next';
import React from 'react';
import NotificationPage from 'shared/components/pages/NotificationPage';
import getServerSideTranslations from 'shared/i18n/get-server-side-translations';

const InadmissibleDataPage: React.FC = () => {
  const { t } = useTranslation();
  return (
    <NotificationPage
      type="error"
      title={t(`common:notificationPages.inadmissibleData.title`)}
      message={t(`common:notificationPages.inadmissibleData.message`)}
      goToFrontPageText={t(
        `common:notificationPages.inadmissibleData.goToFrontendPage`
      )}
    />
  );
};

export const getStaticProps: GetStaticProps =
  getServerSideTranslations('common');

export default InadmissibleDataPage;
