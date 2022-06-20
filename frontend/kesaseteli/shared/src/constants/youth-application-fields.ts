import YouthApplication from '../types/youth-application';

const YOUTH_APPLICATION_FIELDS: Array<keyof YouthApplication> = [
  'first_name',
  'last_name',
  'social_security_number',
  'postcode',
  'school',
  'phone_number',
  'email',
];

export default YOUTH_APPLICATION_FIELDS;
