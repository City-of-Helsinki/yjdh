import CREATION_ERROR_CODES from 'kesaseteli/youth/components/constants/creation-error-codes';

type YouthApplicationCreationError = {
  response: {
    data: {
      message: string;
      code: typeof CREATION_ERROR_CODES[number];
    };
  };
};

export default YouthApplicationCreationError;
