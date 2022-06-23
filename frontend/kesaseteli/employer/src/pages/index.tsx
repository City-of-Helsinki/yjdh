import useLoadDraftOrCreateNewApplication from 'kesaseteli/employer/hooks/application/useLoadDraftOrCreateNewApplication';
import { GetStaticProps, NextPage } from 'next';
import React from 'react';
import withAuth from 'shared/components/hocs/withAuth';
import PageLoadingSpinner from 'shared/components/pages/PageLoadingSpinner';
import getServerSideTranslations from 'shared/i18n/get-server-side-translations';

const EmployerIndex: NextPage = () => {
  useLoadDraftOrCreateNewApplication();

  return <PageLoadingSpinner />;
};

export const getStaticProps: GetStaticProps =
  getServerSideTranslations('common');

export default withAuth(EmployerIndex);
