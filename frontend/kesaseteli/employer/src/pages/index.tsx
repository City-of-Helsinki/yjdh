import useLoadDraftOrCreateNewApplication from 'kesaseteli/employer/hooks/application/useLoadDraftOrCreateNewApplication';
import useApplicationsQuery from 'kesaseteli/employer/hooks/backend/useApplicationsQuery';
import useCreateApplicationQuery from 'kesaseteli/employer/hooks/backend/useCreateApplicationQuery';
import { GetStaticProps, NextPage } from 'next';
import React from 'react';
import withAuth from 'shared/components/hocs/withAuth';
import PageLoadingSpinner from 'shared/components/pages/PageLoadingSpinner';
import useIsSyncingToBackend from 'shared/hooks/useIsSyncingToBackend';
import getServerSideTranslations from 'shared/i18n/get-server-side-translations';
import Application from 'shared/types/application';

const EmployerIndex: NextPage = () => {
  const { isMutating } = useIsSyncingToBackend();

  const applicationsQuery = useApplicationsQuery<Application | undefined>(
    !isMutating,
    (applications) => applications.find((app) => app.status === 'draft')
  );
  const createApplicationQuery = useCreateApplicationQuery();

  useLoadDraftOrCreateNewApplication(applicationsQuery, createApplicationQuery);

  return <PageLoadingSpinner />;
};

export const getStaticProps: GetStaticProps =
  getServerSideTranslations('common');

export default withAuth(EmployerIndex);
