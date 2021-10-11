import useApplicationFormField from 'kesaseteli/employer/hooks/application/useApplicationFormField';
import React from 'react';
import { $GridCell } from 'shared/components/forms/section/FormSection.sc';
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
    <$GridCell as="pre" data-testid={`${fieldName}_${index}`}>
      {children ?? getSummaryText()}
    </$GridCell>
  );
};
export default EmploymentFieldSummary;
