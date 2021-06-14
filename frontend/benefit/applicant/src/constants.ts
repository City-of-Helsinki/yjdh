export const IS_CLIENT = typeof window !== 'undefined';

export enum ROUTES {
  HOME = '/',
  APPLICATION_NEW = '/application/new',
  APPLICATION_EDIT = '/application/edit',
}

export enum SUPPORTED_LANGUAGES {
  FI = 'fi',
  SV = 'sv',
  EN = 'en',
}

export const DEFAULT_LANGUAGE = SUPPORTED_LANGUAGES.FI;

export const COMMON_I18N_NAMESPACES = ['common'];

export const PRIVACY_POLICY_LINKS = {
  fi: 'https://www.hel.fi/1',
  en: 'https://www.hel.fi/2',
  sv: 'https://www.hel.fi/3',
};

export enum APPLICATION_STATUSES {
  DRAFT = 'draft',
  INFO_REQUIRED = 'info_required',
  RECEIVED = 'received',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export enum APPLICATION_FIELDS {
  HAS_COMPANY_OTHER_ADDRESS = 'hasCompanyOtherAddress',
  COMPANY_OTHER_ADDRESS_STREET = 'companyOtherAddressStreet',
  COMPANY_OTHER_ADDRESS_ZIP = 'companyOtherAddressZipCode',
  COMPANY_OTHER_ADDRESS_DISTRICT = 'companyOtherAddressPostalDistrict',
  COMPANY_IBAN = 'companyIban',
  CONTACT_PERSON_FIRST_NAME = 'contactPersonFirstName',
  CONTACT_PERSON_LAST_NAME = 'contactPersonLastName',
  CONTACT_PERSON_PHONE = 'contactPersonPhone',
  CONTACT_PERSON_EMAIL = 'contactPersonEmail',
  DE_MINIMIS_AIDS_GRANTED = 'deMinimisAidGranted',
  COLLECTIVE_BARGAINING_ONGOING = 'collectiveBargainingOngoing',
  COLLECTIVE_BARGAINING_INFO = 'collectiveBargainingInfo',
}

export enum DE_MINIMIS_AID_FIELDS {
  GRANTER = 'deMinimisAidGranter',
  AMOUNT = 'deMinimisAidAmount',
  ISSUE_DATE = 'deMinimisAidIssueDate',
}

export const DEFAULT_APPLICATION = {
  [APPLICATION_FIELDS.HAS_COMPANY_OTHER_ADDRESS]: false,
  [APPLICATION_FIELDS.COMPANY_OTHER_ADDRESS_STREET]: '',
  [APPLICATION_FIELDS.COMPANY_OTHER_ADDRESS_ZIP]: '',
  [APPLICATION_FIELDS.COMPANY_OTHER_ADDRESS_DISTRICT]: '',
  [APPLICATION_FIELDS.COMPANY_IBAN]: '',
  [APPLICATION_FIELDS.CONTACT_PERSON_FIRST_NAME]: '',
  [APPLICATION_FIELDS.CONTACT_PERSON_LAST_NAME]: '',
  [APPLICATION_FIELDS.CONTACT_PERSON_PHONE]: '',
  [APPLICATION_FIELDS.CONTACT_PERSON_EMAIL]: '',
  [APPLICATION_FIELDS.DE_MINIMIS_AIDS_GRANTED]: false,
  deMinimisAidGrants: [],
  [APPLICATION_FIELDS.COLLECTIVE_BARGAINING_ONGOING]: '',
  [APPLICATION_FIELDS.COLLECTIVE_BARGAINING_INFO]: '',
};
