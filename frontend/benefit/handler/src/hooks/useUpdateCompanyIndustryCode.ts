import { AxiosError } from 'axios';
import { HandlerEndpoint } from 'benefit-shared/backend-api/backend-api';
import { Company } from 'benefit-shared/types/application';
import { useMutation, UseMutationResult } from 'react-query';
import useBackendAPI from 'shared/hooks/useBackendAPI';

const useUpdateCompanyIndustryCode = (): UseMutationResult<
  Company,
  AxiosError,
  { companyId: string; industryCode: string; industry?: string }
> => {
  const { axios, handleResponse } = useBackendAPI();

  return useMutation<
    Company,
    AxiosError,
    { companyId: string; industryCode: string; industry?: string }
  >(
    'updateCompanyIndustryCode',
    ({ companyId, industryCode, industry }) =>
      handleResponse<Company>(
        axios.patch(HandlerEndpoint.COMPANY_INDUSTRY_CODE(companyId), {
          industry_code: industryCode,
          industry: industry ?? '',
        })
      )
  );
};

export default useUpdateCompanyIndustryCode;
