import CookieConsent from 'benefit/applicant/components/cookieConsent/CookieConsent';
import { useTranslation } from 'benefit/applicant/i18n';
import { GetStaticProps, NextPage } from 'next';
import Head from 'next/head';
import * as React from 'react';
import Container from 'shared/components/container/Container';
import getServerSideTranslations from 'shared/i18n/get-server-side-translations';

const CookieSettings: NextPage = () => {
  const { t } = useTranslation();

  return (
    <>
      <Head>
        <title>{t('common:pageTitles.cookieSettings')}</title>
      </Head>

      <Container>
        <CookieConsent asPage />
      </Container>
    </>
  );
};

export const getStaticProps: GetStaticProps =
  getServerSideTranslations('common');

export default CookieSettings;
