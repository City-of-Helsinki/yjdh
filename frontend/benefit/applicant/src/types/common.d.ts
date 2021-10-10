import { Application } from './application';

export type DynamicFormStepComponentProps = {
  data: Application;
};

interface Loading {
  isLoading: true;
}

interface ErrorResponse {
  response: unknown;
}

interface ErrorData {
  data?: Record<string, string[]>;
}
