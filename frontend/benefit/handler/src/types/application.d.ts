import {
  APPLICATION_ACTIONS,
  APPLICATION_FIELD_KEYS,
} from 'benefit/handler/constants';
import { ErrorData } from 'benefit/handler/types/common';
import {
  APPLICATION_ORIGINS,
  APPLICATION_STATUSES,
  BENEFIT_TYPES,
  CALCULATION_SALARY_KEYS,
  EMPLOYEE_KEYS,
  ORGANIZATION_TYPES,
  PAY_SUBSIDY_GRANTED,
} from 'benefit-shared/constants';
import {
  ApplicantTerms,
  ApplicantTermsApproval,
  ApplicationAlteration,
  ApproveTerms,
  Batch,
  BenefitAttachment,
  Calculation,
  CalculationCommon,
  Company,
  DecisionProposalDraft,
  DeMinimisAid,
  Employee,
  PaySubsidy,
  TrainingCompensation,
  User,
} from 'benefit-shared/types/application';
import { FormikProps } from 'formik';
import { ButtonTheme } from 'hds-react';
import { Field } from 'shared/components/forms/fields/types';
import { Language } from 'shared/i18n/i18n';

import { ChangeListData } from './changes';

export type ApplicantConsentData = {
  id: string;
  text_fi: string;
  text_en: string;
  text_sv: string;
};

export type ApproveTermsData = {
  terms: string;
  selected_applicant_consents: string[];
};

export type TrainingCompensationData = {
  id: string;
  start_date: string;
  end_date: string;
  monthly_amount: string;
};

// handler

export type CalculationFormProps = {
  monthlyPay?: string | number;
  vacationMoney?: string | number;
  otherExpenses?: string | number;
  stateAidMaxPercentage?: number;
  overrideMonthlyBenefitAmount?: string | number | null;
  overrideMonthlyBenefitAmountComment?: string;
  paySubsidies?: PaySubsidy[];
  trainingCompensations?: TrainingCompensation[];
} & CalculationCommon;

export type ExportApplicationInTimeRangeFormProps = {
  startDate: string;
  endDate: string;
};

export type SubmittedApplication = {
  applicationNumber: number;
  applicantName: string;
};

export interface ApplicationReviewViewProps {
  data: Application;
  isManualCalculator?: boolean;
  isRecalculationRequired?: boolean;
  isUploading?: boolean;
  handleUpload?: (attachment: FormData) => void;
}

export interface UploadProps {
  isUploading?: boolean;
  handleUpload?: (attachment: FormData) => void;
}

export interface SalaryBenefitCalculatorViewProps {
  application: Application;
  isRecalculationRequired: boolean;
  setIsRecalculationRequired: (value: boolean) => void;
  setCalculationErrors: React.Dispatch<React.SetStateAction<ErrorData>>;
  calculationsErrors: ErrorData | undefined | null;
}

export interface SalaryBenefitManualCalculatorViewProps {
  formik: FormikProps<CalculationFormProps>;
  fields: {
    [key in CALCULATION_SALARY_KEYS]: Field<CALCULATION_SALARY_KEYS>;
  };
  getErrorMessage: (fieldName: string) => string | undefined;
}

export type HandledAplication = {
  status?: APPLICATION_STATUSES;
  logEntryComment?: string;
  grantedAsDeMinimisAid?: boolean;
  decisionText?: string;
  justificationText?: string;
  decisionMakerName?: string;
  decisionMakerId?: string;
  signerName?: string;
  signerId?: string;
};

// Handler application

export type Application = {
  id?: string;
  status?: APPLICATION_STATUSES;
  additionalInformationNeededBy?: string;
  applicationNumber?: number;
  bases?: string[];
  company?: Company;
  archived?: boolean;
  createdAt?: string | null;
  modifiedAt?: string | null;
  applicationStep?: string | null;
  attachments?: BenefitAttachment[];
  applicantTermsApproval?: ApplicantTermsApproval;
  applicantTermsApprovalNeeded?: boolean;
  applicantTermsInEffect?: ApplicantTerms;
  approveTerms?: ApproveTerms;
  calculation?: Calculation;
  submittedAt?: string;
  paySubsidies?: PaySubsidy[];
  durationInMonthsRounded?: string;
  logEntryComment?: string;
  trainingCompensations?: TrainingCompensation[];
  batch?: Batch;
  handledAt?: string;
  latestDecisionComment?: string;
  unreadMessagesCount?: number;
  createApplicationForCompany?: string;
  applicationOrigin?: APPLICATION_ORIGINS;
  paperApplicationDate?: string;
  totalDeminimisAmount?: string;
  action?: APPLICATION_ACTIONS;
  changeReason?: string;
  changes?: ChangeListData[];
  decisionProposalDraft?: DecisionProposalDraft;
  handler?: User;
} & ApplicationForm;

