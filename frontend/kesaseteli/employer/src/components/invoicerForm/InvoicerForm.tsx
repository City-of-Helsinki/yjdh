import { Notification } from 'hds-react';
import ApplicationForm from 'kesaseteli/employer/components/form/ApplicationForm';
import useApplicationApi from 'kesaseteli/employer/hooks/useApplicationApi';
import { useTranslation } from 'next-i18next';
import React from 'react';
import Application from 'shared/types/employer-application';

import { $SubmitButton, $TextInput } from './InvoicerForm.sc';

type Props = {
  applicationId: string;
};
const InvoicerForm: React.FC<Props> = ({ applicationId }) => {
  const { t } = useTranslation();

  const {
    application,
    updateApplication,
    isLoading,
    isUpdating,
    loadingError,
    updatingError,
  } = useApplicationApi(applicationId);

  const isSyncing = isLoading || isUpdating;
  const errorMessage = (loadingError || updatingError)?.message;
  const onSubmit = (draftApplication: Application): void =>
    updateApplication(draftApplication);

  if (errorMessage)
    return (
      <Notification
        label={`${t(
          `common:application.step1.form.common_error`
        )} ${errorMessage}`}
        type="error"
      />
    );
  return (
    <ApplicationForm title={t(
          `common:application.step1.form.title`
    )} application={application} isLoading={isSyncing}>
      <$TextInput
        id="invoicer_name"
        validation={{ required: true, maxLength: 256 }}
      />
      <$TextInput
        id="invoicer_email"
        validation={{
          required: true,
          maxLength: 254,
          // eslint-disable-next-line security/detect-unsafe-regex
          pattern: /^(([^\s"(),.:;<>@[\\\]]+(\.[^\s"(),.:;<>@[\\\]]+)*)|(".+"))@((\[(?:\d{1,3}\.){3}\d{1,3}])|(([\dA-Za-z-]+\.)+[A-Za-z]{2,}))$/,
        }}
      />
      <$TextInput
        id="invoicer_phone_number"
        validation={{ required: true, maxLength: 64 }}
      />
      <$SubmitButton
        id="next"
        onSubmit={onSubmit}
        loadingText={t(`common:application.step1.form.loading`)}
      >
        {t(`common:application.step1.form.submit_button`)}
      </$SubmitButton>
    </ApplicationForm>
  );
};
export default InvoicerForm;
