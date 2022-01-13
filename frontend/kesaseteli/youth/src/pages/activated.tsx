import { GetStaticProps, NextPage } from 'next';
import Head from 'next/head';
import { useTranslation } from 'next-i18next';
import React from 'react';
import Container from 'shared/components/container/Container';
import Heading from 'shared/components/forms/heading/Heading';
import { $Notification } from 'shared/components/notification/Notification.sc';
import getServerSideTranslations from 'shared/i18n/get-server-side-translations';

const ActivatedPage: NextPage = () => {
  const { t } = useTranslation();

  return (
    <Container>
      <Head>
        <title>
          {t(`common:activatedPage.title`)} | {t(`common:appName`)}
        </title>
      </Head>
      <$Notification
        label={t(`common:activatedPage.notificationTitle`)}
        type="success"
        size="large"
      >
        {t('common:activatedPage.notificationMessage')}
      </$Notification>
      <Heading size="l" header={t('common:activatedPage.title')} as="h2" />
      <p>{t('common:activatedPage.paragraph_1')}</p>
    </Container>
  );
};

export const getStaticProps: GetStaticProps =
  getServerSideTranslations('common');

export default ActivatedPage;
