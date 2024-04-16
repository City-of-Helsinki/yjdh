import { StepState } from 'hds-react';
import { TFunction } from 'next-i18next';
import { useReducer } from 'react';
import { QueryClient } from 'react-query';

type ApplicationStepperProps = {
  stepState: StepStateType;
  stepperDispatch: React.Dispatch<StepActionType>;
  getStepperHeading: (activeStepIndex: number) => string;
};

interface UpdateAction {
  type: 'completeStep' | 'setActive';
  payload: number;
}

export type Steps = {
  label: string;
  state: StepState;
};

export type StepStateType = {
  activeStepIndex: number;
  steps: Steps[];
};

export type StepActionType = {
  type: 'completeStep' | 'setActive';
  payload: number;
};

const mapCompleteStep = (
  step: Steps,
  stepsTotal: number,
  index: number,
  action: UpdateAction,
  queryClient: QueryClient
): Steps => {
  if (index === action.payload && index !== stepsTotal - 1) {
    // current one but not last one
    return {
      state: StepState.completed,
      label: step.label,
    };
  }
  if (index === action.payload + 1) {
    // next one
    return {
      state: StepState.available,
      label: step.label,
    };
  }
  void queryClient.invalidateQueries('applications');
  void queryClient.invalidateQueries('application');
  return step;
};

const useApplicationStepper = (
  id: string,
  t: TFunction,
  queryClient: QueryClient
): ApplicationStepperProps => {
  const commonReducer =
    (stepsTotal: number) =>
    (state: StepStateType, action: UpdateAction): StepStateType => {
      switch (action.type) {
        case 'completeStep':
          return {
            activeStepIndex:
              action.payload === stepsTotal - 1
                ? stepsTotal - 1
                : action.payload + 1,
            steps: state.steps.map((step, index: number) =>
              mapCompleteStep(step, stepsTotal, index, action, queryClient)
            ),
          };

        case 'setActive':
          return {
            activeStepIndex: action.payload,
            steps: state.steps.map((step, index: number) => {
              if (index === action.payload) {
                void queryClient.invalidateQueries(['applications', id]);
                return {
                  state: StepState.available,
                  label: step.label,
                };
              }
              return step;
            }),
          };

        default:
          throw new Error('Cannot render stepper. Invalid action type.');
      }
    };
  const reducer = commonReducer(3);
  const initialState = {
    activeStepIndex: 0,
    steps: [
      {
        label: t('common:applications.steps.handlingProcess.step1'),
        state: StepState.available,
      },
      {
        label: t('common:applications.steps.handlingProcess.step2'),
        state: StepState.disabled,
      },
      {
        label: t('common:applications.steps.handlingProcess.step3'),
        state: StepState.disabled,
      },
    ],
  };
  const [stepState, stepperDispatch] = useReducer(reducer, initialState);

  const getStepperHeading = (activeStepIndex = 0): string =>
    initialState.steps[activeStepIndex].label;

  return {
    stepState,
    stepperDispatch,
    getStepperHeading,
  };
};

export { useApplicationStepper };
