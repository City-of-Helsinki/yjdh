import {
  useMutation,
  UseMutationResult,
  useQueryClient,
} from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { HandlerEndpoint } from 'benefit-shared/backend-api/backend-api';
import { Company } from 'benefit-shared/types/application';
import { useTranslation } from 'next-i18next';
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
  >({
    mutationKey: ['updateCompanyIndustryCode'],
    mutationFn: ({ companyId, industryCode, industry }) =>
      handleResponse<Company>(
        axios.patch(HandlerEndpoint.COMPANY_INDUSTRY_CODE(companyId), {
          industry_code: industryCode,
          industry: industry ?? '',
        })
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['applications'] });
      void queryClient.invalidateQueries({ queryKey: ['application'] });
    },
    onError: (): void => {
      showErrorToast(
        t(
          'common:review.decisionProposal.errors.industryCodeUpdateFailed.label'
        ),
        t('common:review.decisionProposal.errors.industryCodeUpdateFailed.text')
      );
    },
  });
};

export default useUpdateCompanyIndustryCode;
