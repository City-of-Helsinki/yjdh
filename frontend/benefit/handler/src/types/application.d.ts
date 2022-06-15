import {
  APPLICATION_STATUSES,
  CALCULATION_SALARY_KEYS,
} from 'benefit-shared/constants';
import {
  Application,
  CalculationCommon,
  PaySubsidy,
  TrainingCompensation,
} from 'benefit-shared/types/application';
import { FormikProps } from 'formik';
import { Field } from 'shared/components/forms/fields/types';

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
  monthlyPay?: string;
  vacationMoney?: string;
  otherExpenses?: string;
  stateAidMaxPercentage?: number;
  overrideMonthlyBenefitAmount?: string | null;
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
}

export interface SalaryBenefitCalculatorViewProps {
  data: Application;
}

export interface SalaryBenefitManualCalculatorViewProps {
  formik: FormikProps<CalculationFormProps>;
  fields: {
    [key in CALCULATION_SALARY_KEYS]: Field<CALCULATION_SALARY_KEYS>;
  };
  getErrorMessage: (fieldName: string) => string | undefined;
}

export type HandledAplication = {
  status?:
    | APPLICATION_STATUSES.ACCEPTED
    | APPLICATION_STATUSES.REJECTED
    | APPLICATION_STATUSES.CANCELLED;
  logEntryComment?: string;
  grantedAsDeMinimisAid?: boolean;
};
