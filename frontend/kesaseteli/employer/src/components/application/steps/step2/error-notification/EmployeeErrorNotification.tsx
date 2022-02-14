import ErrorNotificationRow from 'kesaseteli/employer/components/application/form/error-summary/ErrorNotificationRow';
import useWatchEmployeeDisplayName from 'kesaseteli/employer/hooks/employments/useWatchEmployeeDisplayName';
import { getEmploymentFieldPath } from 'kesaseteli/employer/utils/application-form.utils';
import React from 'react';
import { $GridCell } from 'shared/components/forms/section/FormSection.sc';
import Employment from 'shared/types/employment';

type Props = {
  index: number;
  errorFields: Array<keyof Employment>;
};

const EmployeeErrorNotification: React.FC<Props> = ({
  index,
  errorFields,
}: Props) => {
  const employeeDisplayname = useWatchEmployeeDisplayName(index);
  return (
    <$GridCell key={index}>
      <h4>{employeeDisplayname}</h4>
      <ul>
        {errorFields.map((field) => {
          const fieldPath = getEmploymentFieldPath(index, field);
          return <ErrorNotificationRow key={fieldPath} fieldPath={fieldPath} />;
        })}
      </ul>
    </$GridCell>
  );
};

export default EmployeeErrorNotification;
