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
  response: unknown;
}
