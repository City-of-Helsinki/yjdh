import PaymentApprovalList from 'kesaseteli/handler/components/applicationList/PaymentApprovalList';
import useCurrentUserQuery from 'kesaseteli/handler/hooks/backend/useCurrentUserQuery';
import useUser from 'kesaseteli/handler/hooks/useUser';
import { ROUTES } from 'kesaseteli-shared/constants/routes';
import { GetStaticProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import React, { useEffect } from 'react';
import Container from 'shared/components/container/Container';
import FormSectionHeading from 'shared/components/forms/section/FormSectionHeading';
import ErrorPage from 'shared/components/pages/ErrorPage';
import getServerSideTranslations from 'shared/i18n/get-server-side-translations';
import styled from 'styled-components';

const $PageContainer = styled(Container)`
  position: relative;
  z-index: 0;

  & > div {
    min-width: 0;
  }
`;

function PaymentApprovalIndex(): React.ReactElement | null {
  const { t } = useTranslation();
  const router = useRouter();
  const { isAuthenticated, isApprover, isLoading: isUserLoading } = useUser();
  const currentUserQuery = useCurrentUserQuery({
    enabled: isAuthenticated,
  });

  const isRoleLookupPending = isAuthenticated && currentUserQuery.isLoading;
  const isLoading = isUserLoading || isRoleLookupPending;

  // Only redirect to 403 Forbidden if queries have completed, the user is confirmed
  // not to be an approver, and there was no network/backend error fetching the role.
  useEffect(() => {
    if (!isLoading && !isApprover && !currentUserQuery.isError) {
      void router.replace(ROUTES.FORBIDDEN);
    }
  }, [isApprover, isLoading, currentUserQuery.isError, router]);

  // Wait while authentication or role lookup is in progress
  if (isLoading) {
    return null;
  }

  // Handle unauthorized or failed lookup cases
  if (!isApprover) {
    // Show an error screen with retry if the role lookup failed (e.g. 500 or network error)
    // instead of falsely treating it as a permission denial.
    if (currentUserQuery.isError) {
      return (
        <$PageContainer>
          <Head>
            <title>
              {t('common:errorPage.title')} | {t('common:appName')}
            </title>
          </Head>
          <ErrorPage
            title={t('common:errorPage.title')}
            message={t('common:errorPage.message')}
            retry={() => void currentUserQuery.refetch()}
          />
        </$PageContainer>
      );
    }
    // Confirmed non-approver; render nothing while redirecting to ROUTES.FORBIDDEN
    return null;
  }

  return (
    <$PageContainer>
      <Head>
        <title>{t('common:appName')}</title>
      </Head>
      <FormSectionHeading
        size="l"
        header={t('common:header.approverApplicationsLabel')}
        as="h1"
      />
      <PaymentApprovalList />
    </$PageContainer>
  );
}

export const getStaticProps: GetStaticProps =
  getServerSideTranslations('common');

export default PaymentApprovalIndex;
