import Axios from 'axios';
import useApplicationQuery from 'kesaseteli/employer/hooks/backend/useApplicationQuery';
import useDeleteApplicationQuery from 'kesaseteli/employer/hooks/backend/useDeleteApplicationQuery';
import useEmploymentQuery from 'kesaseteli/employer/hooks/backend/useEmploymentQuery';
import useUpdateApplicationQuery from 'kesaseteli/employer/hooks/backend/useUpdateApplicationQuery';
import ApplicationPersistenceService from 'kesaseteli/employer/services/ApplicationPersistenceService';
import { clearLocalStorage } from 'kesaseteli/employer/utils/localstorage.utils';
import { BackendEndpoint } from 'kesaseteli-shared/backend-api/backend-api';
import noop from 'lodash/noop';
import { useTranslation } from 'next-i18next';
import { ErrorOption } from 'react-hook-form';
import { UseMutationResult, useQueryClient, UseQueryResult } from 'react-query';
import showErrorToast from 'shared/components/toast/show-error-toast';
import useErrorHandler from 'shared/hooks/useErrorHandler';
import useRouterQueryParam from 'shared/hooks/useRouterQueryParam';
import Application from 'shared/types/application';
import DraftApplication from 'shared/types/draft-application';
import { EmploymentBase } from 'shared/types/employment';
import { getFormApplication } from 'shared/utils/application.utils';

export type ApplicationApi<T> = {
  applicationId?: string;
  isRouterLoading: boolean;
  applicationQuery: UseQueryResult<T>;
  updateApplicationQuery: UseMutationResult<
    Application,
    unknown,
    DraftApplication
  >;
  deleteApplicationQuery: UseMutationResult<void, unknown, string>;
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
  deleteApplication: (onSuccess?: () => void | Promise<void>) => void;
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
  const deleteApplicationQuery = useDeleteApplicationQuery();

  /**
   * Handles errors occurring during application updates.
   * If the error is a 400 validation error from Axios, maps the backend validation
   * errors to the form fields. Otherwise, delegates to the default onError handler.
   *
   * @param error - The encountered error object.
   */
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
      onSuccess(getFormApplication(result));
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
      summer_vouchers[index] = {
        ...summer_vouchers[index],
        ...employment,
      };
    }

    return updateApplicationQuery.mutate(
      { ...draftApplication, status: 'draft', summer_vouchers },
      {
        onSuccess: (data) => onSuccess(getFormApplication(data)),
        onError: handleUpdateError,
      }
    );
  };

  const fetchEmployment: ApplicationApi<T>['fetchEmployment'] = (
    draftApplication: DraftApplication,
    employmentIndex: number,
    onSuccess = noop
  ) => {
    const formDataVoucher = draftApplication.summer_vouchers?.[employmentIndex];
    getEmploymentQuery.mutate(
      {
        employee_name: formDataVoucher?.employee_name ?? '',
        summer_voucher_serial_number:
          formDataVoucher?.summer_voucher_serial_number ?? '',
        employer_summer_voucher_id: formDataVoucher?.id ?? '',
      },
      {
        /**
         * Success handler for fetching employment details.
         * Updates the employment data in the draft application and calls the
         * provided success callback.
         *
         * @param data - The employment data.
         */
        onSuccess: (data) => {
          const { employer_summer_voucher_id, ...updatedData } = data;
          const summer_vouchers = [...(draftApplication.summer_vouchers ?? [])];
          if (summer_vouchers.length > employmentIndex) {
            summer_vouchers[employmentIndex] = {
              ...summer_vouchers[employmentIndex],
              ...updatedData,
            };
          }
          void onSuccess({
            ...draftApplication,
            summer_vouchers,
          } as unknown as Application);
        },
        /**
         * Error handler for fetching employment details.
         * Maps specific Axios/HTTP error status codes and error codes to localized
         * toast notification messages.
         */
        onError: (error: unknown) => {
          // eslint-disable-next-line no-console
          console.error(error);

          let errorSuffix = 'error_message';

          if (Axios.isAxiosError(error)) {
            const status = error.response?.status;
            const errorCode = (
              error.response?.data as Record<string, unknown> | undefined
            )?.error_code;

            if (
              status === 400 &&
              errorCode === 'youth_application_not_accepted'
            ) {
              errorSuffix = 'not_accepted_error_message';
            } else if (
              status === 400 &&
              errorCode === 'summer_voucher_already_used'
            ) {
              errorSuffix = 'already_used_error_message';
            } else if (status === 404) {
              errorSuffix = 'not_found_error_message';
            }
          }

          showErrorToast(
            t(
              'common:application.step1.employment_section.fetch_employment_error_title'
            ),
            t(
              `common:application.step1.employment_section.fetch_employment_${errorSuffix}`
            )
          );
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

  const handleMutationSuccess =
    (onSuccess: () => void | Promise<void>) => () => {
      clearLocalStorage(`application-${applicationId}`);
      ApplicationPersistenceService.clearAll();
      void queryClient.invalidateQueries(BackendEndpoint.EMPLOYER_APPLICATIONS);
      return onSuccess();
    };

  const mutateApplication = (
    draftApplication: DraftApplication,
    status: Application['status'],
    onMutationSuccess: (data: Application) => void | Promise<void>
  ): void => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { termsAndConditions, ...applicationData } =
      draftApplication as DraftApplication & { termsAndConditions?: boolean };
    return updateApplicationQuery.mutate(
      {
        ...applicationQuery.data,
        ...applicationData,
        id: applicationId as string,
        status,
      },
      {
        onSuccess: onMutationSuccess,
        onError: handleUpdateError,
      }
    );
  };

  const updateApplication: ApplicationApi<T>['updateApplication'] = (
    draftApplication,
    onSuccess = noop
  ) =>
    mutateApplication(draftApplication, 'draft', (updatedApplication) => {
      void onSuccess(getFormApplication(updatedApplication));
    });

  const sendApplication: ApplicationApi<T>['sendApplication'] = (
    completeApplication,
    onSuccess = noop
  ) =>
    mutateApplication(
      completeApplication,
      'submitted',
      handleMutationSuccess(onSuccess)
    );

  const deleteApplication: ApplicationApi<T>['deleteApplication'] = (
    onSuccess = noop
  ) => {
    if (applicationId) {
      return deleteApplicationQuery.mutate(applicationId, {
        onSuccess: handleMutationSuccess(onSuccess),
        onError,
      });
    }
    return onSuccess();
  };

  return {
    isRouterLoading,
    applicationId,
    applicationQuery,
    updateApplicationQuery,
    deleteApplicationQuery,
    updateApplication,
    sendApplication,
    fetchEmployment,
    addEmployment,
    updateEmployment,
    removeEmployment,
    deleteApplication,
  };
};

export default useApplicationApi;
