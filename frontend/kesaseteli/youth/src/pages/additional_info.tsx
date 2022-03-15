import AdditionalInfoForm from 'kesaseteli/youth/components/forms/AdditionalInfoForm';
import useYouthApplicationStatusQuery from 'kesaseteli/youth/hooks/backend/useYouthApplicationStatusQuery';
import { GetStaticProps, NextPage } from 'next';
import Head from 'next/head';
import { useTranslation } from 'next-i18next';
import React from 'react';
import Container from 'shared/components/container/Container';
import { $Notification } from 'shared/components/notification/Notification.sc';
import PageLoadingSpinner from 'shared/components/pages/PageLoadingSpinner';
import useRouterQueryParam from 'shared/hooks/useRouterQueryParam';
import getServerSideTranslations from 'shared/i18n/get-server-side-translations';

const AdditionalInfo: NextPage = () => {
  const { t } = useTranslation();
  const { value: applicationId, isRouterLoading } = useRouterQueryParam('id');
  const applicationStatusQuery = useYouthApplicationStatusQuery(applicationId);

  if (isRouterLoading || applicationStatusQuery.isLoading) {
    return <PageLoadingSpinner />;
  }

  const applicationNotFound = applicationStatusQuery.isError || !applicationId;

  return (
    <Container>
      <Head>
        <title>{`${t(`common:appName`)} - ${t(
          'common:additionalInfo.title'
        )}`}</title>
      </Head>
      {applicationStatusQuery.isSuccess &&
        (() => {
          switch (applicationStatusQuery.data.status) {
            case 'additional_information_requested':
              return <AdditionalInfoForm />;

            case 'additional_information_provided':
            case 'accepted':
            case 'rejected':
              return (
                <$Notification
                  label={t('common:additionalInfo.notification.sent')}
                  type="alert"
                />
              );

            default:
              return (
                <$Notification
                  label={t('common:additionalInfo.notification.notFound')}
                  type="alert"
                />
              );
          }
        })()}
      {applicationNotFound && (
        <$Notification
          label={t('common:additionalInfo.notification.notFound')}
          type="alert"
        />
      )}
    </Container>
  );
};

export const getStaticProps: GetStaticProps =
  getServerSideTranslations('common');

export default AdditionalInfo;
