import EmployerApplicationHandlerView from 'kesaseteli/employer/components/employer-application/EmployerApplicationHandlerView';
import withEmployerAuth from 'kesaseteli/employer/hocs/withEmployerAuth';
import useApplicationQuery from 'kesaseteli/employer/hooks/backend/useApplicationQuery';
import type HandlerEmployerApplication from 'kesaseteli/employer/types/HandlerEmployerApplication';
import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import { useTranslation } from 'next-i18next';
import React from 'react';
import Container from 'shared/components/container/Container';
import FormSectionHeading from 'shared/components/forms/section/FormSectionHeading';
import { $Notification } from 'shared/components/notification/Notification.sc';
import PageLoadingSpinner from 'shared/components/pages/PageLoadingSpinner';
import useRouterQueryParam from 'shared/hooks/useRouterQueryParam';
import getServerSideTranslations from 'shared/i18n/get-server-side-translations';
import styled from 'styled-components';

const $DetailPageWrapper = styled.div`
  // Prevent wide tables or overflow contents from blowing out the grid width
  & > div > div {
    min-width: 0;
  }
`;

const EmployerApplicationDetail: React.FC = () => {
  const { t } = useTranslation();
  const { value: applicationId, isRouterLoading } = useRouterQueryParam('id');

  const { isError, isLoading, isSuccess, data } =
    useApplicationQuery<HandlerEmployerApplication>(applicationId);
  const notFound = isError || (!applicationId && !isRouterLoading);

  if (isRouterLoading || isLoading) {
    return <PageLoadingSpinner />;
  }

  return (
    <$DetailPageWrapper>
      <Container>
        <Head>
          <title>{t(`common:appName`)}</title>
        </Head>

        <FormSectionHeading
          $colSpan={2}
          header={t('common:handlerApplication.title')}
          as="h2"
        />
        {isSuccess && data && (
          <EmployerApplicationHandlerView application={data} />
        )}
        {notFound && (
          <$Notification
            label={t('common:handlerApplication.notFound')}
            type="alert"
          />
        )}
      </Container>
    </$DetailPageWrapper>
  );
};

export const getStaticProps: GetStaticProps =
  getServerSideTranslations('common');

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: [],
  fallback: 'blocking',
});

export default withEmployerAuth(EmployerApplicationDetail);
