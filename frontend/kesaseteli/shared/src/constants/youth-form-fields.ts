import YouthFormData from 'kesaseteli-shared/types/youth-form-data';

const YOUTH_FORM_FIELDS: Array<keyof YouthFormData> = [
  'first_name',
  'last_name',
  'social_security_number',
  'postcode',
  'phone_number',
  'email',
  'selectedSchool',
  'unlistedSchool',
];

export default YOUTH_FORM_FIELDS;
