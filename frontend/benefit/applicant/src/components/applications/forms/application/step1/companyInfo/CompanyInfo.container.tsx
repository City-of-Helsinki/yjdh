import useBackendAPI from 'benefit/applicant/hooks/useBackendAPI';
import React from 'react';
import { useQuery } from 'react-query';

import CompanyInfo, { CompanyInfoProps } from './CompanyInfo.component';

export type CompanyInfoContainerProps = Omit<CompanyInfoProps, 'data'>;

interface CompanyData {
  bank_account_number: string;
  business_id: string;
  city: string;
  company_form: string;
  id: string;
  name: string;
  postcode: string;
  street_address: string;
}

const CompanyInfoContainer: React.FC<CompanyInfoContainerProps> = (props) => {
  const { axios, handleResponse } = useBackendAPI();
  const { isLoading, error, data } = useQuery<CompanyData, { message: string }>(
    'companyData',
    async () => {
      // TODO: replace the hardcoded company ID when auth is implemented
      const res = axios.get<CompanyData>(`/v1/company/0877830-0`);
      return handleResponse(res);
    }
  );

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
