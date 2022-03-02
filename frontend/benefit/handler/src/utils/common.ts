import { convertToUIDateFormat } from 'shared/utils/date.utils';

import { APPLICATION_STATUSES } from '../constants';

export const getApplicationStepFromString = (step: string): number => {
  try {
    return parseInt(step.split('_')[1], 10);
  } catch (error) {
    return 1;
  }
};

export const getApplicationStepString = (step: number): string =>
  `step_${step}`;

export const getBatchDataReceived = (
  status: APPLICATION_STATUSES,
  createdAt: string | undefined
): string => {
  if (status === APPLICATION_STATUSES.CANCELLED) {
    return '-';
  }
  if (createdAt) {
    return convertToUIDateFormat(createdAt);
  }
  return '';
};
