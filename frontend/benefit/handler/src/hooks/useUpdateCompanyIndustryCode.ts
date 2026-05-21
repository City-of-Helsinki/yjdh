import { AxiosError } from 'axios';
import { HandlerEndpoint } from 'benefit-shared/backend-api/backend-api';
import { Company } from 'benefit-shared/types/application';
import { useTranslation } from 'next-i18next';
import { useMutation, UseMutationResult, useQueryClient } from 'react-query';
import showErrorToast from 'shared/components/toast/show-error-toast';
import useBackendAPI from 'shared/hooks/useBackendAPI';

const useUpdateCompanyIndustryCode = (): UseMutationResult<
  Company,
  AxiosError,
  { companyId: string; industryCode: string; industry?: string }
> => {
  const { axios, handleResponse } = useBackendAPI();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

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
      ),
    {
      onSuccess: () => {
        void queryClient.invalidateQueries('applications');
        void queryClient.invalidateQueries('application');
      },
      onError: (): void => {
        showErrorToast(
          t(
            'common:review.decisionProposal.errors.industryCodeUpdateFailed.label'
          ),
          t(
            'common:review.decisionProposal.errors.industryCodeUpdateFailed.text'
          )
        );
      },
    }
  );
};

export default useUpdateCompanyIndustryCode;
