import { BENEFIT_TYPES } from 'benefit-shared/constants';
import React from 'react';

interface FieldValues {
  useAlternativeAddress?: boolean | null;
  apprenticeshipProgram?: boolean | null;
  benefitType?: BENEFIT_TYPES | '';
  paySubsidyGranted?: boolean | null;
  associationHasBusinessActivities?: boolean | null;
  startDate?: string;
}

interface Options {
  isFormDirty: boolean;
  clearAlternativeAddressValues?: () => void;
  clearCommissionValues?: () => void;
  clearContractValues?: () => void;
  clearDatesValues?: () => void;
  clearBenefitValues?: () => void;
  clearPaySubsidyValues?: () => void;
  clearDeminimisAids?: () => void;
  setEndDate?: () => void;
}

const UPDATE_DEPENDENTS = 'UPDATE_DEPENDENTS' as const;

interface UpdateAction {
  type: typeof UPDATE_DEPENDENTS;
  payload: EFFECTS[];
}

const createUpdateAction = (payload: EFFECTS[]): UpdateAction => ({
  type: UPDATE_DEPENDENTS,
  payload,
});

enum EFFECTS {
  CLEAR_ALTERNATIVE_ADDRESS_VALUES = 'clearAlternativeAddressValues',
  CLEAR_COMMISSION_VALUES = 'clearCommissionValues',
  CLEAR_CONTRACT_VALUES = 'clearContractValues',
  CLEAR_DATES_VALUES = 'clearDatesValues',
  CLEAR_BENEFIT_VALUES = 'clearBenefitValues',
  CLEAR_PAY_SUBSIDY_VALUES = 'clearPaySubsidyValues',
  CLEAR_DE_MINIMIS_AIDS = 'clearDeMinimisAids',
  SET_END_DATE = 'setEndDate',
}

type State = EFFECTS[];

export const useDependentFieldsEffect = (
  {
    useAlternativeAddress,
    apprenticeshipProgram,
    benefitType,
    paySubsidyGranted,
    associationHasBusinessActivities,
    startDate,
  }: FieldValues,
  {
    isFormDirty,
    clearAlternativeAddressValues,
    clearCommissionValues,
    clearContractValues,
    clearDatesValues,
    clearBenefitValues,
    clearPaySubsidyValues,
    clearDeminimisAids,
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
    if (state.includes(EFFECTS.CLEAR_ALTERNATIVE_ADDRESS_VALUES))
      clearAlternativeAddressValues?.();
  }, [state, clearAlternativeAddressValues]);

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
    if (state.includes(EFFECTS.CLEAR_DE_MINIMIS_AIDS)) clearDeminimisAids?.();
  }, [state, clearDeminimisAids]);

  React.useEffect(() => {
    if (state.includes(EFFECTS.SET_END_DATE)) setEndDate?.();
  }, [state, setEndDate]);

  /** **************************************************** */

  // Effects when useAlternativeAddress changes
  React.useEffect(() => {
    if (!useAlternativeAddress) {
      dispatch(createUpdateAction([EFFECTS.CLEAR_ALTERNATIVE_ADDRESS_VALUES]));
    }
  }, [useAlternativeAddress]);

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

  // Effects when associationHasBusinessActivities changes
  React.useEffect(() => {
    if (associationHasBusinessActivities === false) {
      dispatch(createUpdateAction([EFFECTS.CLEAR_DE_MINIMIS_AIDS]));
    }
  }, [associationHasBusinessActivities]);

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
