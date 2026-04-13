import { BackendEndpoint } from 'kesaseteli-shared/backend-api/backend-api';
import { useMutation, UseMutationResult } from 'react-query';
import useBackendAPI from 'shared/hooks/useBackendAPI';
import { EmploymentBase } from 'shared/types/employment';

type EmploymentArgs = {
  employer_summer_voucher_id: string;
  summer_voucher_serial_number: string;
  employee_birth_date: string;
};

type EmploymentData = EmploymentBase & { employer_summer_voucher_id: string };

const useEmploymentQuery = (): UseMutationResult<
  EmploymentData,
  unknown,
  EmploymentArgs
> => {
  const { axios, handleResponse } = useBackendAPI();
  return useMutation(
    `${BackendEndpoint.EMPLOYMENT}`,
    ({
      employer_summer_voucher_id,
      summer_voucher_serial_number,
      employee_birth_date,
    }: EmploymentArgs) =>
      !employer_summer_voucher_id ||
      !summer_voucher_serial_number ||
      !employee_birth_date
        ? Promise.reject(
            new Error(
              'Missing voucherId, voucherSerialNumber or birthDate'
            )
          )
        : handleResponse<EmploymentData>(
            axios.post(`${BackendEndpoint.EMPLOYMENT}`, {
              employer_summer_voucher_id,
              summer_voucher_serial_number,
              employee_birth_date,
            })
          )
  );
};

export default useEmploymentQuery;
