import PageContent from 'benefit/applicant/components/applications/pageContent/PageContent';
import DeMinimisProvider from 'benefit/applicant/context/DeMinimisProvider';
import { GetStaticProps, NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import * as React from 'react';

const ApplicationIndex: NextPage = () => (
  <DeMinimisProvider>
    <PageContent />
  </DeMinimisProvider>
);

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale || '', ['common'])),
  },
});

export default ApplicationIndex;
