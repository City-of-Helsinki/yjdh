import { $CompanyInfoCell } from 'kesaseteli/employer/components/application/companyInfo/CompanyInfo.sc';
import useApplicationFormField from 'kesaseteli/employer/hooks/application/useApplicationFormField';
import Company from 'kesaseteli-shared/types/company';
import React from 'react';

type Props = { field: keyof Company };

const CompanyInfoCell: React.FC<Props> = ({ field }: Props) => {
  const { getValue } = useApplicationFormField<string>(`company.${field}`);
  return (
    <$CompanyInfoCell aria-labelledby={field} role="gridcell">
      {getValue() ?? '-'}
    </$CompanyInfoCell>
  );
};

export default CompanyInfoCell;
