import { Notification } from 'hds-react';
import { $NotificationDescription } from 'kesaseteli/employer/components/application/steps/step2/error-notification/EmploymentsErrorNotification.sc';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { FieldError, useFormContext } from 'react-hook-form';
import Application from 'shared/types/employer-application';
import Employment from 'shared/types/employment';

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
        fields: Object.keys(employmentErrors ?? {}),
      }))
    : [];
  const isEmptyList =
    (errors.summer_vouchers as FieldError | undefined)?.type === 'minLength';
  const title = isEmptyList
    ? t(`common:application.form.errors.summer_vouchers`)
    : t(`common:application.form.errors.title`);
  return (
    <Notification type="error" label={title}>
      {!isEmptyList && employmentErrorEntries?.length < 3 && (
        <>
          <$NotificationDescription>
            {t(`common:application.form.errors.description`)}
          </$NotificationDescription>
          {employmentErrorEntries.map(({ index, fields }) => (
            <EmployeeErrorNotification
              index={index}
              key={getEmploymentId(index)}
              employmentErrorFields={fields as Array<keyof Employment>}
            />
          ))}
        </>
      )}
    </Notification>
  );
};

export default EmploymentsErrorNotification;
