import { ErrorSummary } from 'hds-react';
import { getEmploymentFieldPath } from 'kesaseteli/employer/utils/application-form.utils';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { useFormContext } from 'react-hook-form';
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

  if (isValid || !isSubmitted || !errors.summer_vouchers) {
    return null;
  }

  return (
    <ErrorSummary
      label={t(`common:application.form.notification.title`)}
      autofocus
    >
      <$Grid columns={2}>
        {errors.summer_vouchers.map((employmentErrors, index) => (
          <EmployeeErrorNotification
            key={getEmploymentId(index)}
            index={index}
            errorFields={
              Object.keys(employmentErrors ?? {}) as Array<keyof Employment>
            }
          />
        ))}
      </$Grid>
    </ErrorSummary>
  );
};

export default EmploymentsErrorNotification;
