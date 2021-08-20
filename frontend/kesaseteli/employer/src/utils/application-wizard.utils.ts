
export const STEPS = [1,2,3];
export const DEFAULT_STEP = 1;

export const getStepNumber = (step: number) : number => STEPS.includes(step) ? step: DEFAULT_STEP
