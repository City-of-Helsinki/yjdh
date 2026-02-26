import Dashboard from 'kesaseteli/employer/components/dashboard/Dashboard';
import useApplicationsQuery from 'kesaseteli/employer/hooks/backend/useApplicationsQuery';
import { DashboardVoucher } from 'kesaseteli/employer/types/types';
import { GetStaticProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import React from 'react';
import withAuth from 'shared/components/hocs/withAuth';
import PageLoadingSpinner from 'shared/components/pages/PageLoadingSpinner';
import useLocale from 'shared/hooks/useLocale';
import getServerSideTranslations from 'shared/i18n/get-server-side-translations';

const EmployerIndex: NextPage = () => {
  const { data: applications, isLoading, error } = useApplicationsQuery();
  const router = useRouter();
  const locale = useLocale();

  React.useEffect(() => {
    if (error) {
      void router.push(`${locale}/500`, undefined, { shallow: false });
    }
  }, [error, router, locale]);

  if (isLoading || error || !applications) {
    return <PageLoadingSpinner />;
  }

  const vouchers: DashboardVoucher[] = applications.flatMap((app) =>
    (app.summer_vouchers || []).map((voucher) => ({
      ...voucher,
      applicationId: app.id,
      applicationStatus: app.status,
      modified_at: (app as typeof app & { modified_at?: string }).modified_at || app.submitted_at || '',
    }))
  );

  const draftApplicationId = applications.find((app) => app.status === 'draft')?.id;

  return <Dashboard vouchers={vouchers} draftApplicationId={draftApplicationId} />;
};

export const getStaticProps: GetStaticProps =
  getServerSideTranslations('common');

export default withAuth(EmployerIndex);
