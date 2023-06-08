import { BackendEndpoint } from 'kesaseteli-shared/backend-api/backend-api';
import { useMutation, UseMutationResult } from 'react-query';
import useBackendAPI from 'shared/hooks/useBackendAPI';
import { EmploymentBase } from 'shared/types/employment';

type EmploymentArgs = {
  employer_summer_voucher_id: string;
  employee_name: string;
  summer_voucher_serial_number: string;
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
      employee_name,
      summer_voucher_serial_number,
    }: EmploymentArgs) =>
      !(
        employer_summer_voucher_id ||
        employee_name ||
        summer_voucher_serial_number
      )
        ? Promise.reject(
            new Error('Missing employeeName, voucherId or voucherSerialNumber')
          )
        : handleResponse<EmploymentData>(
            axios.post(`${BackendEndpoint.EMPLOYMENT}`, {
              employer_summer_voucher_id,
              employee_name,
              summer_voucher_serial_number,
            })
          )
  );
};

export default useEmploymentQuery;
