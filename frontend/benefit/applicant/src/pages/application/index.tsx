import PageContent from 'benefit/applicant/components/applications/pageContent/PageContent';
import ApplicationProvider from 'benefit/applicant/context/ApplicationProvider';
import { GetStaticProps, NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import * as React from 'react';

const ApplicationIndex: NextPage = () => (
  <ApplicationProvider>
    <PageContent />
  </ApplicationProvider>
);

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale || '', ['common'])),
  },
});

export default ApplicationIndex;
