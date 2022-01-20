export const getApplicationStepFromString = (step: string): number => {
  try {
    return parseInt(step.split('_')[1], 10);
  } catch (error) {
    return 1;
  }
};

export const getApplicationStepString = (step: number): string =>
  `step_${step}`;
