import '@testing-library/jest-dom';

import { QueryClient } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import { StepState } from 'hds-react';

import i18n from '../../../../test/i18n/i18n-test';
import { useApplicationStepper } from '../useHandlingStepper';

jest.mock('@tanstack/react-query', () => ({
  QueryClient: jest.fn(),
}));

const t = i18n.t.bind(i18n);

describe('useApplicationStepper', () => {
  const invalidateQueries = jest.fn();
  const mockQueryClient = { invalidateQueries } as unknown as QueryClient;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initialises with step 0 active and all labels set', () => {
    const { result } = renderHook(() =>
      useApplicationStepper('app-1', t, mockQueryClient)
    );

    expect(result.current.stepState.activeStepIndex).toBe(0);
    expect(result.current.stepState.steps).toHaveLength(3);
    expect(result.current.stepState.steps[0].state).toBe(StepState.available);
    expect(result.current.stepState.steps[1].state).toBe(StepState.disabled);
    expect(result.current.stepState.steps[2].state).toBe(StepState.disabled);
  });

  it('completeStep moves activeStepIndex to next step', () => {
    const { result } = renderHook(() =>
      useApplicationStepper('app-1', t, mockQueryClient)
    );

    act(() => {
      result.current.stepperDispatch({ type: 'completeStep', payload: 0 });
    });

    expect(result.current.stepState.activeStepIndex).toBe(1);
    expect(result.current.stepState.steps[0].state).toBe(StepState.completed);
    expect(result.current.stepState.steps[1].state).toBe(StepState.available);
  });

  it('setActive changes the active step', () => {
    const { result } = renderHook(() =>
      useApplicationStepper('app-1', t, mockQueryClient)
    );

    act(() => {
      result.current.stepperDispatch({ type: 'completeStep', payload: 0 });
    });

    act(() => {
      result.current.stepperDispatch({ type: 'setActive', payload: 0 });
    });

    expect(result.current.stepState.activeStepIndex).toBe(0);
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['applications', 'app-1'],
    });
  });

  it('completeStep on last step keeps activeStepIndex at last', () => {
    const { result } = renderHook(() =>
      useApplicationStepper('app-1', t, mockQueryClient)
    );

    act(() => {
      result.current.stepperDispatch({ type: 'completeStep', payload: 2 });
    });

    expect(result.current.stepState.activeStepIndex).toBe(2);
  });

  it('getStepperHeading returns the label for the given index', () => {
    const { result } = renderHook(() =>
      useApplicationStepper('app-1', t, mockQueryClient)
    );

    const heading = result.current.getStepperHeading(0);
    expect(heading).toBe(result.current.stepState.steps[0].label);
  });

  it('throws on unknown action type', () => {
    const { result } = renderHook(() =>
      useApplicationStepper('app-1', t, mockQueryClient)
    );

    expect(() => {
      act(() => {
        result.current.stepperDispatch({
          type: 'unknown' as never,
          payload: 0,
        });
      });
    }).toThrow('Cannot render stepper. Invalid action type.');
  });
});
