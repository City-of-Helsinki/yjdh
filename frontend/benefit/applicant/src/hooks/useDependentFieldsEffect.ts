import { BENEFIT_TYPES } from 'benefit/applicant/constants';
import React from 'react';

interface FieldValues {
  apprenticeshipProgram?: boolean | null;
  benefitType?: BENEFIT_TYPES | '';
  paySubsidyGranted?: boolean | null;
  startDate?: string;
}

interface Options {
  isFormDirty: boolean;
  clearCommissionValues?: () => void;
  clearContractValues?: () => void;
  clearDatesValues?: () => void;
  clearBenefitValues?: () => void;
  clearPaySubsidyValues?: () => void;
  setEndDate?: () => void;
}

const UPDATE_DEPENDENTS = 'UPDATE_DEPENDENTS' as const;

interface UpdateAction {
  type: typeof UPDATE_DEPENDENTS;
  payload: string[];
}

const createUpdateAction = (payload: string[]): UpdateAction => ({
  type: UPDATE_DEPENDENTS,
  payload,
});

type State = string[];

enum EFFECTS {
  CLEAR_COMMISSION_VALUES = 'clearCommissionValues',
  CLEAR_CONTRACT_VALUES = 'clearContractValues',
  CLEAR_DATES_VALUES = 'clearDatesValues',
  CLEAR_BENEFIT_VALUES = 'clearBenefitValues',
  CLEAR_PAY_SUBSIDY_VALUES = 'clearPaySubsidyValues',
  SET_END_DATE = 'setEndDate',
}

export const useDependentFieldsEffect = (
  {
    apprenticeshipProgram,
    benefitType,
    paySubsidyGranted,
    startDate,
  }: FieldValues,
  {
    isFormDirty,
    clearCommissionValues,
    clearContractValues,
    clearDatesValues,
    clearBenefitValues,
    clearPaySubsidyValues,
    setEndDate,
  }: Options
): void => {
  const reducer = (state: State, action: UpdateAction): State => {
    if (!isFormDirty) return state;
    if (action.type === UPDATE_DEPENDENTS) return action.payload;
    throw new Error('Invalid action type');
  };

  const [state, dispatch] = React.useReducer(reducer, []);

  // Calling the corresponding callbacks based on the current state
  React.useEffect(() => {
    if (state.includes(EFFECTS.CLEAR_COMMISSION_VALUES))
      clearCommissionValues?.();
  }, [state, clearCommissionValues]);

  React.useEffect(() => {
    if (state.includes(EFFECTS.CLEAR_CONTRACT_VALUES)) clearContractValues?.();
  }, [state, clearContractValues]);

  React.useEffect(() => {
    if (state.includes(EFFECTS.CLEAR_BENEFIT_VALUES)) clearBenefitValues?.();
  }, [state, clearBenefitValues]);

  React.useEffect(() => {
    if (state.includes(EFFECTS.CLEAR_DATES_VALUES)) clearDatesValues?.();
  }, [state, clearDatesValues]);

  React.useEffect(() => {
    if (state.includes(EFFECTS.CLEAR_PAY_SUBSIDY_VALUES))
      clearPaySubsidyValues?.();
  }, [state, clearPaySubsidyValues]);

  React.useEffect(() => {
    if (state.includes(EFFECTS.SET_END_DATE)) setEndDate?.();
  }, [state, setEndDate]);

  /** **************************************************** */

  // Effects when paySubsidyGranted changes
  React.useEffect(() => {
    dispatch(createUpdateAction([EFFECTS.CLEAR_BENEFIT_VALUES]));

    if (!paySubsidyGranted) {
      dispatch(
        createUpdateAction([
          EFFECTS.CLEAR_PAY_SUBSIDY_VALUES,
          EFFECTS.CLEAR_BENEFIT_VALUES,
        ])
      );
    }
  }, [paySubsidyGranted]);

  // Effects when apprenticeshipProgram changes
  React.useEffect(() => {
    if (benefitType === BENEFIT_TYPES.COMMISSION && apprenticeshipProgram) {
      dispatch(createUpdateAction([EFFECTS.CLEAR_BENEFIT_VALUES]));
    }
  }, [apprenticeshipProgram, benefitType]);

  // Effects when benefitType changes
  React.useEffect(() => {
    switch (benefitType) {
      case BENEFIT_TYPES.EMPLOYMENT:
      case BENEFIT_TYPES.SALARY:
        dispatch(
          createUpdateAction([
            EFFECTS.CLEAR_COMMISSION_VALUES,
            EFFECTS.CLEAR_DATES_VALUES,
          ])
        );
        break;

      case BENEFIT_TYPES.COMMISSION:
        dispatch(
          createUpdateAction([
            EFFECTS.CLEAR_CONTRACT_VALUES,
            EFFECTS.CLEAR_DATES_VALUES,
          ])
        );
        break;

      default:
        dispatch(
          createUpdateAction([
            EFFECTS.CLEAR_COMMISSION_VALUES,
            EFFECTS.CLEAR_CONTRACT_VALUES,
            EFFECTS.CLEAR_DATES_VALUES,
          ])
        );
        break;
    }
  }, [benefitType]);

  // Effects when startDate changes
  React.useEffect(() => {
    dispatch(createUpdateAction([EFFECTS.SET_END_DATE]));
  }, [startDate]);
};
