import { StepActionType } from 'benefit/handler/hooks/useSteps';
import {
  Application,
  ApplicationFields,
} from 'benefit/handler/types/application';

export interface ErrorData {
  data?: Record<string, string[]>;
}

export type DynamicFormStepComponentProps = {
  data: Application;
  dispatchStep: React.Dispatch<StepActionType>;
  fields?: ApplicationFields;
};

export type ReviewChildProps = DynamicFormStepComponentProps & {
  translationsBase: string;
};
interface ErrorResponse {
  response: {
    status: number;
    data: UploadErrorData;
  };
}
interface UploadErrorData {
  non_field_errors?: string[];
  [key: string]: string[] | undefined;
}

export interface DecisionProposalTemplateData {
  id: string;
  name: string;
  template_decision_text: string;
  template_justification_text: string;
}

export interface DecisionProposalTemplate {
  id: string;
  name: string;
  sectionType: string;
  templateDecisionText: string;
  templateJustificationText: string;
}

export type DecisionProposals = DecisionProposalTemplate[];
