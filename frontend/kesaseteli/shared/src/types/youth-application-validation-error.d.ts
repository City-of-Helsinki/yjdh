import YouthApplicationFields from 'kesaseteli-shared/types/youth-application-fields';

type YouthApplicationValidationError = {
  response: {
    status: number;
    data: Record<YouthApplicationFields, string[]>;
  };
};

export default YouthApplicationValidationError;
