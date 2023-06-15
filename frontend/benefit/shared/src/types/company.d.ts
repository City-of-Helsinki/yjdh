import { ORGANIZATION_TYPES } from 'benefit-shared/constants';

export type CompanyData = {
  business_id: string;
  city: string;
  id: string;
  name: string;
  postcode: string;
  street_address: string;
  organization_type: ORGANIZATION_TYPES;
};
