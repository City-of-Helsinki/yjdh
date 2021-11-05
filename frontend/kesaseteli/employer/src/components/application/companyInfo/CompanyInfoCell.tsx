import { $CompanyInfoCell } from 'kesaseteli/employer/components/application/companyInfo/CompanyInfo.sc';
import useApplicationApi from 'kesaseteli/employer/hooks/application/useApplicationApi';
import React from 'react';
import LoadingSkeleton from 'react-loading-skeleton';
import Company from 'shared/types/company';

type Props = { field: keyof Company };

const CompanyInfoCell: React.FC<Props> = ({ field }: Props) => {
  const { applicationQuery } = useApplicationApi();
  return (
    <$CompanyInfoCell aria-labelledby={field} role="gridcell">
      {applicationQuery.isSuccess ? (
        applicationQuery.data.company?.[field]
      ) : (
        <LoadingSkeleton width="90%" />
      )}
    </$CompanyInfoCell>
  );
};

export default CompanyInfoCell;
