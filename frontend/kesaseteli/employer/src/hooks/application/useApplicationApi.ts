import Axios from 'axios';
import useApplicationQuery from 'kesaseteli/employer/hooks/backend/useApplicationQuery';
import useEmploymentQuery from 'kesaseteli/employer/hooks/backend/useEmploymentQuery';
import useUpdateApplicationQuery from 'kesaseteli/employer/hooks/backend/useUpdateApplicationQuery';
import ApplicationPersistenceService from 'kesaseteli/employer/services/ApplicationPersistenceService';
import { clearLocalStorage } from 'kesaseteli/employer/utils/localstorage.utils';
import { BackendEndpoint } from 'kesaseteli-shared/backend-api/backend-api';
import noop from 'lodash/noop';
import { ErrorOption } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { UseMutationResult, useQueryClient, UseQueryResult } from 'react-query';
import showErrorToast from 'shared/components/toast/show-error-toast';
import useErrorHandler from 'shared/hooks/useErrorHandler';
import useRouterQueryParam from 'shared/hooks/useRouterQueryParam';
import Application from 'shared/types/application';
import DraftApplication from 'shared/types/draft-application';
import { EmploymentBase } from 'shared/types/employment';

export type ApplicationApi<T> = {
  applicationId?: string;
  isRouterLoading: boolean;
  applicationQuery: UseQueryResult<T>;
  updateApplicationQuery: UseMutationResult<
    Application,
    unknown,
    DraftApplication
  >;
  updateApplication: (
    application: DraftApplication,
    onSuccess?: (app: Application) => void | Promise<void>
  ) => void;
  sendApplication: (
    application: Application,
    onSuccess?: () => void | Promise<void>
  ) => void;
  fetchEmployment: (
    application: DraftApplication,
    employmentIndex: number,
    onSuccess?: (app: Application) => void | Promise<void>
  ) => void;
  addEmployment: (
    application: DraftApplication,
    onSuccess?: (app: Application) => void | Promise<void>
  ) => Promise<void>;
  updateEmployment: (
    application: DraftApplication,
    index: number,
    employment: EmploymentBase,
    onSuccess?: (app: Application) => void | Promise<void>
  ) => void;
  removeEmployment: (
    application: DraftApplication,
    index: number,
    onSuccess?: () => void | Promise<void>
  ) => void;
};

export type Params = {
  onUpdateSuccess: (application: DraftApplication) => void;
  onSendSuccess: (application: Application) => void;
};

type Options<T> = {
  setBackendValidationError?: (field: keyof T, error: ErrorOption) => void;
  select?: (application: Application) => T;
};

