import CREATION_ERROR_TYPES from 'kesaseteli/youth/components/constants/creation-error-types';

export type ErrorType = typeof CREATION_ERROR_TYPES[number];

type YouthApplicationCreationError = {
  response: {
    data: {
      message: string;
      code: ErrorType;
    };
  };
};

export default YouthApplicationCreationError;
