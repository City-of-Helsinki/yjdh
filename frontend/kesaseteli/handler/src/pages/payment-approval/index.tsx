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

  useEffect(() => {
    if (!isLoading && !isApprover) {
      void router.replace(ROUTES.FORBIDDEN);
    }
  }, [isApprover, isLoading, router]);

  if (isLoading || !isApprover) {
    return null; // Return nothing while redirecting or loading
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
