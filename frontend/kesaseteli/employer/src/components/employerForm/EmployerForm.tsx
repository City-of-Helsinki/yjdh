import { Notification } from 'hds-react';
import ApplicationForm from 'kesaseteli/employer/components/form/ApplicationForm';
import useApplicationApi from 'kesaseteli/employer/hooks/useApplicationApi';
import Application from 'kesaseteli/employer/types/application';
import { useTranslation } from 'next-i18next';
import React from 'react';

import { $SubmitButton, $TextInput } from './EmployerForm.sc';

type Props = {
  applicationId: string;
};
const EmployerForm: React.FC<Props> = ({ applicationId }) => {
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
    <ApplicationForm application={application} isLoading={isSyncing}>
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
export default EmployerForm;
