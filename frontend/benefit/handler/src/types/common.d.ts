import { Application } from 'benefit-shared/types/application';

export interface ErrorData {
  data?: Record<string, string[]>;
}

export type DynamicFormStepComponentProps = {
  data: Application;
};

export type ReviewChildProps = DynamicFormStepComponentProps & {
  translationsBase: string;
};

interface ErrorResponse {
  response: unknown;
}
