import useApplicationApi from 'kesaseteli/employer/hooks/application/useApplicationApi';
import React from 'react';
import LoadingSkeleton from 'react-loading-skeleton';
import { $GridCell } from 'shared/components/forms/section/FormSection.sc';
import isServerSide from 'shared/server/is-server-side';
import Company from 'shared/types/company';

type Props = { field: keyof Company };

const CompanyInfoCell: React.FC<Props> = ({ field }: Props) => {
  const { application, isError, isLoading } = useApplicationApi();
  return (
    <$GridCell aria-labelledby={field} role="gridcell">
      {isLoading && !isServerSide() && <LoadingSkeleton width="90%" />}
      {(!isLoading && !isError && <pre>{application?.company?.[field]}</pre>) ||
        ''}
    </$GridCell>
  );
};

export default CompanyInfoCell;
