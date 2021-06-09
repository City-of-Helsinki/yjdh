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
