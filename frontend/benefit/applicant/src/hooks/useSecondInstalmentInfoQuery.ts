import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { ErrorResponse } from 'benefit/applicant/types/common';
import { ApplicantEndpoint } from 'benefit-shared/backend-api/backend-api';
import useBackendAPI from 'shared/hooks/useBackendAPI';

export type SecondInstalmentInfoData = {
  amount: number | string;
  start_date: string;
  end_date: string;
  employee_first_name: string;
  employee_last_name: string;
  submitted_at: string;
  application_number: string;
};

const useSecondInstalmentInfoQuery = (
  applicationId?: string
): UseQueryResult<SecondInstalmentInfoData, ErrorResponse> => {
  const { axios, handleResponse } = useBackendAPI();

  return useQuery<SecondInstalmentInfoData, ErrorResponse>({
    queryKey: ['secondInstalmentInfo', applicationId],
    queryFn: () =>
      handleResponse<SecondInstalmentInfoData>(
        axios.get(ApplicantEndpoint.SECOND_INSTALMENT_INFO(applicationId ?? ''))
      ),
    enabled: Boolean(applicationId),
  });
};

export default useSecondInstalmentInfoQuery;
