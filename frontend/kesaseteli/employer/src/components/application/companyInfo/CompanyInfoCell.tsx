import useApplicationApi from 'kesaseteli/employer/hooks/application/useApplicationApi';
import React from 'react';
import LoadingSkeleton from 'react-loading-skeleton';
import { $GridCell } from 'shared/components/forms/section/FormSection.sc';
import Company from 'shared/types/company';

type Props = { field: keyof Company };

const CompanyInfoCell: React.FC<Props> = ({ field }: Props) => {
  const { applicationQuery } = useApplicationApi();
  return (
    <$GridCell aria-labelledby={field} role="gridcell">
      {applicationQuery.isSuccess ? (
        <pre>{applicationQuery.data.company?.[field]}</pre>
      ) : (
        <LoadingSkeleton width="90%" />
      )}
    </$GridCell>
  );
};

export default CompanyInfoCell;
