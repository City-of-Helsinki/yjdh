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
import getServerSideTranslations from 'shared/i18n/get-server-side-translations';

const EmployerIndex: NextPage = () => {
  const {
    data: applications,
    isLoading: isLoadingApplications,
    isError: loadApplicationsError,
  } = useApplicationsQuery();
  const {
    data: newApplication,
    mutate: createApplication,
    isError: createApplicationError,
    isLoading: isCreatingApplication,
  } = useCreateApplicationQuery();

  const { mutate: logout, isLoading: isLoadingLogout } = useLogoutQuery();

  const isLoading =
    isLoadingApplications || isCreatingApplication || isLoadingLogout;
  const isError = loadApplicationsError || createApplicationError;

  useLoadDraftOrCreateNewApplication(
    isLoading,
    isError,
    applications,
    newApplication,
    createApplication
  );

  const router = useRouter();
  const refreshPage = (): void => {
    router.reload();
  };

  const { t } = useTranslation();
  if (isLoading) {
    return <PageLoadingSpinner />;
  }
  if (isError && !isLoading) {
    return (
      <ErrorPage
        title={t('common:errorPage.title')}
        message={t('common:errorPage.message')}
        logout={logout as () => void}
        retry={refreshPage}
      />
    );
  }

  return <></>;
};

export const getStaticProps: GetStaticProps = getServerSideTranslations(
  'common'
);

export default withAuth(EmployerIndex);
