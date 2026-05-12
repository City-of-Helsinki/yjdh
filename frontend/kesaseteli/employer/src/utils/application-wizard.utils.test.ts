import { DEFAULT_STEP, getStepNumber, STEPS } from './application-wizard.utils';

describe('getStepNumber', () => {
  it('returns default step when step is undefined', () => {
    expect(getStepNumber()).toBe(DEFAULT_STEP);
  });

  it.each(STEPS)('returns the step when %i is a valid step', (step) => {
    expect(getStepNumber(step)).toBe(step);
  });

  it.each([0, -1, 4, 99])(
    'returns default step when %i is not a valid step',
    (step) => {
      expect(getStepNumber(step)).toBe(DEFAULT_STEP);
    }
  );
});
