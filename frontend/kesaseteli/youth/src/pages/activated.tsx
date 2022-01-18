import useActivationLinkExpirationHours from 'kesaseteli/youth/hooks/useActivationLinkExpirationHours';
import { GetStaticProps, NextPage } from 'next';
import { useTranslation } from 'next-i18next';
import React from 'react';
import Heading from 'shared/components/forms/heading/Heading';
import NotificationPage from 'shared/components/pages/NotificationPage';
import getServerSideTranslations from 'shared/i18n/get-server-side-translations';

const ActivatedPage: NextPage = () => {
  const { t } = useTranslation();
  return (
    <NotificationPage
      type="success"
      title={t(`common:activatedPage.notificationTitle`)}
      message={t(`common:activatedPage.notificationMessage`, {
        expirationHours: useActivationLinkExpirationHours(),
      })}
    >
      <Heading size="l" header={t('common:activatedPage.title')} as="h2" />
      <p>{t('common:activatedPage.paragraph_1')}</p>
    </NotificationPage>
  );
};

export const getStaticProps: GetStaticProps =
  getServerSideTranslations('common');

export default ActivatedPage;
