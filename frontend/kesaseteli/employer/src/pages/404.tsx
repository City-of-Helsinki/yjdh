import { GetStaticProps, NextPage } from 'next';
import Head from 'next/head';
import { Trans, useTranslation } from 'next-i18next';
import React from 'react';
import Container from 'shared/components/container/Container';
import LinkText from 'shared/components/link-text/LinkText';
import getServerSideTranslations from 'shared/i18n/get-server-side-translations';

import { $Notification } from '../components/application/login.sc';

const PageNotFound: NextPage = () => {
  const { t } = useTranslation();
  return (
    <Container>
      <Head>
        <title>
          {t(`common:404Page.pageNotFoundLabel`)} | {t(`common:appName`)}
        </title>
      </Head>
      <$Notification
        label={t(`common:404Page.pageNotFoundLabel`)}
        type="alert"
        size="large"
      >
        <Trans
          i18nKey="common:404Page.pageNotFoundContent"
          components={{
            lnk: <LinkText href="/">{}</LinkText>,
          }}
        />
      </$Notification>
    </Container>
  );
};

export const getStaticProps: GetStaticProps =
  getServerSideTranslations('common');

export default PageNotFound;
