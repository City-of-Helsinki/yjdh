import { renderHook } from '@testing-library/react';
import { BENEFIT_TYPES } from 'benefit-shared/constants';

import { useDependentFieldsEffect } from '../useDependentFieldsEffect';

type FieldValues = Parameters<typeof useDependentFieldsEffect>[0];
type Options = Parameters<typeof useDependentFieldsEffect>[1];

const buildCallbacks = (): Required<
  Pick<
    Options,
    | 'clearAlternativeAddressValues'
    | 'clearCommissionValues'
    | 'clearContractValues'
    | 'clearDatesValues'
    | 'clearBenefitValues'
    | 'clearPaySubsidyValues'
    | 'clearDeminimisAids'
    | 'setEndDate'
  >
> => ({
  clearAlternativeAddressValues: jest.fn(),
  clearCommissionValues: jest.fn(),
  clearContractValues: jest.fn(),
  clearDatesValues: jest.fn(),
  clearBenefitValues: jest.fn(),
  clearPaySubsidyValues: jest.fn(),
  clearDeminimisAids: jest.fn(),
  setEndDate: jest.fn(),
});

const renderDependentFieldsEffect = (
  initialValues: FieldValues,
  callbacks: ReturnType<typeof buildCallbacks>,
  isFormDirty = true
): ReturnType<typeof renderHook<void, FieldValues>> =>
  renderHook(
    (values: FieldValues) =>
      useDependentFieldsEffect(values, { isFormDirty, ...callbacks }),
    { initialProps: initialValues }
  );

