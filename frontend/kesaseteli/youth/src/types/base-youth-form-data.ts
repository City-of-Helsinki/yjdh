import YouthApplication from 'kesaseteli/youth/types/youth-application';

type BaseYouthFormData = Omit<YouthApplication, 'school' | 'language'> & {
  termsAndConditions: boolean;
};

export default BaseYouthFormData;
