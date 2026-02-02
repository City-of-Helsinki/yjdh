import { Button, IconCheckCircleFill } from 'hds-react';
import useApplicationApi from 'kesaseteli/employer/hooks/application/useApplicationApi';
import { GetStaticProps, NextPage } from 'next';
import Head from 'next/head';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { useQueryClient } from 'react-query';
import Container from 'shared/components/container/Container';
import withAuth from 'shared/components/hocs/withAuth';
import { $Notification } from 'shared/components/notification/Notification.sc';
import PageLoadingSpinner from 'shared/components/pages/PageLoadingSpinner';
import useGoToPage from 'shared/hooks/useGoToPage';
import getServerSideTranslations from 'shared/i18n/get-server-side-translations';
import styled from 'styled-components';

import useLogout from '../hooks/backend/useLogout';

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
  const logout = useLogout();



  const createNewApplicationClick = React.useCallback((): void => {
    queryClient.clear();
    goToPage('/');
  }, [queryClient, goToPage]);

  const handleSignOut = (): void => {
    void logout();
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
            {t(`common:thankyouPage.thankyouMessageLabel`)} |{' '}
            {t(`common:appName`)}
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
          <h1>{t('common:thankyouPage.header')}</h1>
          <p>
            {t('common:thankyouPage.success_message', {
              name: employeeName,
            })}
          </p>
          <ButtonContainer>
            <Button onClick={createNewApplicationClick} variant="secondary">
              {t('common:thankyouPage.add_another')}
            </Button>
            <Button onClick={handleSignOut} variant="primary">
              {t('common:thankyouPage.sign_out')}
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
