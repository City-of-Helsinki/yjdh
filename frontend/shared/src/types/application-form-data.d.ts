import type Application from './application';

type ApplicationFormData = Application & {
  termsAndConditions?: boolean;
};

export default ApplicationFormData;
