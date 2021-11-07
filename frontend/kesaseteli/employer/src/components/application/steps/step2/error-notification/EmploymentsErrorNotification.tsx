import { ErrorSummary } from 'hds-react';
import { getEmploymentFieldPath } from 'kesaseteli/employer/utils/application-form.utils';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { FieldError, useFormContext } from 'react-hook-form';
import { $Grid } from 'shared/components/forms/section/FormSection.sc';
import Application from 'shared/types/application-form-data';
import Employment from 'shared/types/employment';

import EmployeeErrorNotification from './EmployeeErrorNotification';

const EmploymentsErrorNotification: React.FC = () => {
  const { t } = useTranslation();
  const {
    getValues,
    formState: { isValid, errors, isSubmitted },
  } = useFormContext<Application>();

  const getEmploymentId = React.useCallback(
    (index: number) => getValues(getEmploymentFieldPath(index, 'id')) as string,
    [getValues]
  );

  const employmentErrorEntries = React.useMemo(
    () =>
      Array.isArray(errors.summer_vouchers)
        ? errors.summer_vouchers.map((employmentErrors, index) => ({
            index,
            errors: Object.entries(employmentErrors ?? {}).map(
              ([field, error]) => ({
                field: field as keyof Employment,
                error: error as FieldError,
              })
            ),
          }))
        : [],
    [errors.summer_vouchers]
  );

  if (isValid || !isSubmitted) {
    return null;
  }

  return (
    <ErrorSummary label={t(`common:application.form.notification.title`)} autofocus>
      <$Grid columns={2}>
        {employmentErrorEntries.map(({ index, errors: employmentErrors }) => (
          <EmployeeErrorNotification
            key={getEmploymentId(index)}
            index={index}
            errors={employmentErrors}
          />
        ))}
      </$Grid>
    </ErrorSummary>
  );
};

export default EmploymentsErrorNotification;
