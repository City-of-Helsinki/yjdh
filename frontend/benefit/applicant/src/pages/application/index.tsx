import PageContent from 'benefit/applicant/components/applications/pageContent/PageContent';
import DeMinimisProvider from 'benefit/applicant/context/DeMinimisProvider';
import { useTranslation } from 'benefit/applicant/i18n';
import { GetStaticProps, NextPage } from 'next';
import Head from 'next/head';
import * as React from 'react';
import withAuth from 'shared/components/hocs/withAuth';
import getServerSideTranslations from 'shared/i18n/get-server-side-translations';

const ApplicationIndex: NextPage = () => {
  const { t } = useTranslation();
  return (
    <>
      <Head>
        <title>
          {t('common:appName')} - {t('applications.pageHeaders.edit')}
        </title>
      </Head>
      <DeMinimisProvider>
        <PageContent />
      </DeMinimisProvider>
    </>
  );
};

export const getStaticProps: GetStaticProps =
  getServerSideTranslations('common');

export default withAuth(ApplicationIndex);
