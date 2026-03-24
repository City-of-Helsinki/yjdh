'use client';

import AdditionalInfoForm from 'kesaseteli/youth/components/additional-info-form/AdditionalInfoForm';
import useYouthApplicationStatusQuery from 'kesaseteli/youth/hooks/backend/useYouthApplicationStatusQuery';
import AdditionalInfoFormData from 'kesaseteli-shared/types/additional-info-form-data';
import useRouterQueryParam from 'kesaseteli-shared/hooks/useRouterQueryParam';
import { NextPage } from 'next';
import React, { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import Container from 'shared/components/container/Container';
import { $Notification } from 'shared/components/notification/Notification.sc';
import PageLoadingSpinner from 'shared/components/pages/PageLoadingSpinner';

const AdditionalInfo: NextPage = () => {
  const { t } = useTranslation();
  const { value: applicationId, isRouterLoading } = useRouterQueryParam('id');
  const applicationStatusQuery = useYouthApplicationStatusQuery(applicationId);

  const methods = useForm<AdditionalInfoFormData>({
    mode: 'onBlur',
    reValidateMode: 'onChange',
    criteriaMode: 'all',
  });

  const {isLoading} = applicationStatusQuery;
  const isSuccess = applicationId && applicationStatusQuery.isSuccess;
  const notFound = applicationStatusQuery.isError || !applicationId;

  // Simulate setting title in client
  useEffect(() => {
    document.title = `${t('common:appName')} - ${t('common:additionalInfo.title')}`;
  }, [t]);

  if (isLoading) {
    return <PageLoadingSpinner />;
  }

  return (
    <Container data-testid="additional-info">
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

export default AdditionalInfo;
