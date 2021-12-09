import School from './School';
import YouthApplication from './youth-application';

type YouthFormData = Omit<YouthApplication, 'school' | 'language'> & {
  termsAndConditions: boolean;
  selectedSchool?: School;
  unlistedSchool?: string;
};

export default YouthFormData;
