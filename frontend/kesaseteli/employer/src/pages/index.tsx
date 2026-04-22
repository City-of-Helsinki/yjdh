import Dashboard from 'kesaseteli/employer/components/dashboard/Dashboard';
import useApplicationsQuery from 'kesaseteli/employer/hooks/backend/useApplicationsQuery';
import useCompanyQuery from 'kesaseteli/employer/hooks/backend/useCompanyQuery';
import withEmployerAuth from 'kesaseteli/employer/hocs/withEmployerAuth';
import { DashboardVoucher } from 'kesaseteli/employer/types/types';
import { GetStaticProps, NextPage } from 'next';
import React from 'react';
import PageLoadingSpinner from 'shared/components/pages/PageLoadingSpinner';
import getServerSideTranslations from 'shared/i18n/get-server-side-translations';

const EmployerIndex: NextPage = () => {
  const [showOnlyMine, setShowOnlyMine] = React.useState(false);

  const {
    data: applications,
    isLoading,
    error,
  } = useApplicationsQuery(showOnlyMine);

  const { data: company } = useCompanyQuery();

  if (isLoading || error || !applications) {
    return <PageLoadingSpinner />;
  }

  const vouchers: DashboardVoucher[] = applications.flatMap((app) =>
    (app.summer_vouchers || []).map((voucher) => ({
      ...voucher,
      applicationId: app.id,
      applicationStatus: app.status,
      modified_at:
        (app as typeof app & { modified_at?: string }).modified_at ||
        app.submitted_at ||
        '',
    }))
  );

  const draftApplication = applications.find(
    (app) => app.status === 'draft' && app.is_mine
  );

  const organisationName: string | undefined = company?.name;

  const onToggleOnlyMine = (): void => {
    setShowOnlyMine((prev) => !prev);
  };

  return (
    <Dashboard
      vouchers={vouchers}
      draftApplicationId={draftApplication?.id}
      showOnlyMine={showOnlyMine}
      onToggleOnlyMine={onToggleOnlyMine}
      organisationName={organisationName}
    />
  );
};

export const getStaticProps: GetStaticProps =
  getServerSideTranslations('common');

export default withEmployerAuth(EmployerIndex);
