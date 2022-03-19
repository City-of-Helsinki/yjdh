import AdditionalInfoForm from 'kesaseteli/youth/components/forms/AdditionalInfoForm';
import useYouthApplicationStatusQuery from 'kesaseteli/youth/hooks/backend/useYouthApplicationStatusQuery';
import AdditionalInfoFormData from 'kesaseteli-shared/types/additional-info-form-data';
import { GetStaticProps, NextPage } from 'next';
import Head from 'next/head';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import Container from 'shared/components/container/Container';
import { $Notification } from 'shared/components/notification/Notification.sc';
import PageLoadingSpinner from 'shared/components/pages/PageLoadingSpinner';
import useRouterQueryParam from 'shared/hooks/useRouterQueryParam';
import getServerSideTranslations from 'shared/i18n/get-server-side-translations';

const AdditionalInfo: NextPage = () => {
  const { t } = useTranslation();
  const { value: applicationId, isRouterLoading } = useRouterQueryParam('id');
  const applicationStatusQuery = useYouthApplicationStatusQuery(applicationId);

  const methods = useForm<AdditionalInfoFormData>({
    mode: 'onBlur',
    reValidateMode: 'onChange',
    criteriaMode: 'all',
  });

  const isLoading = isRouterLoading || applicationStatusQuery.isLoading;
  const isSuccess = applicationId && applicationStatusQuery.isSuccess;
  const notFound = applicationStatusQuery.isError || !applicationId;

  if (isLoading) {
    return <PageLoadingSpinner />;
  }

  return (
    <Container>
      <Head>
        <title>{`${t(`common:appName`)} - ${t(
          'common:additionalInfo.title'
        )}`}</title>
      </Head>
      <FormProvider {...methods}>
        {isSuccess &&
          (() => {
            switch (applicationStatusQuery.data.status) {
              case 'additional_information_requested':
                return <AdditionalInfoForm applicationId={applicationId} />;

              case 'additional_information_provided':
              case 'accepted':
              case 'rejected':
                return (
                  <$Notification
                    label={t('common:additionalInfo.notification.sent')}
                    type="info"
                  />
                );

              case 'submitted':
              case 'awaiting_manual_processing':
              default:
                return (
                  <$Notification
                    label={t('common:additionalInfo.notification.notFound')}
                    type="alert"
                  />
                );
            }
          })()}
        {notFound && (
          <$Notification
            label={t('common:additionalInfo.notification.notFound')}
            type="alert"
          />
        )}
      </FormProvider>
    </Container>
  );
};

export const getStaticProps: GetStaticProps =
  getServerSideTranslations('common');

export default AdditionalInfo;
