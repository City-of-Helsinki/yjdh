import Dashboard from 'kesaseteli/employer/components/dashboard/Dashboard';
import useApplicationsQuery from 'kesaseteli/employer/hooks/backend/useApplicationsQuery';
import useCompanyQuery from 'kesaseteli/employer/hooks/backend/useCompanyQuery';
import useLogout from 'kesaseteli/employer/hooks/backend/useLogout';
import { DashboardVoucher } from 'kesaseteli/employer/types/types';
import { GetStaticProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import React from 'react';
import withAuth from 'shared/components/hocs/withAuth';
import PageLoadingSpinner from 'shared/components/pages/PageLoadingSpinner';
import useLocale from 'shared/hooks/useLocale';
import getServerSideTranslations from 'shared/i18n/get-server-side-translations';
import { isError } from 'shared/utils/type-guards';

const EmployerIndex: NextPage = () => {
  const [showOnlyMine, setShowOnlyMine] = React.useState(false);
  const router = useRouter();
  const locale = useLocale();
  const logout = useLogout();

  const {
    data: applications,
    isLoading,
    error,
  } = useApplicationsQuery(showOnlyMine, undefined, () => {});

  const {
    data: company,
    isSuccess: isCompanySuccess,
    error: companyError,
  } = useCompanyQuery();

  React.useEffect(() => {
    const isForbidden = (err: unknown): boolean =>
      isError(err) &&
      (err.message.includes('403') || err.message.includes('Forbidden'));

    // If user is logged in but company data has no name, they are not authorized to act on behalf of any organization.
    if (isCompanySuccess && !company?.name) {
      void logout(`/${locale}/no-organisation`);
    } else if (isForbidden(error) || isForbidden(companyError)) {
      void logout(`/${locale}/no-organisation`);
    } else if (error || companyError) {
      void router.push(`/${locale}/500`, undefined, { shallow: false });
    }
  }, [company, isCompanySuccess, error, companyError, logout, locale, router]);

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

export default withAuth(EmployerIndex);