export interface ApplicationForm {
  [APPLICATION_FIELD_KEYS.USE_ALTERNATIVE_ADDRESS]?: boolean;
  [APPLICATION_FIELD_KEYS.ALTERNATIVE_COMPANY_STREET_ADDRESS]?: string;
  [APPLICATION_FIELD_KEYS.ALTERNATIVE_COMPANY_CITY]?: string;
  [APPLICATION_FIELD_KEYS.ALTERNATIVE_COMPANY_POSTCODE]?: string;
  [APPLICATION_FIELD_KEYS.COMPANY_DEPARTMENT]?: string;
  [APPLICATION_FIELD_KEYS.COMPANY_BANK_ACCOUNT_NUMBER]?: string;
  [APPLICATION_FIELD_KEYS.ORGANIZATION_TYPE]?: ORGANIZATION_TYPES | null;
  [APPLICATION_FIELD_KEYS.ASSOCIATION_HAS_BUSINESS_ACTIVITIES]?: boolean | null;
  [APPLICATION_FIELD_KEYS.ASSOCIATION_IMMEDIATE_MANAGER_CHECK]?: boolean | null;
  [APPLICATION_FIELD_KEYS.COMPANY_CONTACT_PERSON_FIRST_NAME]?: string;
  [APPLICATION_FIELD_KEYS.COMPANY_CONTACT_PERSON_LAST_NAME]?: string;
  [APPLICATION_FIELD_KEYS.COMPANY_CONTACT_PERSON_PHONE_NUMBER]?: string;
  [APPLICATION_FIELD_KEYS.COMPANY_CONTACT_PERSON_EMAIL]?: string;
  [APPLICATION_FIELD_KEYS.APPLICANT_LANGUAGE]?: Language | '';
  [APPLICATION_FIELD_KEYS.CO_OPERATION_NEGOTIATIONS]?: boolean | null;
  [APPLICATION_FIELD_KEYS.CO_OPERATION_NEGOTIATIONS_DESCRIPTION]?: string;
  [APPLICATION_FIELD_KEYS.DE_MINIMIS_AID]?: boolean | null;
  [APPLICATION_FIELD_KEYS.DE_MINIMIS_AID_SET]?: DeMinimisAid[];
  [APPLICATION_FIELD_KEYS.PAY_SUBSIDY_GRANTED]?: PAY_SUBSIDY_GRANTED | null;
  [APPLICATION_FIELD_KEYS.APPRENTICESHIP_PROGRAM]?: boolean | null;
  [APPLICATION_FIELD_KEYS.BENEFIT_TYPE]?: BENEFIT_TYPES | '';
  [APPLICATION_FIELD_KEYS.START_DATE]?: string | '';
  [APPLICATION_FIELD_KEYS.END_DATE]?: string | '';
  [APPLICATION_FIELD_KEYS.PAPER_APPLICATION_DATE]?: string | '';
  [APPLICATION_FIELD_KEYS.EMPLOYEE]?: Employee;
}

type CompanySearchResult = {
  name: string;
  business_id: string;
};

export type ApplicationFields = Record<
  APPLICATION_FIELD_KEYS,
  Field<APPLICATION_FIELD_KEYS>
> &
  Record<
    APPLICATION_FIELD_KEYS.EMPLOYEE,
    Record<EMPLOYEE_KEYS, Field<APPLICATION_FIELD_KEYS>>
  >;

export type ReviewState = {
  application?: string;
  paper?: boolean;
  company?: boolean;
  companyContactPerson?: boolean;
  deMinimisAids?: boolean;
  coOperationNegotiations?: boolean;
  employee?: boolean;
  paySubsidy?: boolean;
  benefit?: boolean;
  employment?: boolean;
  approval?: boolean;
};

export type ReviewStateData = {
  application?: string;
  paper?: boolean;
  company?: boolean;
  company_contact_person?: boolean;
  de_minimis_aids?: boolean;
  co_operation_negotiations?: boolean;
  employee?: boolean;
  pay_subsidy?: boolean;
  benefit?: boolean;
  employment?: boolean;
  approval?: boolean;
};

export type ApplicationAlterationHandlingForm =
  Partial<ApplicationAlteration> & {
    manualRecoveryAmount: string;
    isManual: boolean;
  };

export type AlterationCsvProps = {
  alteration: ApplicationAlteration;
  values?: ApplicationAlterationHandlingForm;
  theme?: ButtonTheme;
  secondary?: boolean;
  onSubmit?: () => void;
  isAlterationValid?: boolean;
};