const useApplicationApi = <T = Application>(
  options?: Options<T>
): ApplicationApi<T> => {
  const { select, setBackendValidationError } = { ...options };
  const { value: applicationId, isRouterLoading } = useRouterQueryParam('id');
  const queryClient = useQueryClient();
  const onError = useErrorHandler();
  const { t } = useTranslation();
  const getEmploymentQuery = useEmploymentQuery();

  const applicationQuery = useApplicationQuery<T>(applicationId, select);
  const updateApplicationQuery = useUpdateApplicationQuery(applicationId);

  const handleUpdateError = (error: unknown): void => {
    if (
      setBackendValidationError &&
      Axios.isAxiosError(error) &&
      error.response?.status === 400 &&
      error.response.data &&
      typeof error.response.data === 'object'
    ) {
      Object.keys(error.response.data as Record<string, unknown>).forEach(
        (field) =>
          setBackendValidationError(field as keyof T, {
            type: 'pattern',
          })
      );
    } else {
      onError(error);
    }
  };

  const addEmployment: ApplicationApi<T>['addEmployment'] = async (
    draftApplication: DraftApplication,
    onSuccess: (application: Application) => void = noop
  ) => {
    const summer_vouchers = [...(draftApplication.summer_vouchers ?? []), {}];
    try {
      const result = await updateApplicationQuery.mutateAsync({
        ...draftApplication,
        status: 'draft',
        summer_vouchers,
      });
      onSuccess(result);
    } catch (error) {
      handleUpdateError(error);
    }
  };

  const updateEmployment: ApplicationApi<T>['updateEmployment'] = (
    draftApplication: DraftApplication,
    index: number,
    employment: EmploymentBase,
    onSuccess: (application: Application) => void = noop
  ) => {
    const summer_vouchers = [...(draftApplication.summer_vouchers ?? [])];
    if (summer_vouchers.length > index) {
      summer_vouchers[index] = { ...summer_vouchers[index], ...employment };
    }

    return updateApplicationQuery.mutate(
      { ...draftApplication, status: 'draft', summer_vouchers },
      {
        onSuccess: (data) => onSuccess(data),
        onError: handleUpdateError,
      }
    );
  };

  const fetchEmployment: ApplicationApi<T>['fetchEmployment'] = (
    draftApplication: DraftApplication,
    employmentIndex: number,
    onSuccess = noop
  ) => {
    const formDataVoucher = draftApplication.summer_vouchers[employmentIndex];
    getEmploymentQuery.mutate(
      {
        employee_name: formDataVoucher.employee_name,
        summer_voucher_serial_number:
          formDataVoucher.summer_voucher_serial_number,
        employer_summer_voucher_id: formDataVoucher.id,
      },
      {
        onSuccess: (data) => {
          const { employer_summer_voucher_id, ...updatedData } = data;
          updateEmployment(
            draftApplication,
            employmentIndex,
            updatedData,
            (app) => {
              void onSuccess(app);
            }
          );
        },
        onError: (error: unknown) => {
          // eslint-disable-next-line no-console
          console.error(error);
          if (Axios.isAxiosError(error) && error.response.status === 404) {
            // Not found error
            showErrorToast(
              t(
                'common:application.step1.employment_section.fetch_employment_error_title'
              ),
              t(
                'common:application.step1.employment_section.fetch_employment_not_found_error_message'
              )
            );
          } else {
            // General error
            showErrorToast(
              t(
                'common:application.step1.employment_section.fetch_employment_error_title'
              ),
              t(
                'common:application.step1.employment_section.fetch_employment_error_message'
              )
            );
          }
        },
      }
    );
  };

  const removeEmployment: ApplicationApi<T>['removeEmployment'] = (
    draftApplication: DraftApplication,
    index: number,
    onSuccess: (application: DraftApplication) => void = noop
  ) => {
    const summer_vouchers = (draftApplication.summer_vouchers ?? []).filter(
      (elem, i) => i !== index
    );
    return updateApplicationQuery.mutate(
      { ...draftApplication, status: 'draft', summer_vouchers },
      {
        onSuccess: () => onSuccess(draftApplication),
        onError,
      }
    );
  };

  const updateApplication: ApplicationApi<T>['updateApplication'] = (
    draftApplication: DraftApplication,
    onSuccess = noop
  ) =>
    updateApplicationQuery.mutate(
      { ...draftApplication, status: 'draft' },
      {
        onSuccess: (updatedApplication) => {
          (updatedApplication.summer_vouchers ?? []).forEach(
            (voucher, index) => {
              const formVoucher = draftApplication.summer_vouchers?.[index];
              if (voucher.id && formVoucher) {
                ApplicationPersistenceService.storeVoucherSupplement(
                  voucher.id,
                  {
                    employment_start_date: formVoucher.employment_start_date,
                    employment_end_date: formVoucher.employment_end_date,
                    hired_without_voucher_assessment:
                      formVoucher.hired_without_voucher_assessment,
                  }
                );
              }
            }
          );
          void onSuccess(updatedApplication);
        },
        onError: handleUpdateError,
      }
    );

  const sendApplication: ApplicationApi<T>['sendApplication'] = (
    completeApplication: Application,
    onSuccess = noop
  ) =>
    updateApplicationQuery.mutate(
      { ...completeApplication, status: 'submitted' },
      {
        onSuccess: () => {
          clearLocalStorage(`application-${completeApplication.id}`);
          ApplicationPersistenceService.clearAll();
          void queryClient.invalidateQueries(
            BackendEndpoint.EMPLOYER_APPLICATIONS
          );
          return onSuccess();
        },
        onError: handleUpdateError,
      }
    );

  return {
    isRouterLoading,
    applicationId,
    applicationQuery,
    updateApplicationQuery,
    updateApplication,
    sendApplication,
    fetchEmployment,
    addEmployment,
    updateEmployment,
    removeEmployment,
  };
};

export default useApplicationApi;
