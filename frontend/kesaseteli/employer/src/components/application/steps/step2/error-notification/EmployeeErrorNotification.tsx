import useGetEmployeeDisplayName from 'kesaseteli/employer/hooks/employments/useGetEmployeeDisplayName';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { FieldError } from 'react-hook-form'
import Employment from 'shared/types/employment';
import { $GridCell } from 'shared/components/forms/section/FormSection.sc';
type Props = {
  index: number;
  errors: Array<{
    field: keyof Employment,
    errorType: FieldError['type'],
  }>;
};

const EmployeeErrorNotification: React.FC<Props> = ({
  index,
  errors,
}: Props) => {
  const { t } = useTranslation();
  const employeeDisplayname = useGetEmployeeDisplayName(index);
  return (
    <$GridCell key={index}>
      <h4>{employeeDisplayname}</h4>
      <ul>
        {errors.map(({field, errorType}) => (
          <li key={field}>{`${t(`common:application.form.inputs.${field}`)}: ${t(`common:application.form.errors.${errorType}`)}`}</li>
        ))}
      </ul>
    </$GridCell>
  );
};

export default EmployeeErrorNotification;
