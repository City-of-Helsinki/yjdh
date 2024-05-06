import type { BackendToFrontendField } from 'kesaseteli/handler/types/application-without-ssn-types';

/**
 * Mapping from application without ssn (i.e. social security number)
 * backend fields to frontend fields.
 */
export const BACKEND_TO_FRONTEND_FIELD: BackendToFrontendField = {
  first_name: 'firstName',
  last_name: 'lastName',
  email: 'email',
  school: 'school',
  phone_number: 'phoneNumber',
  postcode: 'postcode',
  language: 'language',
  non_vtj_birthdate: 'nonVtjBirthdate',
  non_vtj_home_municipality: 'nonVtjHomeMunicipality',
  additional_info_description: 'additionalInfoDescription',
};
