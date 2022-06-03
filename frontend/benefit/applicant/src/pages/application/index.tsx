import PageContent from 'benefit/applicant/components/applications/pageContent/PageContent';
import DeMinimisProvider from 'benefit/applicant/context/DeMinimisProvider';
import { GetStaticProps, NextPage } from 'next';
import * as React from 'react';
import withAuth from 'shared/components/hocs/withAuth';
import getServerSideTranslations from 'shared/i18n/get-server-side-translations';

const ApplicationIndex: NextPage = () => (
  <DeMinimisProvider>
    <PageContent />
  </DeMinimisProvider>
);

export const getStaticProps: GetStaticProps =
  getServerSideTranslations('common');

export default withAuth(ApplicationIndex);
