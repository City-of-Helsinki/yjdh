import EmployerApplicationHandlerView from 'kesaseteli/handler/components/employer-application/EmployerApplicationHandlerView';
import useEmployerApplicationQuery from 'kesaseteli/handler/hooks/backend/useEmployerApplicationQuery';
import type HandlerEmployerApplication from 'kesaseteli/handler/types/HandlerEmployerApplication';
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

function EmployerApplicationDetail(): React.ReactElement {
  const { t } = useTranslation();
  const { value: applicationId, isRouterLoading } = useRouterQueryParam('id');

  const { isError, isLoading, isSuccess, data } =
    useEmployerApplicationQuery<HandlerEmployerApplication>(applicationId);
  const notFound = isError || (!applicationId && !isRouterLoading);

  if (isRouterLoading || isLoading) {
    return <PageLoadingSpinner />;
  }

  return (
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
  );
}

/**
 * Using getStaticProps & getStaticPaths (SSG) for pages behind authentication is safe here
 * because the pre-rendered static HTML is just an empty UI shell containing translations.
 * Sensitive data is never pre-rendered or cached on the server; it is fetched dynamically
 * on the client-side inside the component (useEmployerApplicationQuery) after checking
 * the user's session cookies in the browser.
 */
export const getStaticProps: GetStaticProps =
  getServerSideTranslations('common');

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: [],
  fallback: 'blocking',
});

export default EmployerApplicationDetail;
