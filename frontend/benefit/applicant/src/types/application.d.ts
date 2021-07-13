import { DefaultTheme } from 'styled-components';

import { APPLICATION_FIELDS, APPLICATION_STATUSES } from '../constants';

export interface Employee {
  first_name: string;
  last_name: string;
}

export interface ApplicationData {
  id: string;
  status: APPLICATION_STATUSES;
  last_modified_at: string;
  submitted_at: string;
  application_number: number;
  employee: Employee;
}

interface ApplicationAllowedAction {
  label: string;
  handleAction: () => void;
  Icon?: React.FC;
}

export interface ApplicationListItemData {
  id: string;
  name: string;
  avatar: {
    initials: string;
    color: keyof DefaultTheme['colors'];
  };
  statusText?: string;
  modifiedAt?: string;
  submittedAt?: string;
  applicationNum?: number;
  allowedAction: ApplicationAllowedAction;
}

export type FormFieldsStep1 = {
  [APPLICATION_FIELDS.HAS_COMPANY_OTHER_ADDRESS]: boolean;
  [APPLICATION_FIELDS.COMPANY_OTHER_ADDRESS_STREET]: string;
  [APPLICATION_FIELDS.COMPANY_OTHER_ADDRESS_ZIP]: string;
  [APPLICATION_FIELDS.COMPANY_OTHER_ADDRESS_DISTRICT]: string;
  [APPLICATION_FIELDS.COMPANY_IBAN]: string;
  [APPLICATION_FIELDS.CONTACT_PERSON_FIRST_NAME]: string;
  [APPLICATION_FIELDS.CONTACT_PERSON_LAST_NAME]: string;
  [APPLICATION_FIELDS.CONTACT_PERSON_PHONE]: string;
  [APPLICATION_FIELDS.CONTACT_PERSON_EMAIL]: string;
  [APPLICATION_FIELDS.DE_MINIMIS_AIDS_GRANTED]: string;
  [APPLICATION_FIELDS.COLLECTIVE_BARGAINING_ONGOING]: string;
  [APPLICATION_FIELDS.COLLECTIVE_BARGAINING_INFO]: string;
};

export type FormFieldsStep2 = {
  [APPLICATION_FIELDS.EMPLOYEE_FIRST_NAME]: string;
  [APPLICATION_FIELDS.EMPLOYEE_LAST_NAME]: string;
  [APPLICATION_FIELDS.EMPLOYEE_SSN]: string;
  [APPLICATION_FIELDS.EMPLOYEE_PHONE]: string;
  [APPLICATION_FIELDS.IS_HELSINKI_MUNICIPALITY]: boolean;
  [APPLICATION_FIELDS.PAY_SUBSIDY_GRANTED]: string;
  [APPLICATION_FIELDS.PAY_SUBSIDY_PERCENT]: string;
  [APPLICATION_FIELDS.PAY_SUBSIDY_ADDITIONAL_PERCENT]: string;
};
