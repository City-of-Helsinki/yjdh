import ErrorNotificationRow from 'kesaseteli/employer/components/application/form/error-summary/ErrorNotificationRow';
import ApplicationFieldPath from 'kesaseteli/employer/types/application-field-path';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { FieldError, useFormContext } from 'react-hook-form';
import usePreviousValue from 'shared/hooks/usePreviousValue';
import Application from 'shared/types/application-form-data';

import { $ErrorSummary } from './EmployerErrorSummary.sc';

const EmployerErrorSummary: React.FC = () => {
  const { t } = useTranslation();
  const { formState } = useFormContext<Application>();

  // focus to error summary only after clicking submit button, but not when user is inputting an invalid field value
  const isJustSubmitted =
    usePreviousValue(formState.isSubmitting) && formState.isSubmitted;

  if (!formState.errors || formState.isValid || !formState.isSubmitted) {
    return null;
  }

  return (
    <$ErrorSummary
      label={t(`common:application.form.notification.title`)}
      autofocus={isJustSubmitted}
    >
      <ul>
        {Object.entries(formState.errors).map(([key, error]) => (
          <ErrorNotificationRow
            key={key}
            data-testid={key}
            fieldPath={key as ApplicationFieldPath}
            error={error as FieldError}
          />
        ))}
      </ul>
    </$ErrorSummary>
  );
};

export default EmployerErrorSummary;
