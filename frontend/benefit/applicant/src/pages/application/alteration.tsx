import AlterationPage from 'benefit/applicant/components/applications/alteration/AlterationPage';
import { useTranslation } from 'benefit/applicant/i18n';
import { GetStaticProps, NextPage } from 'next';
import Head from 'next/head';
import * as React from 'react';
import withAuth from 'shared/components/hocs/withAuth';
import getServerSideTranslations from 'shared/i18n/get-server-side-translations';

const ApplicationAlterationPage: NextPage = () => {
  const { t } = useTranslation();
  return (
    <>
      <Head>
        <title>
          {t('common:appName')} - {t('applications.pageHeaders.alteration')}
        </title>
      </Head>
      <AlterationPage />
    </>
  );
};

export const getStaticProps: GetStaticProps =
  getServerSideTranslations('common');

export default withAuth(ApplicationAlterationPage);
