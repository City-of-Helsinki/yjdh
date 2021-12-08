import School from './School';
import YouthApplication from './youth-application';

type YouthFormData = Omit<YouthApplication, 'school' | 'language'> & {
  termsAndConditions: boolean;
  selected_school?: School;
  unlisted_school?: string;
};

export default YouthFormData;
