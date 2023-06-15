import { StepState } from 'hds-react';
import { useTranslation } from 'next-i18next';
import React from 'react';

export type StepStateType = {
  activeStepIndex: number;
  steps: {
    label: string;
    state: StepState;
  }[];
};

export type StepActionType = {
  type: 'completeStep' | 'setActive';
  payload: number;
};

type ExtendedComponentProps = {
  dispatchStep: React.Dispatch<StepActionType>;
  stepState: StepStateType;
  activeStep: number;
};

const completeStep = (
  stepsTotal: number,
  state: StepStateType,
  action: StepActionType
): StepStateType => {
  const activeStepIndex =
    action.payload === stepsTotal - 1 ? stepsTotal - 1 : action.payload + 1;
  return {
    activeStepIndex,
    steps: state.steps.map((step, index) => {
      if (index === action.payload && index !== stepsTotal - 1) {
        return {
          state: StepState.completed,
          label: step.label,
        };
      }
      if (index === action.payload + 1) {
        return {
          state: StepState.available,
          label: step.label,
        };
      }
      return step;
    }),
  };
};

const setActive = (
  state: StepStateType,
  action: StepActionType
): StepStateType => ({
  activeStepIndex: action.payload,
  steps: state.steps.map((step, index) => {
    if (index === action.payload) {
      return {
        state: StepState.available,
        label: step.label,
      };
    }
    return step;
  }),
});

const commonReducer =
  (stepsTotal: number) => (state: StepStateType, action: StepActionType) => {
    switch (action.type) {
      case 'completeStep':
        return completeStep(stepsTotal, state, action);

      case 'setActive':
        return setActive(state, action);

      default:
        throw new Error('Invalid action');
    }
  };

export const useSteps = (id: string): ExtendedComponentProps => {
  const { t } = useTranslation();

  const reducer = commonReducer(3);
  const activeStep = id ? 1 : 0;
  const initialStepState = {
    activeStepIndex: activeStep,
    steps: [
      {
        label: t('common:applications.steps.step1'),
        state: activeStep === 0 ? StepState.available : StepState.completed,
      },
      {
        label: t('common:applications.steps.step2'),
        state: activeStep === 0 ? StepState.disabled : StepState.available,
      },
      {
        label: t('common:applications.steps.step3'),
        state: StepState.disabled,
      },
    ],
  };
  const [stepState, dispatchStep] = React.useReducer(reducer, initialStepState);
  return {
    stepState,
    dispatchStep,
    activeStep,
  };
};
