import React from 'react';

import { APPLICATION_FIELDS, DE_MINIMIS_AID_FIELDS } from '../constants';

export type DynamicFormStepComponentProps = {
  actions?: React.ReactElement;
};

export type DeMinimisAidGrant = {
  [DE_MINIMIS_AID_FIELDS.GRANTER]: string;
  [DE_MINIMIS_AID_FIELDS.AMOUNT]: number;
  [DE_MINIMIS_AID_FIELDS.ISSUE_DATE]: string;
};

export type Application = {
  [APPLICATION_FIELDS.USE_ALTERNATIVE_ADDRESS]?: boolean;
  [APPLICATION_FIELDS.ALTERNATIVE_COMPANY_STREET_ADDRESS]?: string;
  [APPLICATION_FIELDS.ALTERNATIVE_COMPANY_POSTCODE]?: string;
  [APPLICATION_FIELDS.ALTERNATIVE_COMPANY_CITY]?: string;
  [APPLICATION_FIELDS.COMPANY_BANK_ACCOUNT_NUMBER]?: string;
  [APPLICATION_FIELDS.COMPANY_CONTACT_PERSON_FIRST_NAME]?: string;
  [APPLICATION_FIELDS.COMPANY_CONTACT_PERSON_LAST_NAME]?: string;
  [APPLICATION_FIELDS.COMPANY_CONTACT_PERSON_PHONE_NUMBER]?: string;
  [APPLICATION_FIELDS.COMPANY_CONTACT_PERSON_EMAIL]?: string;
  [APPLICATION_FIELDS.DE_MINIMIS_AID]?: boolean;
  deMinimisAidGrants?: DeMinimisAidGrant[];
  [APPLICATION_FIELDS.CO_OPERATION_NEGOTIATIONS]?: string;
  [APPLICATION_FIELDS.CO_OPERATION_NEGOTIATIONS_DESCRIPTION]?: string;
};

interface Loading {
  isLoading: true;
}
