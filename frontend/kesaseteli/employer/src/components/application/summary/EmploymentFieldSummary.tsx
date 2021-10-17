import useApplicationApi from 'kesaseteli/employer/hooks/application/useApplicationApi';
import useGetApplicationFormFieldLabel from 'kesaseteli/employer/hooks/application/useGetApplicationFormFieldLabel';
import React from 'react';
import { $GridCell } from 'shared/components/forms/section/FormSection.sc';
import Application from 'shared/types/application';
import Employment from 'shared/types/employment';

type Props = {
  index: number;
  fieldName: string;
  children?: React.ReactNode;
  select?: (application: Application) => string;
};

const EmploymentFieldSummary: React.FC<Props> = ({
  index,
  fieldName,
  children,
  select,
}) => {
  const label = useGetApplicationFormFieldLabel(fieldName as keyof Employment);
  const { applicationQuery } = useApplicationApi<string>((application) => {
    if (select) {
      return select(application);
    }
    return (
      application.summer_vouchers[index][
        fieldName as keyof Employment
      ]?.toString() ?? '-'
    );
  });
  const value = applicationQuery.isSuccess ? applicationQuery.data : '-';
  return (
    <$GridCell as="pre" data-testid={`${fieldName}_${index}`}>
      {children ?? `${label}: ${value}`}
    </$GridCell>
  );
};
export default EmploymentFieldSummary;
