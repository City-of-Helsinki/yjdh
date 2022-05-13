import Axios from 'axios';
import CREATION_ERROR_TYPES from 'kesaseteli/youth/components/constants/creation-error-types';
import YOUTH_FORM_FIELDS from 'kesaseteli-shared/constants/youth-form-fields';
import YouthApplicationValidationError from 'kesaseteli-shared/types/youth-application-validation-error';
import YouthApplicationCreationError from 'kesaseteli-shared/types/youth-application-creation-error';

export const isYouthApplicationCreationError = (
  error: unknown
): error is YouthApplicationCreationError =>
  Axios.isAxiosError(error) &&
  Boolean(
    error.response &&
      CREATION_ERROR_TYPES.includes(
        (error as YouthApplicationCreationError).response.data.code
      )
  );

export const isYouthApplicationValidationError = (
  error: unknown
): error is YouthApplicationValidationError =>
  Axios.isAxiosError(error) &&
  Boolean(
    error.response &&
      error.response?.status === 400 &&
      YOUTH_FORM_FIELDS.some((field) =>
        Object.keys(
          (error.response?.data ?? {}) as Record<string, unknown>
        ).includes(field as string)
      )
  );
