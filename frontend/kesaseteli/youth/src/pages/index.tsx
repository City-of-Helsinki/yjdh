import { GetStaticProps, NextPage } from 'next';
import Head from 'next/head';
import { useTranslation } from 'next-i18next';
import React from 'react';
import Container from 'shared/components/container/Container';
import Heading from 'shared/components/forms/heading/Heading';
import getServerSideTranslations from 'shared/i18n/get-server-side-translations';

const YouthIndex: NextPage = () => {
  const { t } = useTranslation();
  return (
    <Container>
      <Head>
        <title>{t(`common:appName`)}</title>
      </Head>
      <Heading size="l" header={t('common:applicationPage.title')} as="h2" />
      <p>{t('common:applicationPage.paragraph_1')}</p>
    </Container>
  );
};

export const getStaticProps: GetStaticProps =
  getServerSideTranslations('common');

export default YouthIndex;
