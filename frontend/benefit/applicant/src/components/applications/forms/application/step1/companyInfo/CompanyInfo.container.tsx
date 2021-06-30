import useCompanyQuery from 'benefit/applicant/hooks/useCompanyQuery';
import React from 'react';

import CompanyInfo, { CompanyInfoProps } from './CompanyInfo.component';

export type CompanyInfoContainerProps = Omit<CompanyInfoProps, 'data'>;

const CompanyInfoContainer: React.FC<CompanyInfoContainerProps> = (props) => {
  // TODO: replace the hardcoded company ID when auth is implemented
  const { isLoading, error, data } = useCompanyQuery('0877830-0');

  const companyData = {
    name: data?.name ?? '',
    city: data?.city ?? '',
    postcode: data?.postcode ?? '',
    streetAddress: data?.street_address ?? '',
    businessId: data?.business_id ?? '',
  };

  return (
    <CompanyInfo
      {...props}
      loading={isLoading}
      data={companyData}
      error={error?.message}
    />
  );
};

export default CompanyInfoContainer;
