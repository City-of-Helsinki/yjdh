import useLoadDraftOrCreateNewApplication from 'kesaseteli/employer/hooks/application/useLoadDraftOrCreateNewApplication';
import useApplicationsQuery from 'kesaseteli/employer/hooks/backend/useApplicationsQuery';
import useCreateApplicationQuery from 'kesaseteli/employer/hooks/backend/useCreateApplicationQuery';
import useLogoutQuery from 'kesaseteli/employer/hooks/backend/useLogoutQuery';
import { GetStaticProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import React from 'react';
import withAuth from 'shared/components/hocs/withAuth';
import ErrorPage from 'shared/components/pages/ErrorPage';
import PageLoadingSpinner from 'shared/components/pages/PageLoadingSpinner';
import useIsSyncingToBackend from 'shared/hooks/useIsSyncingToBackend';
import getServerSideTranslations from 'shared/i18n/get-server-side-translations';
import Application from 'shared/types/application';

const EmployerIndex: NextPage = () => {
  const { isMutating } = useIsSyncingToBackend();
  const { mutate: logout } = useLogoutQuery();

  const applicationsQuery = useApplicationsQuery<Application | undefined>(
    !isMutating,
    (applications) => applications.find((app) => app.status === 'draft')
  );
  const createApplicationQuery = useCreateApplicationQuery();

  useLoadDraftOrCreateNewApplication(applicationsQuery, createApplicationQuery);

  const router = useRouter();
  const refreshPage = (): void => {
    router.reload();
  };

  const { t } = useTranslation();
  if (applicationsQuery.isError || createApplicationQuery.isError) {
    return (
      <ErrorPage
        title={t('common:errorPage.title')}
        message={t('common:errorPage.message')}
        logout={logout as () => void}
        retry={refreshPage}
      />
    );
  }
  return <PageLoadingSpinner />;
};

export const getStaticProps: GetStaticProps =
  getServerSideTranslations('common');

export default withAuth(EmployerIndex);
