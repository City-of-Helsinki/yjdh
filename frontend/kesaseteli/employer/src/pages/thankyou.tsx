import { Button, IconCheckCircleFill } from 'hds-react';
import useApplicationApi from 'kesaseteli/employer/hooks/application/useApplicationApi';
import useCreateApplicationQuery from 'kesaseteli/employer/hooks/backend/useCreateApplicationQuery';
import ApplicationPersistenceService from 'kesaseteli/employer/services/ApplicationPersistenceService';
import { extractEmployerFields } from 'kesaseteli/employer/utils/application.utils';
import { GetStaticProps, NextPage } from 'next';
import Head from 'next/head';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { useQueryClient } from 'react-query';
import Container from 'shared/components/container/Container';
import withAuth from 'shared/components/hocs/withAuth';
import { $Header, $Heading } from 'shared/components/layout/Layout.sc';
import { $Notification } from 'shared/components/notification/Notification.sc';
import PageLoadingSpinner from 'shared/components/pages/PageLoadingSpinner';
import useGoToPage from 'shared/hooks/useGoToPage';
import getServerSideTranslations from 'shared/i18n/get-server-side-translations';
import styled from 'styled-components';

const SuccessContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${(props) => props.theme.spacing.xl};
  text-align: center;
  gap: ${(props) => props.theme.spacing.m};
`;

const SuccessIcon = styled(IconCheckCircleFill)`
  color: ${(props) => props.theme.colors.success};
  width: 64px;
  height: 64px;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: ${(props) => props.theme.spacing.m};
  margin-top: ${(props) => props.theme.spacing.l};
`;

const ThankYouPage: NextPage = () => {
  const { t } = useTranslation();
  const { applicationQuery, isRouterLoading, applicationId } =
    useApplicationApi();
  const queryClient = useQueryClient();
  const goToPage = useGoToPage();
  const createApplicationQuery = useCreateApplicationQuery();

  const createNewApplicationClick = React.useCallback((): void => {
    if (applicationQuery.isSuccess && applicationQuery.data) {
      const employerData = extractEmployerFields(applicationQuery.data);
      ApplicationPersistenceService.storeEmployerData(employerData);
    }
    createApplicationQuery.mutate(undefined, {
      onSuccess: (data) => {
        queryClient.clear();
        goToPage(`/application?id=${data.id}`);
      },
    });
  }, [
    createApplicationQuery,
    queryClient,
    goToPage,
    applicationQuery.isSuccess,
    applicationQuery.data,
  ]);

  const returnToDashboard = (): void => {
    goToPage('/');
  };

  if (!isRouterLoading && !applicationId) {
    goToPage('/');
    return null;
  }

  if (applicationQuery.isSuccess) {
    const application = applicationQuery.data;
    const vouchers = applicationQuery.data?.summer_vouchers || [];
    const lastVoucher = vouchers[vouchers.length - 1];
    const employeeName = lastVoucher?.employee_name || '';
    if (applicationId && application.status === 'draft') {
      goToPage(`/application?id=${applicationId}`, 'replace');
    }
    return (
      <Container>
        <Head>
          <title>
            {`${t('common:thankyouPage.thankyouMessageLabel')} | ${t(
              'common:appName'
            )}`}
          </title>
        </Head>
        <$Notification
          label={t(`common:thankyouPage.thankyouMessageLabel`)}
          type="success"
          size="large"
        >
          {t(`common:thankyouPage.thankyouMessageContent`)}
        </$Notification>
        <SuccessContainer>
          <SuccessIcon />
          <$Header>
            <$Heading>{t('common:thankyouPage.header')}</$Heading>
          </$Header>
          <p>
            {t('common:thankyouPage.success_message', {
              name: employeeName,
            })}
          </p>
          <ButtonContainer>
            <Button
              onClick={createNewApplicationClick}
              variant="secondary"
              isLoading={createApplicationQuery.isLoading}
            >
              {t('common:thankyouPage.add_another')}
            </Button>
            <Button onClick={returnToDashboard} variant="primary">
              {t('common:thankyouPage.return_to_dashboard')}
            </Button>
          </ButtonContainer>
        </SuccessContainer>
      </Container>
    );
  }
  return <PageLoadingSpinner />;
};

export const getStaticProps: GetStaticProps =
  getServerSideTranslations('common');

export default withAuth(ThankYouPage);
