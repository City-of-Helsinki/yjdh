import { Language } from '@frontend/shared/src/i18n/i18n';

type YouthApplication = {
  first_name: string;
  last_name: string;
  social_security_number: string;
  // Non-VTJ birthdate as YYYY-MM-DD string, e.g. "2023-12-31"
  non_vtj_birthdate?: string;
  non_vtj_home_municipality?: string;
  postcode: string;
  school?: string;
  is_unlisted_school: boolean;
  phone_number: string;
  email: string;
  language: Language;
  request_additional_information?: boolean;
};

export default YouthApplication;
