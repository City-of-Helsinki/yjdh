import ErrorNotificationRow from 'kesaseteli/employer/components/application/form/error-summary/ErrorNotificationRow';
import useWatchEmployeeDisplayName from 'kesaseteli/employer/hooks/employments/useWatchEmployeeDisplayName';
import React from 'react';
import { FieldError } from 'react-hook-form';
import { $GridCell } from 'shared/components/forms/section/FormSection.sc';
import Employment from 'shared/types/employment';
import { getEmploymentFieldPath } from 'shared/utils/application.utils';

type Props = {
  index: number;
  errors: Array<{
    field: keyof Employment;
    error: FieldError;
  }>;
};

const EmployeeErrorNotification: React.FC<Props> = ({
  index,
  errors,
}: Props) => {
  const employeeDisplayname = useWatchEmployeeDisplayName(index);
  return (
    <$GridCell key={index}>
      <h4>{employeeDisplayname}</h4>
      <ul>
        {errors.map(({ field, error }) => {
          const fieldPath = getEmploymentFieldPath(index, field);
          return (
            <ErrorNotificationRow
              key={fieldPath}
              fieldPath={fieldPath}
              error={error}
            />
          );
        })}
      </ul>
    </$GridCell>
  );
};

export default EmployeeErrorNotification;