describe('useDependentFieldsEffect', () => {
  it('does not call any callback on initial mount when nothing indicates a clear', () => {
    const callbacks = buildCallbacks();

    renderDependentFieldsEffect(
      { paySubsidyGranted: true, benefitType: BENEFIT_TYPES.SALARY },
      callbacks
    );

    expect(callbacks.clearAlternativeAddressValues).not.toHaveBeenCalled();
    expect(callbacks.clearPaySubsidyValues).not.toHaveBeenCalled();
    expect(callbacks.clearCommissionValues).not.toHaveBeenCalled();
    expect(callbacks.clearContractValues).not.toHaveBeenCalled();
    expect(callbacks.clearDeminimisAids).not.toHaveBeenCalled();
  });

  it('clears alternative address values when useAlternativeAddress becomes falsy', () => {
    const callbacks = buildCallbacks();

    const { rerender } = renderDependentFieldsEffect(
      { useAlternativeAddress: true },
      callbacks
    );

    expect(callbacks.clearAlternativeAddressValues).not.toHaveBeenCalled();

    rerender({ useAlternativeAddress: false });

    expect(callbacks.clearAlternativeAddressValues).toHaveBeenCalledTimes(1);
  });

  it('does not clear alternative address values when it becomes truthy', () => {
    const callbacks = buildCallbacks();

    const { rerender } = renderDependentFieldsEffect(
      { useAlternativeAddress: false },
      callbacks
    );

    rerender({ useAlternativeAddress: true });

    expect(callbacks.clearAlternativeAddressValues).not.toHaveBeenCalled();
  });

  it('clears benefit and pay subsidy values when paySubsidyGranted becomes falsy', () => {
    const callbacks = buildCallbacks();

    const { rerender } = renderDependentFieldsEffect(
      { paySubsidyGranted: true },
      callbacks
    );

    rerender({ paySubsidyGranted: false });

    expect(callbacks.clearPaySubsidyValues).toHaveBeenCalledTimes(1);
    expect(callbacks.clearBenefitValues).toHaveBeenCalledTimes(1);
  });

  it('clears only benefit values when paySubsidyGranted changes but stays truthy', () => {
    const callbacks = buildCallbacks();

    const { rerender } = renderDependentFieldsEffect(
      { paySubsidyGranted: false },
      callbacks
    );

    jest.clearAllMocks();

    rerender({ paySubsidyGranted: true });

    expect(callbacks.clearBenefitValues).toHaveBeenCalledTimes(1);
    expect(callbacks.clearPaySubsidyValues).not.toHaveBeenCalled();
  });

  it('clears benefit values when apprenticeshipProgram changes with COMMISSION benefit type', () => {
    const callbacks = buildCallbacks();

    const { rerender } = renderDependentFieldsEffect(
      {
        benefitType: BENEFIT_TYPES.COMMISSION,
        apprenticeshipProgram: false,
      },
      callbacks
    );

    rerender({
      benefitType: BENEFIT_TYPES.COMMISSION,
      apprenticeshipProgram: true,
    });

    expect(callbacks.clearBenefitValues).toHaveBeenCalledTimes(1);
  });

  it('does not clear benefit values for apprenticeshipProgram changes on a non-commission benefit type', () => {
    const callbacks = buildCallbacks();

    const { rerender } = renderDependentFieldsEffect(
      {
        benefitType: BENEFIT_TYPES.SALARY,
        apprenticeshipProgram: false,
      },
      callbacks
    );

    rerender({
      benefitType: BENEFIT_TYPES.SALARY,
      apprenticeshipProgram: true,
    });

    expect(callbacks.clearBenefitValues).not.toHaveBeenCalled();
  });

  it('clears de minimis aids when associationHasBusinessActivities becomes exactly false', () => {
    const callbacks = buildCallbacks();

    const { rerender } = renderDependentFieldsEffect(
      { associationHasBusinessActivities: true },
      callbacks
    );

    rerender({ associationHasBusinessActivities: false });

    expect(callbacks.clearDeminimisAids).toHaveBeenCalledTimes(1);
  });

  it('does not clear de minimis aids when associationHasBusinessActivities becomes null', () => {
    const callbacks = buildCallbacks();

    const { rerender } = renderDependentFieldsEffect(
      { associationHasBusinessActivities: true },
      callbacks
    );

    rerender({ associationHasBusinessActivities: null });

    expect(callbacks.clearDeminimisAids).not.toHaveBeenCalled();
  });

  it('clears commission and dates values when benefitType changes to EMPLOYMENT or SALARY', () => {
    const callbacks = buildCallbacks();

    const { rerender } = renderDependentFieldsEffect(
      { benefitType: '' },
      callbacks
    );

    rerender({ benefitType: BENEFIT_TYPES.EMPLOYMENT });

    expect(callbacks.clearCommissionValues).toHaveBeenCalledTimes(1);
    expect(callbacks.clearDatesValues).toHaveBeenCalledTimes(1);
    expect(callbacks.clearContractValues).not.toHaveBeenCalled();
  });

  it('clears contract and dates values when benefitType changes to COMMISSION', () => {
    const callbacks = buildCallbacks();

    const { rerender } = renderDependentFieldsEffect(
      { benefitType: '' },
      callbacks
    );

    rerender({ benefitType: BENEFIT_TYPES.COMMISSION });

    expect(callbacks.clearContractValues).toHaveBeenCalledTimes(1);
    expect(callbacks.clearDatesValues).toHaveBeenCalledTimes(1);
    expect(callbacks.clearCommissionValues).not.toHaveBeenCalled();
  });

  it('clears commission, contract and dates values when benefitType changes to an unhandled value', () => {
    const callbacks = buildCallbacks();

    const { rerender } = renderDependentFieldsEffect(
      { benefitType: BENEFIT_TYPES.SALARY },
      callbacks
    );

    rerender({ benefitType: '' });

    expect(callbacks.clearCommissionValues).toHaveBeenCalledTimes(1);
    expect(callbacks.clearContractValues).toHaveBeenCalledTimes(1);
    expect(callbacks.clearDatesValues).toHaveBeenCalledTimes(1);
  });

  it('sets the end date on mount and again when startDate changes', () => {
    const callbacks = buildCallbacks();

    const { rerender } = renderDependentFieldsEffect(
      { startDate: '2024-01-01' },
      callbacks
    );

    expect(callbacks.setEndDate).toHaveBeenCalledTimes(1);

    rerender({ startDate: '2024-02-01' });

    expect(callbacks.setEndDate).toHaveBeenCalledTimes(2);
  });

  it('does not invoke any clear callback when isFormDirty is false, even on relevant changes', () => {
    const callbacks = buildCallbacks();

    const { rerender } = renderDependentFieldsEffect(
      { useAlternativeAddress: true },
      callbacks,
      false
    );

    rerender({ useAlternativeAddress: false });

    expect(callbacks.clearAlternativeAddressValues).not.toHaveBeenCalled();
  });

  it('does not throw when optional callbacks are undefined', () => {
    expect(() => {
      const { rerender } = renderHook(
        (values: FieldValues) =>
          useDependentFieldsEffect(values, { isFormDirty: true }),
        { initialProps: { useAlternativeAddress: true } as FieldValues }
      );
      rerender({ useAlternativeAddress: false });
    }).not.toThrow();
  });
});
