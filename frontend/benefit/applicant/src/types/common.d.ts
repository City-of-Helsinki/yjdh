import { Application } from 'benefit/applicant/types';

export type DynamicFormStepComponentProps = {
  data: Application;
};

interface Loading {
  isLoading: true;
}
