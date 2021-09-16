import { $Notification,$NotificationDescription } from 'kesaseteli/employer/components/application/steps/step2/error-notification/EmploymentsErrorNotification.sc';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { FieldError, useFormContext } from 'react-hook-form';
import Application from 'shared/types/employer-application';
import Employment from 'shared/types/employment';
import { $Grid } from 'shared/components/forms/section/FormSection.sc';
import EmployeeErrorNotification from './EmployeeErrorNotification';

const EmploymentsErrorNotification: React.FC = () => {
  const { t } = useTranslation();
  const {
    getValues,
    formState: { isValid, errors, isSubmitted },
  } = useFormContext<Application>();
  if (!errors || isValid || !isSubmitted) {
    return null;
  }
  const getEmploymentId = (index: number): Employment['id'] =>
    getValues(`summer_vouchers.${index}.id`);

  const employmentsErrors = errors.summer_vouchers || [];
  const employmentErrorEntries = Array.isArray(employmentsErrors)
    ? employmentsErrors.map((employmentErrors, index) => ({
        index,
        errors: Object.entries(employmentErrors ?? {}).map(([field, error]) => ({
          field: field as keyof Employment,
          errorType: error?.type || 'required',
        }) ),
      }))
    : [];

  const isEmptyList =
    (errors.summer_vouchers as FieldError | undefined)?.type === 'minLength';
  const title = isEmptyList
    ? t(`common:application.form.errors.employmentsRequired`)
    : t(`common:application.form.notification.title`);

  return (
    <$Notification type="error" label={title}>
      {!isEmptyList && (
        <$Grid columns={2}>
          <$NotificationDescription $colSpan={2}>
            {t(`common:application.form.notification.description`)}
          </$NotificationDescription>
          {employmentErrorEntries.map(({ index, errors: employmentErrors }) => (
            <EmployeeErrorNotification
              key={getEmploymentId(index)}
              index={index}
              errors={employmentErrors}
            />
          ))}
        </$Grid>
      )}
    </$Notification>
  );
};

export default EmploymentsErrorNotification;
