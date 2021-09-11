import useGetEmployeeDisplayName from 'kesaseteli/employer/hooks/application/useGetEmployeeDisplayName';
import { useTranslation } from 'next-i18next';
import React from 'react';
import Employment from 'shared/types/employment';

type Props = {
  index: number;
  employmentErrorFields: Array<keyof Employment>;
};

const EmployeeErrorNotification: React.FC<Props> = ({
  index,
  employmentErrorFields,
}: Props) => {
  const { t } = useTranslation();
  const employeeDisplayname = useGetEmployeeDisplayName(index);
  return (
    <React.Fragment key={index}>
      <h4>{employeeDisplayname}</h4>
      <ul>
        {employmentErrorFields.map((field) => (
          <li key={field}>{t(`common:application.form.errors.${field}`)}</li>
        ))}
      </ul>
    </React.Fragment>
  );
};

export default EmployeeErrorNotification;
