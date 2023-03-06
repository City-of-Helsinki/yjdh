import { useTranslation } from 'benefit/applicant/i18n';
import { GetStaticProps, NextPage } from 'next';
import Head from 'next/head';
import * as React from 'react';
import withAuth from 'shared/components/hocs/withAuth';
import getServerSideTranslations from 'shared/i18n/get-server-side-translations';

import ErrorPage from '../components/errorPage/ErrorPage';
import FrontPageProvider from '../context/FrontPageProvider';

const ApplicantIndex: NextPage = () => {
  const { t } = useTranslation();

  return (
    <>
      <Head>
        <title>{t('common:appName')}</title>
      </Head>

      <FrontPageProvider>
        <ErrorPage
          title={t('common:error.notFound.title')}
          message={t('common:error.notFound.text')}
          showActions={{ linkToRoot: true, linkToLogout: false }}
        />
      </FrontPageProvider>
    </>
  );
};

export const getStaticProps: GetStaticProps =
  getServerSideTranslations('common');

export default withAuth(ApplicantIndex);
