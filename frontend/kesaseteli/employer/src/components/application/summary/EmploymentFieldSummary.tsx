import { $EmploymentFieldSummary } from 'kesaseteli/employer/components/application/summary/EmploymentFieldSummary.sc';
import useApplicationApi from 'kesaseteli/employer/hooks/application/useApplicationApi';
import useGetApplicationFormFieldLabel from 'kesaseteli/employer/hooks/application/useGetApplicationFormFieldLabel';
import React from 'react';
import Application from 'shared/types/application';
import Employment from 'shared/types/employment';

type Props = {
  index: number;
  fieldName: keyof Employment;
  children?: React.ReactNode;
  select?: (application: Application) => string;
};

const EmploymentFieldSummary: React.FC<Props> = ({
  index,
  fieldName,
  children,
  select,
}) => {
  const label = useGetApplicationFormFieldLabel(fieldName);
  const { applicationQuery } = useApplicationApi<string>((application) => {
    if (select) {
      return select(application);
    }
    return application.summer_vouchers[index][fieldName]?.toString() ?? '-';
  });
  const value = applicationQuery.isSuccess ? applicationQuery.data : '-';
  return (
    <$EmploymentFieldSummary data-testid={`${fieldName}-${index}`}>
      {children ?? `${label}: ${value}`}
    </$EmploymentFieldSummary>
  );
};

EmploymentFieldSummary.defaultProps = {
  children: null,
  select: undefined,
};

export default EmploymentFieldSummary;
