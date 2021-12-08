import { Language } from 'shared/i18n/i18n';

type YouthApplication = {
  first_name: string;
  last_name: string;
  social_security_number: string;
  school?: string;
  is_unlisted_school: boolean;
  phone_number: string;
  email: string;
  language: Language;
};

export default YouthApplication;
