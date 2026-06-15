import Dashboard from 'kesaseteli/employer/components/dashboard/Dashboard';
import withEmployerAuth from 'kesaseteli/employer/hocs/withEmployerAuth';
import useApplicationsQuery from 'kesaseteli/employer/hooks/backend/useApplicationsQuery';
import useCompanyQuery from 'kesaseteli/employer/hooks/backend/useCompanyQuery';
import useLogout from 'kesaseteli/employer/hooks/backend/useLogout';
import { GetStaticProps, NextPage } from 'next';
import React from 'react';
import PageLoadingSpinner from 'shared/components/pages/PageLoadingSpinner';
import ServerErrorPage from 'shared/components/pages/ServerErrorPage';
import getServerSideTranslations from 'shared/i18n/get-server-side-translations';

const EmployerIndex: NextPage = () => {
  const logout = useLogout();
  const {
    data: allApplications,
    isLoading: isAppsLoading,
    error: appsError,
  } = useApplicationsQuery({
    onlyMine: false,
  });

  const { data: company } = useCompanyQuery();

  if (appsError) {
    return <ServerErrorPage logout={logout} />;
  }

  if (isAppsLoading || !allApplications) {
    return <PageLoadingSpinner />;
  }

  // TODO: For user's own draft, we could fetch only that 1 draft application that he can have? Think whether it's more optimized than fetching all, since there aren't plenty anyway.
  const draftApplication = allApplications.find(
    (app) => app.status === 'draft' && app.is_mine
  );

  const organisationName: string | undefined = company?.name;

  return (
    <Dashboard
      draftApplicationId={draftApplication?.id}
      organisationName={organisationName}
    />
  );
};

export const getStaticProps: GetStaticProps =
  getServerSideTranslations('common');

export default withEmployerAuth(EmployerIndex);
