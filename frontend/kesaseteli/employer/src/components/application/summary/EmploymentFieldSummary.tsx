import { $EmploymentFieldSummary } from 'kesaseteli/employer/components/application/summary/EmploymentFieldSummary.sc';
import useApplicationFormField from 'kesaseteli/employer/hooks/application/useApplicationFormField';
import React from 'react';
import Employment from 'shared/types/employment';

type Props = {
  index: number;
  fieldName: string;
  children?: React.ReactNode;
};

const EmploymentFieldSummary: React.FC<Props> = ({
  index,
  fieldName,
  children,
}) => {
  const { getSummaryText } = useApplicationFormField(
    `summer_vouchers.${index}.${fieldName as keyof Employment}`
  );
  return (
    <$EmploymentFieldSummary data-testid={`${fieldName}_${index}`}>
      {children ?? getSummaryText()}
    </$EmploymentFieldSummary>
  );
};
export default EmploymentFieldSummary;
